using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    // What the AI reads for a question: a small case whole, a large one only the related passages;
    // answers cite their passages (file and page), and follow-up questions use the conversation
    [Collection(ApiCollection.Name)]
    public class ChatRetrievalTests : IDisposable
    {
        private const string RentLine = "The monthly rent is 4500 shekels paid to landlord Yossi Levi";
        private const int RentPage = 7;

        private readonly LegalTrackApiFactory _factory;

        public ChatRetrievalTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.OpenAi.StatusCode = HttpStatusCode.OK;
        }

        public void Dispose() => _factory.OpenAi.Respond = null;

        // 12 pages of unrelated text (well over the 30,000 characters sent whole), the rent on page 7
        private static byte[] LargeLease()
        {
            var words = "weather sunny cloud river mountain forest garden bicycle coffee window music pencil orange planet".Split(' ');
            var random = new Random(7);
            return ApiSession.CreatePdfPages(Enumerable.Range(1, 12).Select(page =>
                Enumerable.Range(0, 40).Select(line =>
                    page == RentPage && line == 20
                        ? RentLine
                        : string.Join(" ", Enumerable.Range(0, 14).Select(_ => words[random.Next(words.Length)])))
                .ToArray()));
        }

        private static string Context(JsonElement request) => FakeOpenAiHandler.MessageText(request, 1);

        private static bool IsSearchQueryRequest(JsonElement request) =>
            FakeOpenAiHandler.MessageText(request, 0).StartsWith("Turn the user's last question");

        // Answers citing the passage that holds the text; a search-query request gets the question back
        private static string CiteWhere(JsonElement request, string text)
        {
            var messages = request.GetProperty("messages");
            if (IsSearchQueryRequest(request))
                return FakeOpenAiHandler.MessageText(request, messages.GetArrayLength() - 1);
            var number = Regex.Matches(Context(request), @"^\[(\d+)\] [^\n]*\n([^\[]*)", RegexOptions.Multiline)
                .First(m => m.Groups[2].Value.Contains(text)).Groups[1].Value;
            return $"Found it [{number}].";
        }

        private void ClearRequests()
        {
            while (_factory.OpenAi.RequestBodies.TryDequeue(out _)) { }
            while (_factory.OpenAi.EmbeddingBodies.TryDequeue(out _)) { }
        }

        private async Task<JsonElement> AskAsync(ApiSession session, int folderId, string question)
        {
            var response = await session.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            return await response.Content.ReadFromJsonAsync<JsonElement>();
        }

        private JsonElement LastChatRequest() => JsonSerializer.Deserialize<JsonElement>(_factory.OpenAi.RequestBodies.Last());

        [Fact]
        public async Task Small_case_is_sent_whole_and_the_answer_cites_file_and_page()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var (documentId, objectKey) = await admin.UploadFileAsync(folderId,
                ApiSession.CreatePdfPages(new[] { new[] { "Lease signed in Haifa" }, new[] { "Deposit is 9000 shekels" } }),
                "lease.pdf", "application/pdf");
            _factory.OpenAi.Respond = request => CiteWhere(request, "Deposit");
            ClearRequests();

            var answer = await AskAsync(admin, folderId, "What is the deposit?");

            // Both pages were sent, labeled with their page, and nothing was embedded
            var context = Context(LastChatRequest());
            Assert.Contains("[1] lease.pdf, page 1\nLease signed in Haifa", context);
            Assert.Contains("[2] lease.pdf, page 2\nDeposit is 9000 shekels", context);
            Assert.Empty(_factory.OpenAi.EmbeddingBodies);

            var source = Assert.Single(answer.GetProperty("sources").EnumerateArray());
            Assert.Equal(2, source.GetProperty("number").GetInt32());
            Assert.Equal(documentId, source.GetProperty("documentId").GetInt32());
            Assert.Equal("lease.pdf", source.GetProperty("documentName").GetString());
            Assert.Equal(objectKey, source.GetProperty("objectKey").GetString());
            Assert.Equal(2, source.GetProperty("page").GetInt32());

            // The history keeps the sources
            var saved = Assert.Single((await admin.GetJsonAsync($"/api/chat/{folderId}")).EnumerateArray());
            Assert.Equal(2, Assert.Single(saved.GetProperty("sources").EnumerateArray()).GetProperty("page").GetInt32());
        }

        [Fact]
        public async Task Large_case_sends_only_the_passages_related_to_the_question()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var (documentId, _) = await admin.UploadFileAsync(folderId, LargeLease(), "lease.pdf", "application/pdf");
            _factory.OpenAi.Respond = request => CiteWhere(request, "4500");
            ClearRequests();

            var answer = await AskAsync(admin, folderId, "How much is the monthly rent?");

            var request = LastChatRequest();
            var context = Context(request);
            Assert.Contains(RentLine, context);
            Assert.True(context.Length < 15_000, $"Sent {context.Length} characters");
            Assert.Contains("only the passages most related", FakeOpenAiHandler.MessageText(request, 0));
            Assert.Equal(RentPage, Assert.Single(answer.GetProperty("sources").EnumerateArray()).GetProperty("page").GetInt32());

            // The passages are stored with their page, so the next question only embeds the question
            await using (var db = _factory.CreateDbContext())
            {
                var chunks = await db.DocumentChunks.Where(c => c.DocumentId == documentId).ToListAsync();
                Assert.True(chunks.Count > 20);
                Assert.Contains(chunks, c => c.Page == RentPage && c.Text.Contains(RentLine));
            }
            ClearRequests();
            await AskAsync(admin, folderId, "Who is the landlord?");
            var embedded = JsonSerializer.Deserialize<JsonElement>(Assert.Single(_factory.OpenAi.EmbeddingBodies));
            Assert.Single(embedded.GetProperty("input").EnumerateArray());
        }

        [Fact]
        public async Task Follow_up_question_is_searched_and_answered_with_the_conversation()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            await admin.UploadFileAsync(folderId, LargeLease(), "lease.pdf", "application/pdf");
            _factory.OpenAi.Respond = request => CiteWhere(request, "4500");
            await AskAsync(admin, folderId, "How much is the monthly rent?");

            // "it" alone finds nothing; the rewritten query names what it refers to
            _factory.OpenAi.Respond = request =>
                IsSearchQueryRequest(request)
                    ? "who receives the monthly rent payment landlord"
                    : CiteWhere(request, "Yossi Levi");
            ClearRequests();
            var answer = await AskAsync(admin, folderId, "Who receives it?");

            var calls = _factory.OpenAi.RequestBodies.Select(b => JsonSerializer.Deserialize<JsonElement>(b)).ToList();
            Assert.Equal(2, calls.Count);
            // The search call saw the earlier question
            Assert.Contains(calls[0].GetProperty("messages").EnumerateArray(),
                m => m.GetProperty("content").GetString() == "How much is the monthly rent?");

            // The answer call: instructions, passages, the earlier question and answer, then the new question
            var messages = calls[1].GetProperty("messages").EnumerateArray().ToList();
            Assert.Contains(RentLine, messages[1].GetProperty("content").GetString());
            Assert.Equal("user", messages[2].GetProperty("role").GetString());
            Assert.Equal("How much is the monthly rent?", messages[2].GetProperty("content").GetString());
            Assert.Equal("assistant", messages[3].GetProperty("role").GetString());
            Assert.Equal("Who receives it?", messages[^1].GetProperty("content").GetString());
            Assert.Single(answer.GetProperty("sources").EnumerateArray());
        }

        [Fact]
        public async Task Only_the_last_three_questions_are_sent_as_history()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            await admin.UploadPdfAsync(folderId, "Short case");
            for (int i = 1; i <= 4; i++)
                await AskAsync(admin, folderId, $"Question {i}");

            ClearRequests();
            await AskAsync(admin, folderId, "Question 5");
            var contents = LastChatRequest().GetProperty("messages").EnumerateArray()
                .Select(m => m.GetProperty("content").GetString()).ToList();
            Assert.DoesNotContain("Question 1", contents);
            Assert.Contains("Question 2", contents);
            Assert.Contains("Question 4", contents);
            // A small case needs no search query, so no extra call
            Assert.Single(_factory.OpenAi.RequestBodies);
        }

        [Fact]
        public async Task Citations_of_passages_that_do_not_exist_are_ignored()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            await admin.UploadPdfAsync(folderId, "Short case");
            _factory.OpenAi.Respond = _ => "See [1], [1] again, [7] and [99999999999].";

            var answer = await AskAsync(admin, folderId, "Anything?");
            Assert.Equal(1, Assert.Single(answer.GetProperty("sources").EnumerateArray()).GetProperty("number").GetInt32());
        }
    }
}
