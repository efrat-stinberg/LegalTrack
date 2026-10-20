using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class SendGridEmailService : IEmailService
    {
        private readonly string? _apiKey;
        private readonly string? _senderEmail;
        private readonly ILogger<SendGridEmailService> _logger;

        public SendGridEmailService(IConfiguration configuration, ILogger<SendGridEmailService> logger)
        {
            _apiKey = configuration["SendGrid:ApiKey"];
            _senderEmail = configuration["SendGrid:SenderEmail"];
            _logger = logger;
        }

        public async Task SendInviteEmailAsync(string toEmail, string inviteLink)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new EmailSendException("SendGrid:ApiKey is not configured on the server.");
            if (string.IsNullOrWhiteSpace(_senderEmail))
                throw new EmailSendException("SendGrid:SenderEmail is not configured on the server.");

            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_senderEmail, "LegalFlow");
            var to = new EmailAddress(toEmail);
            const string subject = "הוזמנת להצטרף ל-LegalFlow";
            var htmlContent = $@"
<div dir='rtl' style='font-family:Arial,sans-serif'>
  <p>שלום,</p>
  <p>הוזמנת להצטרף למערכת LegalFlow.</p>
  <p><a href='{inviteLink}'>לחצו כאן כדי להשלים את ההרשמה</a></p>
  <p>הקישור אישי ואין להעביר אותו לאחרים.</p>
</div>";
            var plainContent = $"הוזמנת להצטרף למערכת LegalFlow. להשלמת ההרשמה: {inviteLink}";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainContent, htmlContent);

            Response response;
            try
            {
                response = await client.SendEmailAsync(msg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SendGrid request failed");
                throw new EmailSendException($"Could not reach SendGrid: {ex.Message}", ex);
            }

            // SendGrid reports problems (bad key, unverified sender, no credits) as a non-2xx response, not an exception
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                _logger.LogError("SendGrid returned {Status}: {Body}", (int)response.StatusCode, body);
                throw new EmailSendException($"SendGrid returned {(int)response.StatusCode}: {body}");
            }
        }
    }
}
