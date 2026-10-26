using System.Net;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // The email texts; each provider only implements the actual sending
    public abstract class EmailServiceBase : IEmailService
    {
        protected const string SenderName = "LegalTrack";

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

        // Throws EmailSendException when the provider did not accept the email
        protected abstract Task SendAsync(string toEmail, string subject, string htmlContent, string plainContent);
    }
}
