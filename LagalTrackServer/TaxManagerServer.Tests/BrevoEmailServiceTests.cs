using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TaxManagerServer.Core.Services;
using TaxManagerServer.Service;

namespace TaxManagerServer.Tests
{
    // The Brevo sender on its own, with Brevo's HTTP API replaced by a recording handler
    public class BrevoEmailServiceTests
    {
        private class RecordingHandler : HttpMessageHandler
        {
            public HttpRequestMessage? Request;
            public string Body = "";
            public HttpStatusCode StatusCode = HttpStatusCode.Created;
            public string ResponseBody = "{\"messageId\":\"<1@smtp-relay.mailin.fr>\"}";

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                Body = request.Content == null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
                return new HttpResponseMessage(StatusCode) { Content = new StringContent(ResponseBody, Encoding.UTF8, "application/json") };
            }
        }

        private static BrevoEmailService Create(RecordingHandler handler, string? apiKey = "test-key", string? sender = "office@example.test")
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { ["Brevo:ApiKey"] = apiKey, ["Brevo:SenderEmail"] = sender })
                .Build();
            return new BrevoEmailService(new HttpClient(handler), config, NullLogger<BrevoEmailService>.Instance);
        }

        [Fact]
        public async Task Sends_the_invite_through_the_Brevo_API()
        {
            var handler = new RecordingHandler();
            await Create(handler).SendInviteEmailAsync("lawyer@example.test", "https://legaltrack.onrender.com/?invite=abc");

            Assert.Equal(HttpMethod.Post, handler.Request!.Method);
            Assert.Equal("https://api.brevo.com/v3/smtp/email", handler.Request.RequestUri!.ToString());
            Assert.Equal("test-key", handler.Request.Headers.GetValues("api-key").Single());

            using var json = JsonDocument.Parse(handler.Body);
            var root = json.RootElement;
            Assert.Equal("office@example.test", root.GetProperty("sender").GetProperty("email").GetString());
            Assert.Equal("LegalTrack", root.GetProperty("sender").GetProperty("name").GetString());
            Assert.Equal("lawyer@example.test", root.GetProperty("to")[0].GetProperty("email").GetString());
            Assert.Equal("הוזמנת להצטרף ל-LegalTrack", root.GetProperty("subject").GetString());
            Assert.Contains("?invite=abc", root.GetProperty("htmlContent").GetString());
            Assert.Contains("?invite=abc", root.GetProperty("textContent").GetString());
        }

        [Fact]
        public async Task Brevo_errors_become_EmailSendException_with_the_reason()
        {
            var handler = new RecordingHandler
            {
                StatusCode = HttpStatusCode.BadRequest,
                ResponseBody = "{\"code\":\"invalid_parameter\",\"message\":\"Sender is not valid\"}"
            };
            var ex = await Assert.ThrowsAsync<EmailSendException>(() =>
                Create(handler).SendPasswordResetEmailAsync("a@example.test", "https://x/reset"));
            Assert.Contains("400", ex.Message);
            Assert.Contains("Sender is not valid", ex.Message);
        }

        [Fact]
        public async Task Missing_settings_fail_without_calling_Brevo()
        {
            var handler = new RecordingHandler();
            await Assert.ThrowsAsync<EmailSendException>(() => Create(handler, apiKey: null).SendInviteEmailAsync("a@example.test", "x"));
            await Assert.ThrowsAsync<EmailSendException>(() => Create(handler, sender: "").SendInviteEmailAsync("a@example.test", "x"));
            Assert.Null(handler.Request);
        }
    }
}
