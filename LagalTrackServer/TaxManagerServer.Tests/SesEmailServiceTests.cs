using System.Net;
using System.Text;
using System.Text.Json;
using Amazon;
using Amazon.Runtime;
using Amazon.SimpleEmailV2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TaxManagerServer.Core.Services;
using TaxManagerServer.Service;

namespace TaxManagerServer.Tests
{
    // The SES sender with the real AWS SDK client, whose HTTP calls go to a recording handler
    public class SesEmailServiceTests
    {
        private class RecordingHandler : HttpMessageHandler
        {
            public HttpRequestMessage? Request;
            public string Body = "";
            public HttpStatusCode StatusCode = HttpStatusCode.OK;
            public string ResponseBody = "{\"MessageId\":\"0100-test\"}";
            public string? ErrorType;

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                Body = request.Content == null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
                var response = new HttpResponseMessage(StatusCode) { Content = new StringContent(ResponseBody, Encoding.UTF8, "application/json") };
                if (ErrorType != null)
                    response.Headers.Add("x-amzn-ErrorType", ErrorType);
                return response;
            }
        }

        private class FixedHttpClientFactory : HttpClientFactory
        {
            private readonly HttpMessageHandler _handler;
            public FixedHttpClientFactory(HttpMessageHandler handler) => _handler = handler;
            public override HttpClient CreateHttpClient(IClientConfig clientConfig) => new(_handler, disposeHandler: false);
            public override bool UseSDKHttpClientCaching(IClientConfig clientConfig) => false;
        }

        private static SesEmailService Create(RecordingHandler handler, string? sender = "office@example.test")
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { ["Ses:SenderEmail"] = sender })
                .Build();
            var client = new AmazonSimpleEmailServiceV2Client(new BasicAWSCredentials("AKIATEST", "secret"),
                new AmazonSimpleEmailServiceV2Config
                {
                    RegionEndpoint = RegionEndpoint.EUNorth1,
                    HttpClientFactory = new FixedHttpClientFactory(handler),
                    MaxErrorRetry = 0
                });
            return new SesEmailService(config, NullLogger<SesEmailService>.Instance, client);
        }

        [Fact]
        public async Task Sends_the_invite_through_SES()
        {
            var handler = new RecordingHandler();
            await Create(handler).SendInviteEmailAsync("lawyer@example.test", "https://legaltrack.onrender.com/?invite=abc");

            Assert.Equal(HttpMethod.Post, handler.Request!.Method);
            Assert.Equal("email.eu-north-1.amazonaws.com", handler.Request.RequestUri!.Host);
            Assert.Equal("/v2/email/outbound-emails", handler.Request.RequestUri.AbsolutePath);

            using var json = JsonDocument.Parse(handler.Body);
            var root = json.RootElement;
            Assert.Equal("LegalTrack <office@example.test>", root.GetProperty("FromEmailAddress").GetString());
            Assert.Equal("lawyer@example.test", root.GetProperty("Destination").GetProperty("ToAddresses")[0].GetString());
            var simple = root.GetProperty("Content").GetProperty("Simple");
            Assert.Equal("הוזמנת להצטרף ל-LegalTrack", simple.GetProperty("Subject").GetProperty("Data").GetString());
            Assert.Contains("?invite=abc", simple.GetProperty("Body").GetProperty("Html").GetProperty("Data").GetString());
            Assert.Contains("?invite=abc", simple.GetProperty("Body").GetProperty("Text").GetProperty("Data").GetString());
        }

        [Fact]
        public async Task SES_rejections_become_EmailSendException_with_the_reason()
        {
            var handler = new RecordingHandler
            {
                StatusCode = HttpStatusCode.BadRequest,
                ErrorType = "MessageRejected",
                ResponseBody = "{\"message\":\"Email address is not verified. The following identities failed the check in region EU-NORTH-1: a@example.test\"}"
            };
            var ex = await Assert.ThrowsAsync<EmailSendException>(() =>
                Create(handler).SendPasswordResetEmailAsync("a@example.test", "https://x/reset"));
            Assert.Contains("400", ex.Message);
            Assert.Contains("not verified", ex.Message);
        }

        [Fact]
        public async Task Missing_sender_fails_without_calling_SES()
        {
            var handler = new RecordingHandler();
            await Assert.ThrowsAsync<EmailSendException>(() => Create(handler, sender: "").SendInviteEmailAsync("a@example.test", "x"));
            Assert.Null(handler.Request);
        }
    }
}
