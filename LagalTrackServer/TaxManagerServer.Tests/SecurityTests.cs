using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using TaxManagerServer.Data;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    [Collection(ApiCollection.Name)]
    public class SecurityTests
    {
        private readonly LegalTrackApiFactory _factory;

        public SecurityTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
        }

        [Theory]
        [InlineData("GET", "/api/users")]
        [InlineData("GET", "/api/users/1")]
        [InlineData("GET", "/api/users/someone@example.com")]
        [InlineData("DELETE", "/api/users/1")]
        [InlineData("GET", "/api/client")]
        [InlineData("DELETE", "/api/client/1")]
        [InlineData("GET", "/api/group")]
        [InlineData("GET", "/api/folders")]
        [InlineData("GET", "/api/document")]
        [InlineData("GET", "/api/chat/1")]
        [InlineData("POST", "/api/chat/1")]
        [InlineData("GET", "/api/s3/download?objectKey=x")]
        [InlineData("GET", "/api/s3/presigned-download-url?objectKey=x")]
        [InlineData("DELETE", "/api/s3/delete?fileKey=x")]
        [InlineData("GET", "/api/s3/presigned-upload-url?folderId=1&fileName=x.pdf")]
        [InlineData("POST", "/api/s3/notify-upload")]
        [InlineData("POST", "/api/invite/invite-lawyer")]
        public async Task Protected_endpoints_require_login(string method, string url)
        {
            var request = new HttpRequestMessage(new HttpMethod(method), url);
            if (method == "POST")
                request.Content = JsonContent.Create(new { question = "x", email = "a@b.com" });

            var response = await _factory.CreateClient().SendAsync(request);
            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, response);
        }

        [Fact]
        public async Task One_office_cannot_see_or_change_another_offices_data()
        {
            var officeA = await ApiSession.RegisterOfficeAsync(_factory, "Office A");
            var clientId = await officeA.CreateClientAsync("Secret Client");
            var folderId = await officeA.CreateFolderAsync(clientId, "Secret Case");
            var (documentId, objectKey) = await officeA.UploadPdfAsync(folderId, "Confidential");
            var adminAId = (await officeA.GetJsonAsync($"/api/users/{officeA.Email}")).GetProperty("userId").GetInt32();

            var officeB = await ApiSession.RegisterOfficeAsync(_factory, "Office B");
            var key = Uri.EscapeDataString(objectKey);

            // Lists are empty for office B
            Assert.Empty((await officeB.GetJsonAsync("/api/client")).EnumerateArray());
            Assert.Empty((await officeB.GetJsonAsync("/api/folders")).EnumerateArray());
            Assert.Empty((await officeB.GetJsonAsync("/api/document")).EnumerateArray());
            Assert.Single((await officeB.GetJsonAsync("/api/users")).EnumerateArray());

            // Direct access by id is refused
            foreach (var url in new[]
            {
                $"/api/client/{clientId}", $"/api/folders/{folderId}", $"/api/folders/by-client/{clientId}",
                $"/api/document/{documentId}", $"/api/chat/{folderId}", $"/api/users/{adminAId}", $"/api/users/{officeA.Email}",
                $"/api/s3/download?objectKey={key}", $"/api/s3/presigned-download-url?objectKey={key}"
            })
            {
                await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await officeB.Http.GetAsync(url));
            }

            await ApiAssert.StatusAsync(HttpStatusCode.NotFound,
                await officeB.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "What is in the file?" }));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound,
                await officeB.Http.PutAsJsonAsync($"/api/client/{clientId}", new { fullName = "Changed" }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await officeB.Http.PostAsJsonAsync("/api/folders", new { folderName = "Mine now", clientId }));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await officeB.Http.DeleteAsync($"/api/s3/delete?fileKey={key}"));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await officeB.Http.DeleteAsync($"/api/folders/{folderId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await officeB.Http.DeleteAsync($"/api/client/{clientId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await officeB.Http.DeleteAsync($"/api/users/{adminAId}"));

            // Office A's data is untouched
            Assert.True(_factory.S3.Objects.ContainsKey(objectKey));
            Assert.Equal("Secret Client", (await officeA.GetJsonAsync($"/api/client/{clientId}")).GetProperty("fullName").GetString());
        }

        [Fact]
        public async Task Schema_upgrade_adds_client_office_column_to_an_old_database()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync("Legacy Client");
            await admin.CreateFolderAsync(clientId);

            await using var db = _factory.CreateDbContext();
            var groupId = (await db.Clients.SingleAsync(c => c.Id == clientId)).GroupId;

            // Simulate the deployed database before this change: no Clients.GroupId column
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE `Clients` DROP COLUMN `GroupId`");
            try
            {
                await SchemaUpgrader.UpgradeAsync(db);
                await SchemaUpgrader.UpgradeAsync(db); // safe to run again

                db.ChangeTracker.Clear();
                Assert.Equal(groupId, (await db.Clients.SingleAsync(c => c.Id == clientId)).GroupId);
            }
            finally
            {
                await SchemaUpgrader.UpgradeAsync(db);
            }
        }
    }
}
