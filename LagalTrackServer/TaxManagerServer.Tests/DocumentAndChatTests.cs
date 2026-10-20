using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    [Collection(ApiCollection.Name)]
    public class DocumentAndChatTests
    {
        private readonly LegalTrackApiFactory _factory;

        public DocumentAndChatTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.OpenAi.StatusCode = HttpStatusCode.OK;
        }

        [Fact]
        public async Task Lawyer_uploads_downloads_renames_and_deletes_a_document()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var lawyer = await admin.InviteAndRegisterLawyerAsync(_factory);
            var folderId = await lawyer.CreateFolderAsync(await lawyer.CreateClientAsync());

            // Hebrew file name: the stored key contains %XX sequences
            var (documentId, objectKey) = await lawyer.UploadPdfAsync(folderId, "Signed lease agreement", "חוזה שכירות.pdf");
            Assert.True(_factory.S3.Objects.ContainsKey(objectKey));

            var folder = await lawyer.GetJsonAsync($"/api/folders/{folderId}");
            var doc = Assert.Single(folder.GetProperty("documents").EnumerateArray());
            Assert.Equal("חוזה שכירות.pdf", doc.GetProperty("documentName").GetString());

            // The admin of the same office sees it too
            Assert.Single((await admin.GetJsonAsync("/api/document")).EnumerateArray());

            var download = await lawyer.GetJsonAsync($"/api/s3/presigned-download-url?objectKey={Uri.EscapeDataString(objectKey)}");
            Assert.Contains("fake-s3.test", download.GetProperty("url").GetString());

            var file = await lawyer.Http.GetAsync($"/api/s3/download?objectKey={Uri.EscapeDataString(objectKey)}");
            await ApiAssert.StatusAsync(HttpStatusCode.OK, file);

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent,
                await lawyer.Http.PutAsJsonAsync($"/api/document/{documentId}", new { documentName = "lease.pdf", folderId }));
            Assert.Equal("lease.pdf", (await lawyer.GetJsonAsync($"/api/document/{documentId}")).GetProperty("documentName").GetString());

            // Delete the way the React app does: DELETE /s3/delete?fileKey=<stored key>
            await ApiAssert.StatusAsync(HttpStatusCode.NoContent,
                await lawyer.Http.DeleteAsync($"/api/s3/delete?fileKey={Uri.EscapeDataString(objectKey)}"));
            Assert.False(_factory.S3.Objects.ContainsKey(objectKey));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await lawyer.Http.GetAsync($"/api/document/{documentId}"));
        }

        [Fact]
        public async Task Upload_rejects_empty_file_and_unknown_folder()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);

            using var empty = new MultipartFormDataContent
            {
                { new ByteArrayContent(Array.Empty<byte>()), "file", "empty.pdf" },
                { new StringContent("1"), "folderId" }
            };
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await admin.Http.PostAsync("/api/s3/upload", empty));

            using var unknownFolder = new MultipartFormDataContent
            {
                { new ByteArrayContent(ApiSession.CreatePdf("x")), "file", "x.pdf" },
                { new StringContent("999999"), "folderId" }
            };
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await admin.Http.PostAsync("/api/s3/upload", unknownFolder));
        }

        [Fact]
        public async Task Chat_answers_from_case_documents_and_keeps_history()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            await admin.UploadPdfAsync(folderId, "The contract was signed on 5 May 2024 in Haifa");
            while (_factory.OpenAi.RequestBodies.TryDequeue(out _)) { }

            var ask = await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "When was the contract signed?" });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, ask);
            Assert.Equal(_factory.OpenAi.Answer, (await ask.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("answer").GetString());

            // The PDF text extracted by the server was sent to the AI as context
            Assert.True(_factory.OpenAi.RequestBodies.TryDequeue(out var sent));
            Assert.Contains("signed on 5 May 2024 in Haifa", sent);

            var message = Assert.Single((await admin.GetJsonAsync($"/api/chat/{folderId}")).EnumerateArray());
            Assert.Equal("When was the contract signed?", message.GetProperty("question").GetString());

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "" }));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await admin.Http.PostAsJsonAsync("/api/chat/999999", new { question = "?" }));
        }

        [Fact]
        public async Task Chat_reports_ai_failure_as_503()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            _factory.OpenAi.StatusCode = HttpStatusCode.Unauthorized;
            try
            {
                var ask = await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "Hello?" });
                await ApiAssert.StatusAsync(HttpStatusCode.ServiceUnavailable, ask);
                Assert.Empty((await admin.GetJsonAsync($"/api/chat/{folderId}")).EnumerateArray());
            }
            finally
            {
                _factory.OpenAi.StatusCode = HttpStatusCode.OK;
            }
        }

        [Fact]
        public async Task Deleting_a_case_removes_its_files_documents_and_chat()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var (documentId, objectKey) = await admin.UploadPdfAsync(folderId, "Some evidence");
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "Summary?" }));

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.DeleteAsync($"/api/folders/{folderId}"));

            Assert.False(_factory.S3.Objects.ContainsKey(objectKey));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await admin.Http.GetAsync($"/api/document/{documentId}"));
            await using var db = _factory.CreateDbContext();
            Assert.False(await db.ChatMessages.AnyAsync(m => m.FolderId == folderId));
        }
    }
}
