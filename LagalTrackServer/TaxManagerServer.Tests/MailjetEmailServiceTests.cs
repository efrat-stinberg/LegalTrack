using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TaxManagerServer.Core.Services;
using TaxManagerServer.Service;

namespace TaxManagerServer.Tests
{
    // The Mailjet sender on its own, with Mailjet's HTTP API replaced by a recording handler
    public class MailjetEmailServiceTests
    {
        private class RecordingHandler : HttpMessageHandler
        {
            public HttpRequestMessage? Request;
            public string Body = "";
            public HttpStatusCode StatusCode = HttpStatusCode.OK;
            public string ResponseBody = "{\"Messages\":[{\"Status\":\"success\"}]}";

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                Body = request.Content == null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
                return new HttpResponseMessage(StatusCode) { Content = new StringContent(ResponseBody, Encoding.UTF8, "application/json") };
            }
        }

        private static MailjetEmailService Create(RecordingHandler handler, string? apiKey = "public", string? secret = "secret", string? sender = "office@example.test")
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Mailjet:ApiKey"] = apiKey, ["Mailjet:SecretKey"] = secret, ["Mailjet:SenderEmail"] = sender
                })
                .Build();
            return new MailjetEmailService(new HttpClient(handler), config, NullLogger<MailjetEmailService>.Instance);
        }

        [Fact]
        public async Task Sends_the_invite_through_the_Mailjet_API()
        {
            var handler = new RecordingHandler();
            await Create(handler).SendInviteEmailAsync("lawyer@example.test", "https://legaltrack.onrender.com/?invite=abc");

            Assert.Equal(HttpMethod.Post, handler.Request!.Method);
            Assert.Equal("https://api.mailjet.com/v3.1/send", handler.Request.RequestUri!.ToString());
            Assert.Equal("Basic", handler.Request.Headers.Authorization!.Scheme);
            Assert.Equal("public:secret", Encoding.UTF8.GetString(Convert.FromBase64String(handler.Request.Headers.Authorization.Parameter!)));

            using var json = JsonDocument.Parse(handler.Body);
            var message = json.RootElement.GetProperty("Messages")[0];
            Assert.Equal("office@example.test", message.GetProperty("From").GetProperty("Email").GetString());
            Assert.Equal("LegalTrack", message.GetProperty("From").GetProperty("Name").GetString());
            Assert.Equal("lawyer@example.test", message.GetProperty("To")[0].GetProperty("Email").GetString());
            Assert.Equal("הוזמנת להצטרף ל-LegalTrack", message.GetProperty("Subject").GetString());
            Assert.Contains("?invite=abc", message.GetProperty("HTMLPart").GetString());
            Assert.Contains("?invite=abc", message.GetProperty("TextPart").GetString());
        }

        [Fact]
        public async Task Mailjet_errors_become_EmailSendException_with_the_reason()
        {
            var handler = new RecordingHandler
            {
                StatusCode = HttpStatusCode.Unauthorized,
                ResponseBody = "{\"ErrorMessage\":\"API key authentication/authorization failure\"}"
            };
            var ex = await Assert.ThrowsAsync<EmailSendException>(() =>
                Create(handler).SendPasswordResetEmailAsync("a@example.test", "https://x/reset"));
            Assert.Contains("401", ex.Message);
            Assert.Contains("authentication", ex.Message);
        }

        [Fact]
        public async Task Missing_settings_fail_without_calling_Mailjet()
        {
            var handler = new RecordingHandler();
            await Assert.ThrowsAsync<EmailSendException>(() => Create(handler, secret: null).SendInviteEmailAsync("a@example.test", "x"));
            await Assert.ThrowsAsync<EmailSendException>(() => Create(handler, sender: "").SendInviteEmailAsync("a@example.test", "x"));
            Assert.Null(handler.Request);
        }
    }
}
