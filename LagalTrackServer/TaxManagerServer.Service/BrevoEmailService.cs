using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // Sends through Brevo's HTTP API (https://developers.brevo.com/reference/sendtransacemail).
    // HTTP rather than SMTP, because Render's free tier blocks outgoing SMTP ports.
    public class BrevoEmailService : EmailServiceBase
    {
        private const string SendUrl = "https://api.brevo.com/v3/smtp/email";

        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;
        private readonly string? _senderEmail;
        private readonly ILogger<BrevoEmailService> _logger;

        public BrevoEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<BrevoEmailService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Brevo:ApiKey"];
            _senderEmail = configuration["Brevo:SenderEmail"];
            _logger = logger;
        }

        protected override async Task SendAsync(string toEmail, string subject, string htmlContent, string plainContent)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new EmailSendException("Brevo:ApiKey is not configured on the server.");
            if (string.IsNullOrWhiteSpace(_senderEmail))
                throw new EmailSendException("Brevo:SenderEmail is not configured on the server.");

            using var request = new HttpRequestMessage(HttpMethod.Post, SendUrl)
            {
                Content = JsonContent.Create(new
                {
                    sender = new { name = SenderName, email = _senderEmail },
                    to = new[] { new { email = toEmail } },
                    subject,
                    htmlContent,
                    textContent = plainContent
                })
            };
            request.Headers.Add("api-key", _apiKey);
            request.Headers.Add("accept", "application/json");

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Brevo request failed");
                throw new EmailSendException($"Could not reach Brevo: {ex.Message}", ex);
            }

            using (response)
            {
                // Bad key, unverified sender or daily limit come back as a non-2xx response with a JSON message
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Brevo returned {Status}: {Body}", (int)response.StatusCode, body);
                    throw new EmailSendException($"Brevo returned {(int)response.StatusCode}: {body}");
                }
            }
        }
    }
}
