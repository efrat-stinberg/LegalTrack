using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    [Collection(ApiCollection.Name)]
    public class CaseStatusAndPasswordTests
    {
        private readonly LegalTrackApiFactory _factory;

        public CaseStatusAndPasswordTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.Email.FailWith = null;
        }

        [Fact]
        public async Task New_case_is_open_and_status_and_deadline_can_be_updated_and_cleared()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync();
            var folderId = await admin.CreateFolderAsync(clientId, "Lease appeal");

            var created = await admin.GetJsonAsync($"/api/folders/{folderId}");
            Assert.Equal("open", created.GetProperty("status").GetString());
            Assert.Equal(JsonValueKind.Null, created.GetProperty("nextDeadline").ValueKind);

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new
            {
                folderName = "Lease appeal",
                clientId,
                status = "waiting",
                nextDeadline = "2026-11-03",
                nextDeadlineNote = "  Court hearing  "
            }));
            var updated = await admin.GetJsonAsync($"/api/folders/{folderId}");
            Assert.Equal("waiting", updated.GetProperty("status").GetString());
            Assert.StartsWith("2026-11-03", updated.GetProperty("nextDeadline").GetString());
            Assert.Equal("Court hearing", updated.GetProperty("nextDeadlineNote").GetString());

            // The list endpoint carries the same fields
            var listed = (await admin.GetJsonAsync("/api/folders")).EnumerateArray().Single(f => f.GetProperty("folderId").GetInt32() == folderId);
            Assert.Equal("waiting", listed.GetProperty("status").GetString());

            // No status = keep it; no deadline = clear it (and its note)
            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new
            {
                folderName = "Lease appeal (renamed)",
                clientId
            }));
            var cleared = await admin.GetJsonAsync($"/api/folders/{folderId}");
            Assert.Equal("waiting", cleared.GetProperty("status").GetString());
            Assert.Equal(JsonValueKind.Null, cleared.GetProperty("nextDeadline").ValueKind);
            Assert.Equal(JsonValueKind.Null, cleared.GetProperty("nextDeadlineNote").ValueKind);
        }

        [Fact]
        public async Task Invalid_status_and_long_note_are_rejected()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync();
            var folderId = await admin.CreateFolderAsync(clientId);

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await admin.Http.PostAsJsonAsync("/api/folders", new { folderName = "X", clientId, status = "done" }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new { folderName = "X", clientId, status = "archived" }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new
                {
                    folderName = "X",
                    clientId,
                    nextDeadline = "2026-11-03",
                    nextDeadlineNote = new string('a', 201)
                }));

            // Create with a status and deadline
            var create = await admin.Http.PostAsJsonAsync("/api/folders", new { folderName = "Y", clientId, status = "in_progress", nextDeadline = "2026-12-01" });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, create);
            var body = await create.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("in_progress", body.GetProperty("status").GetString());
        }

        [Fact]
        public async Task Forgot_password_emails_a_single_use_link_that_sets_a_new_password()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var anon = _factory.CreateClient();

            await ApiAssert.StatusAsync(HttpStatusCode.OK, await anon.PostAsJsonAsync("/api/password/forgot", new { email = admin.Email }));
            var link = _factory.Email.ResetLinksByEmail[admin.Email];
            Assert.StartsWith(LegalTrackApiFactory.FrontendBaseUrl + "/?reset=", link);
            var token = ApiSession.QueryValue(link, "reset");

            var validate = await anon.PostAsJsonAsync("/api/password/validate", new { token });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, validate);
            Assert.Equal(admin.Email, (await validate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("email").GetString());

            // The password policy applies; a rejected attempt does not use up the link
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/reset", new { token, password = "short" }));
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await anon.PostAsJsonAsync("/api/password/reset", new { token, password = "N3wPassword" }));

            await ApiAssert.StatusAsync(HttpStatusCode.OK, await ApiSession.LoginAsync(_factory, admin.Email, "N3wPassword"));
            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, await ApiSession.LoginAsync(_factory, admin.Email, "Passw0rd"));

            // Single use
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/reset", new { token, password = "An0therPass" }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/validate", new { token }));
        }

        [Fact]
        public async Task Forgot_password_does_not_reveal_whether_an_email_exists_or_whether_sending_failed()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var anon = _factory.CreateClient();
            var unknown = ApiSession.UniqueEmail("nobody");

            await ApiAssert.StatusAsync(HttpStatusCode.OK, await anon.PostAsJsonAsync("/api/password/forgot", new { email = unknown }));
            Assert.False(_factory.Email.ResetLinksByEmail.ContainsKey(unknown));

            _factory.Email.FailWith = "SendGrid returned 401";
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await anon.PostAsJsonAsync("/api/password/forgot", new { email = admin.Email }));

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/forgot", new { email = "not-an-email" }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/validate", new { token = "made-up" }));
        }

        [Fact]
        public async Task A_newer_link_replaces_the_older_one()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var anon = _factory.CreateClient();

            await anon.PostAsJsonAsync("/api/password/forgot", new { email = admin.Email });
            var first = ApiSession.QueryValue(_factory.Email.ResetLinksByEmail[admin.Email], "reset");
            await anon.PostAsJsonAsync("/api/password/forgot", new { email = admin.Email });
            var second = ApiSession.QueryValue(_factory.Email.ResetLinksByEmail[admin.Email], "reset");

            Assert.NotEqual(first, second);
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await anon.PostAsJsonAsync("/api/password/validate", new { token = first }));
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await anon.PostAsJsonAsync("/api/password/validate", new { token = second }));
        }

        [Fact]
        public async Task Admin_creates_reset_links_only_for_users_in_their_office()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var lawyer = await admin.InviteAndRegisterLawyerAsync(_factory);
            var lawyerId = (await admin.GetJsonAsync($"/api/users/{lawyer.Email}")).GetProperty("userId").GetInt32();
            var otherOffice = await ApiSession.RegisterOfficeAsync(_factory);

            var response = await admin.Http.PostAsync($"/api/password/admin-link/{lawyerId}", null);
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            var link = (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("resetLink").GetString()!;
            var token = ApiSession.QueryValue(link, "reset");
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await _factory.CreateClient().PostAsJsonAsync("/api/password/reset", new { token, password = "Fr3shPass" }));
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await ApiSession.LoginAsync(_factory, lawyer.Email, "Fr3shPass"));

            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await otherOffice.Http.PostAsync($"/api/password/admin-link/{lawyerId}", null));
            await ApiAssert.StatusAsync(HttpStatusCode.Forbidden, await lawyer.Http.PostAsync($"/api/password/admin-link/{lawyerId}", null));
            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, await _factory.CreateClient().PostAsync($"/api/password/admin-link/{lawyerId}", null));
        }
    }
}
