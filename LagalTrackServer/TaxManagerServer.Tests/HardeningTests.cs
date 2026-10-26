using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Data;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    // Unique emails and foreign keys, the login attempt limit, cached document text, Word and image files
    [Collection(ApiCollection.Name)]
    public class HardeningTests
    {
        private readonly LegalTrackApiFactory _factory;

        public HardeningTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.OpenAi.StatusCode = HttpStatusCode.OK;
        }

        // Each test logs in from its own address, so the per-IP count of one test doesn't affect another
        private HttpClient ClientFrom(string ip)
        {
            var http = _factory.CreateClient();
            http.DefaultRequestHeaders.Add("X-Forwarded-For", ip);
            return http;
        }

        private static string RandomIp() => $"10.{Random.Shared.Next(256)}.{Random.Shared.Next(256)}.{Random.Shared.Next(1, 255)}";

        [Fact]
        public async Task Database_refuses_a_second_user_with_the_same_email_in_any_case()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            await using var db = _factory.CreateDbContext();
            db.Users.Add(new User { UserName = "Copy", Email = admin.Email.ToUpperInvariant(), Password = "x" });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }

        [Fact]
        public async Task Database_refuses_rows_that_point_at_missing_records()
        {
            await using var db = _factory.CreateDbContext();
            db.ChatMessages.Add(new ChatMessage { FolderId = 999999, Question = "?", Answer = "!" });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }

        [Fact]
        public async Task Schema_upgrade_cleans_orphans_and_restores_a_missing_foreign_key()
        {
            await using var db = _factory.CreateDbContext();
            // Simulate the deployed database: no constraint, and a chat message whose case was deleted
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE `ChatMessages` DROP FOREIGN KEY `FK_ChatMessages_Folders_FolderId`");
            await db.Database.ExecuteSqlRawAsync("INSERT INTO `ChatMessages` (`FolderId`, `Question`, `Answer`, `CreatedAt`) VALUES (987654, 'q', 'a', NOW())");

            await SchemaUpgrader.UpgradeAsync(db);
            // Running again changes nothing
            await SchemaUpgrader.UpgradeAsync(db);

            Assert.False(await db.ChatMessages.AnyAsync(m => m.FolderId == 987654));
            db.ChatMessages.Add(new ChatMessage { FolderId = 987654, Question = "?", Answer = "!" });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }

        [Fact]
        public async Task Schema_upgrade_makes_email_unique_only_when_there_are_no_duplicates()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            await using var db = _factory.CreateDbContext();
            // The deployed database before this change: Email is longtext with no index
            await db.Database.ExecuteSqlRawAsync("DROP INDEX `IX_Users_Email` ON `Users`");
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE `Users` MODIFY `Email` longtext CHARACTER SET utf8mb4 NOT NULL");
            await db.Database.ExecuteSqlRawAsync(
                "INSERT INTO `Users` (`UserName`, `Email`, `Password`, `IsAdmin`) VALUES ('Dup', {0}, 'x', 0)", admin.Email);
            try
            {
                // Duplicates can't be merged automatically: the upgrade skips the index instead of failing
                await SchemaUpgrader.UpgradeAsync(db);
                Assert.Equal(0, await UniqueEmailIndexCountAsync(db));
            }
            finally
            {
                await db.Database.ExecuteSqlRawAsync("DELETE FROM `Users` WHERE `UserName` = 'Dup' AND `Email` = {0}", admin.Email);
                await SchemaUpgrader.UpgradeAsync(db);
            }
            Assert.Equal(1, await UniqueEmailIndexCountAsync(db));
        }

        private static async Task<int> UniqueEmailIndexCountAsync(TaxManager.Data.DataContext db) =>
            await db.Database.SqlQueryRaw<int>(
                "SELECT COUNT(*) AS `Value` FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Email' AND NON_UNIQUE = 0").SingleAsync();

        [Fact]
        public async Task Too_many_wrong_passwords_lock_the_email_for_a_while()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var http = ClientFrom(RandomIp());

            for (var i = 0; i < 4; i++)
                await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized,
                    await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Wr0ngPass" }));

            // The 5th failure locks the email
            var locked = await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Wr0ngPass" });
            await ApiAssert.StatusAsync(HttpStatusCode.TooManyRequests, locked);
            Assert.True(locked.Headers.RetryAfter?.Delta > TimeSpan.Zero);
            Assert.True((await locked.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("retryAfterSeconds").GetInt32() > 0);

            // Even the right password is refused now, and also from another address
            await ApiAssert.StatusAsync(HttpStatusCode.TooManyRequests,
                await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Passw0rd" }));
            await ApiAssert.StatusAsync(HttpStatusCode.TooManyRequests,
                await ClientFrom(RandomIp()).PostAsJsonAsync("/api/login", new { email = admin.Email.ToUpperInvariant(), password = "Passw0rd" }));
        }

        [Fact]
        public async Task A_successful_login_clears_the_failed_count()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var http = ClientFrom(RandomIp());

            for (var round = 0; round < 2; round++)
            {
                for (var i = 0; i < 4; i++)
                    await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized,
                        await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Wr0ngPass" }));
                await ApiAssert.StatusAsync(HttpStatusCode.OK,
                    await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Passw0rd" }));
            }
        }

        [Fact]
        public async Task Guessing_across_many_emails_from_one_address_is_blocked()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var http = ClientFrom(RandomIp());

            for (var i = 0; i < 19; i++)
                await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized,
                    await http.PostAsJsonAsync("/api/login", new { email = ApiSession.UniqueEmail("guess"), password = "Wr0ngPass" }));
            await ApiAssert.StatusAsync(HttpStatusCode.TooManyRequests,
                await http.PostAsJsonAsync("/api/login", new { email = ApiSession.UniqueEmail("guess"), password = "Wr0ngPass" }));

            // That address is blocked even for a real account; other addresses are not
            await ApiAssert.StatusAsync(HttpStatusCode.TooManyRequests,
                await http.PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Passw0rd" }));
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await ClientFrom(RandomIp()).PostAsJsonAsync("/api/login", new { email = admin.Email, password = "Passw0rd" }));
        }

        private async Task<string> AskAndGetSentContextAsync(ApiSession session, int folderId)
        {
            while (_factory.OpenAi.RequestBodies.TryDequeue(out _)) { }
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await session.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "What do the files say?" }));
            // The chat call is the last one sent; earlier ones read images
            return _factory.OpenAi.RequestBodies.Last();
        }

        [Fact]
        public async Task Extracted_text_is_cached_and_reused_without_downloading_again()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var (documentId, objectKey) = await admin.UploadPdfAsync(folderId, "Rent is 4500 per month");

            Assert.Contains("Rent is 4500 per month", await AskAndGetSentContextAsync(admin, folderId));
            await using (var db = _factory.CreateDbContext())
            {
                var cached = await db.DocumentTexts.SingleAsync(t => t.DocumentId == documentId);
                Assert.Equal(objectKey, cached.FilePath);
                Assert.Equal("pdf-2", cached.Extractor);
            }

            // With the file gone from S3 the answer still has the text, so it came from the cache
            _factory.S3.Objects.TryRemove(objectKey, out _);
            Assert.Contains("Rent is 4500 per month", await AskAndGetSentContextAsync(admin, folderId));

            // Deleting the document removes its cached text
            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.DeleteAsync($"/api/document/{documentId}"));
            await using (var db = _factory.CreateDbContext())
                Assert.False(await db.DocumentTexts.AnyAsync(t => t.DocumentId == documentId));
        }

        [Fact]
        public async Task Text_cached_by_an_older_reader_is_extracted_again()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var (documentId, _) = await admin.UploadPdfAsync(folderId, "Hearing on 3 March");
            await AskAndGetSentContextAsync(admin, folderId);

            await using (var db = _factory.CreateDbContext())
                await db.Database.ExecuteSqlRawAsync(
                    "UPDATE `DocumentTexts` SET `Extractor` = 'pdf-1', `Text` = 'stale' WHERE `DocumentId` = {0}", documentId);

            var sent = await AskAndGetSentContextAsync(admin, folderId);
            Assert.Contains("Hearing on 3 March", sent);
            Assert.DoesNotContain("stale", sent);
        }

        [Fact]
        public async Task Chat_reads_word_documents_including_hebrew_and_tables()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var docx = ApiSession.CreateDocx(
                new[] { "הסכם שכירות", "דמי השכירות: 4,500 ש\"ח לחודש" },
                new[] { new[] { "שוכר", "דנה כהן" }, new[] { "משכיר", "יוסי לוי" } });
            await admin.UploadFileAsync(folderId, docx, "הסכם.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

            // The JSON body escapes Hebrew, so read the context back out of it
            var sent = JsonDocument.Parse(await AskAndGetSentContextAsync(admin, folderId))
                .RootElement.GetProperty("messages")[1].GetProperty("content").GetString()!;
            Assert.Contains("--- הסכם.docx ---", sent);
            Assert.Contains("הסכם שכירות", sent);
            Assert.Contains("דמי השכירות: 4,500 ש\"ח לחודש", sent);
            Assert.Contains("שוכר | דנה כהן", sent);
            Assert.Contains("משכיר | יוסי לוי", sent);
        }

        [Fact]
        public async Task Chat_reads_images_through_the_ai_and_caches_the_result()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            var png = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3 };
            await admin.UploadFileAsync(folderId, png, "scan.png", "image/png");

            while (_factory.OpenAi.RequestBodies.TryDequeue(out _)) { }
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "What does the scan say?" }));
            var bodies = _factory.OpenAi.RequestBodies.ToList();
            Assert.Equal(2, bodies.Count);
            Assert.Contains("data:image/png;base64," + Convert.ToBase64String(png), bodies[0]);
            // What the AI read from the image is the context of the question
            Assert.Contains(_factory.OpenAi.Answer, bodies[1]);

            // The second question doesn't send the image again
            while (_factory.OpenAi.RequestBodies.TryDequeue(out _)) { }
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await admin.Http.PostAsJsonAsync($"/api/chat/{folderId}", new { question = "Anything else?" }));
            Assert.Single(_factory.OpenAi.RequestBodies);
        }

        [Fact]
        public async Task Unsupported_files_are_named_but_not_read()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var folderId = await admin.CreateFolderAsync(await admin.CreateClientAsync());
            await admin.UploadFileAsync(folderId, new byte[] { 1, 2, 3 }, "old.doc", "application/msword");

            Assert.Contains("[Unsupported file: old.doc]", await AskAndGetSentContextAsync(admin, folderId));
        }
    }
}
