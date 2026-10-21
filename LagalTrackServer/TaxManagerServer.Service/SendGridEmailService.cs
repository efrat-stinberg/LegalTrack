using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class SendGridEmailService : IEmailService
    {
        private const string SenderName = "LegalTrack";

        private readonly string? _apiKey;
        private readonly string? _senderEmail;
        private readonly ILogger<SendGridEmailService> _logger;

        public SendGridEmailService(IConfiguration configuration, ILogger<SendGridEmailService> logger)
        {
            _apiKey = configuration["SendGrid:ApiKey"];
            _senderEmail = configuration["SendGrid:SenderEmail"];
            _logger = logger;
        }

        public Task SendInviteEmailAsync(string toEmail, string inviteLink)
        {
            var link = WebUtility.HtmlEncode(inviteLink);
            return SendAsync(
                toEmail,
                "הוזמנת להצטרף ל-LegalTrack",
                $@"
<div dir='rtl' style='font-family:Arial,sans-serif'>
  <p>שלום,</p>
  <p>הוזמנת להצטרף למערכת LegalTrack.</p>
  <p><a href='{link}'>לחצו כאן כדי להשלים את ההרשמה</a></p>
  <p>הקישור אישי ואין להעביר אותו לאחרים.</p>
</div>",
                $"הוזמנת להצטרף למערכת LegalTrack. להשלמת ההרשמה: {inviteLink}");
        }

        public Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            var link = WebUtility.HtmlEncode(resetLink);
            return SendAsync(
                toEmail,
                "איפוס סיסמה ב-LegalTrack",
                $@"
<div dir='rtl' style='font-family:Arial,sans-serif'>
  <p>שלום,</p>
  <p>התקבלה בקשה לאיפוס הסיסמה שלך ב-LegalTrack.</p>
  <p><a href='{link}'>לחצו כאן כדי לבחור סיסמה חדשה</a></p>
  <p>הקישור תקף לזמן מוגבל ולשימוש אחד. אם לא ביקשת איפוס, אפשר להתעלם מהמייל.</p>
</div>",
                $"לאיפוס הסיסמה ב-LegalTrack: {resetLink} . אם לא ביקשת איפוס, אפשר להתעלם מהמייל.");
        }

        private async Task SendAsync(string toEmail, string subject, string htmlContent, string plainContent)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new EmailSendException("SendGrid:ApiKey is not configured on the server.");
            if (string.IsNullOrWhiteSpace(_senderEmail))
                throw new EmailSendException("SendGrid:SenderEmail is not configured on the server.");

            var client = new SendGridClient(_apiKey);
            var msg = MailHelper.CreateSingleEmail(
                new EmailAddress(_senderEmail, SenderName), new EmailAddress(toEmail), subject, plainContent, htmlContent);

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
