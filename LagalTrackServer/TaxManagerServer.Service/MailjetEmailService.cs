using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // Sends through Mailjet's Send API v3.1 (https://dev.mailjet.com/email/guides/send-api-v31/).
    // HTTP rather than SMTP, because Render's free tier blocks outgoing SMTP ports.
    public class MailjetEmailService : EmailServiceBase
    {
        private const string SendUrl = "https://api.mailjet.com/v3.1/send";
        // Mailjet expects PascalCase fields (Messages, From...); the web default would camel-case them
        private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = null };

        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;
        private readonly string? _secretKey;
        private readonly string? _senderEmail;
        private readonly ILogger<MailjetEmailService> _logger;

        public MailjetEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<MailjetEmailService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Mailjet:ApiKey"];
            _secretKey = configuration["Mailjet:SecretKey"];
            _senderEmail = configuration["Mailjet:SenderEmail"];
            _logger = logger;
        }

        protected override async Task SendAsync(string toEmail, string subject, string htmlContent, string plainContent)
        {
            if (string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_secretKey))
                throw new EmailSendException("Mailjet:ApiKey / Mailjet:SecretKey are not configured on the server.");
            if (string.IsNullOrWhiteSpace(_senderEmail))
                throw new EmailSendException("Mailjet:SenderEmail is not configured on the server.");

            using var request = new HttpRequestMessage(HttpMethod.Post, SendUrl)
            {
                Content = JsonContent.Create(new
                {
                    Messages = new[]
                    {
                        new
                        {
                            From = new { Email = _senderEmail, Name = SenderName },
                            To = new[] { new { Email = toEmail } },
                            Subject = subject,
                            TextPart = plainContent,
                            HTMLPart = htmlContent
                        }
                    }
                }, options: JsonOptions)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic",
                Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_apiKey}:{_secretKey}")));

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Mailjet request failed");
                throw new EmailSendException($"Could not reach Mailjet: {ex.Message}", ex);
            }

            using (response)
            {
                // Bad keys, an unverified sender or a blocked account come back as a non-2xx response with details
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Mailjet returned {Status}: {Body}", (int)response.StatusCode, body);
                    throw new EmailSendException($"Mailjet returned {(int)response.StatusCode}: {body}");
                }
            }
        }
    }
}
