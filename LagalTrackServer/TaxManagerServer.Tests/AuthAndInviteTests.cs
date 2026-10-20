using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    [Collection(ApiCollection.Name)]
    public class AuthAndInviteTests
    {
        private readonly LegalTrackApiFactory _factory;

        public AuthAndInviteTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.Email.FailWith = null;
        }

        [Fact]
        public async Task Admin_registers_office_logs_in_and_sees_only_themself()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory, "Office Admin");

            var login = await ApiSession.LoginAsync(_factory, admin.Email, "Passw0rd");
            Assert.False(string.IsNullOrEmpty(await ApiSession.ReadTokenAsync(login)));

            var me = await admin.GetJsonAsync($"/api/users/{admin.Email}");
            Assert.True(me.GetProperty("isAdmin").GetBoolean());
            Assert.True(me.GetProperty("groupId").GetInt32() > 0);

            var users = await admin.GetJsonAsync("/api/users");
            Assert.Single(users.EnumerateArray());

            var groups = await admin.GetJsonAsync("/api/group");
            Assert.Single(groups.EnumerateArray());
        }

        [Fact]
        public async Task Login_rejects_wrong_password_and_unknown_user()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);

            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, await ApiSession.LoginAsync(_factory, admin.Email, "Wr0ngPass"));
            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, await ApiSession.LoginAsync(_factory, ApiSession.UniqueEmail("nobody"), "Passw0rd"));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await ApiSession.LoginAsync(_factory, "not-an-email", "Passw0rd"));
        }

        [Fact]
        public async Task Register_admin_validates_input_and_rejects_duplicates()
        {
            var http = _factory.CreateClient();
            var email = ApiSession.UniqueEmail("dup");

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await http.PostAsJsonAsync("/api/register-admin", new { userName = "A", email, password = "short" }));
            await ApiAssert.StatusAsync(HttpStatusCode.OK,
                await http.PostAsJsonAsync("/api/register-admin", new { userName = "A", email, password = "Passw0rd" }));
            await ApiAssert.StatusAsync(HttpStatusCode.Conflict,
                await http.PostAsJsonAsync("/api/register-admin", new { userName = "B", email, password = "Passw0rd" }));
        }

        [Fact]
        public async Task Invite_flow_emails_a_working_link_and_lawyer_joins_the_office()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var email = ApiSession.UniqueEmail("lawyer");

            var inviteResponse = await admin.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, inviteResponse);
            var invite = await inviteResponse.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(invite.GetProperty("emailSent").GetBoolean());

            // The emailed link opens the React app root, which forwards ?invite= to /register
            var link = _factory.Email.LinksByEmail[email];
            Assert.StartsWith(LegalTrackApiFactory.FrontendBaseUrl + "/?invite=", link);
            Assert.Equal(link, invite.GetProperty("inviteLink").GetString());
            var token = ApiSession.InviteTokenFromLink(link);

            var validate = await _factory.CreateClient().PostAsJsonAsync("/api/invite/validate", new { token });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, validate);
            Assert.Equal(email, (await validate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("email").GetString());

            // Weak password is rejected and does not use up the invite
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await _factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name = "Lawyer", password = "abc" }));

            var register = await _factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name = "Lawyer", password = "Lawy3rPass" });
            var lawyer = new ApiSession(_factory.CreateClient(), email, await ApiSession.ReadTokenAsync(register));

            // Same office as the admin, not an admin
            var me = await lawyer.GetJsonAsync($"/api/users/{email}");
            Assert.False(me.GetProperty("isAdmin").GetBoolean());
            var adminMe = await admin.GetJsonAsync($"/api/users/{admin.Email}");
            Assert.Equal(adminMe.GetProperty("groupId").GetInt32(), me.GetProperty("groupId").GetInt32());

            // The invite can't be used twice
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await _factory.CreateClient().PostAsJsonAsync("/api/invite/validate", new { token }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await _factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name = "Again", password = "Lawy3rPass" }));

            // The new lawyer can log in
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await ApiSession.LoginAsync(_factory, email, "Lawy3rPass"));

            // The admin sees both users
            Assert.Equal(2, (await admin.GetJsonAsync("/api/users")).GetArrayLength());
        }

        [Fact]
        public async Task Invite_still_works_when_email_sending_fails()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var email = ApiSession.UniqueEmail("lawyer");
            _factory.Email.FailWith = "SendGrid returned 403: The from address does not match a verified Sender Identity";

            try
            {
                var response = await admin.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email });
                await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
                var invite = await response.Content.ReadFromJsonAsync<JsonElement>();

                Assert.False(invite.GetProperty("emailSent").GetBoolean());
                Assert.Contains("403", invite.GetProperty("emailError").GetString());

                // The admin can share the returned link manually and it works
                var token = ApiSession.InviteTokenFromLink(invite.GetProperty("inviteLink").GetString()!);
                var register = await _factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name = "Lawyer", password = "Lawy3rPass" });
                await ApiAssert.StatusAsync(HttpStatusCode.OK, register);
            }
            finally
            {
                _factory.Email.FailWith = null;
            }
        }

        [Fact]
        public async Task Invite_rejects_existing_users_and_expired_tokens()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);

            await ApiAssert.StatusAsync(HttpStatusCode.Conflict,
                await admin.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email = admin.Email }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await admin.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email = "not-an-email" }));

            var email = ApiSession.UniqueEmail("late");
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await admin.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email }));
            var token = ApiSession.InviteTokenFromLink(_factory.Email.LinksByEmail[email]);

            // Age the invite past Invite:ExpirationMinutes (60 in tests)
            await using (var db = _factory.CreateDbContext())
            {
                var stored = await db.Invites.SingleAsync(i => i.Token == token);
                stored.CreatedAt = DateTime.UtcNow.AddHours(-2);
                await db.SaveChangesAsync();
            }

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await _factory.CreateClient().PostAsJsonAsync("/api/invite/validate", new { token }));
            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await _factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name = "Late", password = "Lawy3rPass" }));
        }

        [Fact]
        public async Task Lawyer_cannot_do_admin_actions_but_can_edit_own_profile()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var lawyer = await admin.InviteAndRegisterLawyerAsync(_factory);
            var lawyerId = (await lawyer.GetJsonAsync($"/api/users/{lawyer.Email}")).GetProperty("userId").GetInt32();
            var adminId = (await admin.GetJsonAsync($"/api/users/{admin.Email}")).GetProperty("userId").GetInt32();

            await ApiAssert.StatusAsync(HttpStatusCode.Forbidden, await lawyer.Http.GetAsync("/api/users"));
            await ApiAssert.StatusAsync(HttpStatusCode.Forbidden,
                await lawyer.Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email = ApiSession.UniqueEmail("x") }));
            await ApiAssert.StatusAsync(HttpStatusCode.Forbidden, await lawyer.Http.DeleteAsync($"/api/users/{adminId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.Forbidden,
                await lawyer.Http.PutAsJsonAsync($"/api/users/{adminId}", new { userName = "Hacked", email = admin.Email }));

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent,
                await lawyer.Http.PutAsJsonAsync($"/api/users/{lawyerId}", new { userName = "Renamed Lawyer", email = lawyer.Email }));
            var me = await lawyer.GetJsonAsync($"/api/users/{lawyerId}");
            Assert.Equal("Renamed Lawyer", me.GetProperty("username").GetString());
        }

        [Fact]
        public async Task Admin_can_remove_a_lawyer_but_not_themself()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var lawyer = await admin.InviteAndRegisterLawyerAsync(_factory);
            var lawyerId = (await admin.GetJsonAsync($"/api/users/{lawyer.Email}")).GetProperty("userId").GetInt32();
            var adminId = (await admin.GetJsonAsync($"/api/users/{admin.Email}")).GetProperty("userId").GetInt32();

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await admin.Http.DeleteAsync($"/api/users/{adminId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.DeleteAsync($"/api/users/{lawyerId}"));
            Assert.Single((await admin.GetJsonAsync("/api/users")).EnumerateArray());

            // The removed lawyer can no longer use their token
            await ApiAssert.StatusAsync(HttpStatusCode.Unauthorized, await lawyer.Http.GetAsync("/api/folders"));
        }
    }
}
