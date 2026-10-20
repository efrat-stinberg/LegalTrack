namespace TaxManagerServer.Core.Services
{
    public interface IEmailService
    {
        // Throws EmailSendException when the email could not be sent.
        Task SendInviteEmailAsync(string toEmail, string inviteLink);
    }

    public class EmailSendException : Exception
    {
        public EmailSendException(string message, Exception? inner = null) : base(message, inner) { }
    }
}
