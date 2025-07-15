using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class SendGridEmailService : IEmailService
    {
        private readonly string _apiKey;
        private readonly string _senderEmail;
        private readonly string _frontendBaseUrl;

        public SendGridEmailService(IConfiguration configuration)
        {
            _apiKey = configuration["SendGrid:ApiKey"];
            _senderEmail = configuration["SendGrid:SenderEmail"];
            _frontendBaseUrl = configuration["Frontend:BaseUrl"];
        }

        public async Task SendInviteEmailAsync(string toEmail, string token)
        {
            if (_apiKey == null) throw new Exception("API key is missing from configuration");
            if (_senderEmail == null) throw new Exception("SenderEmail is missing from configuration");
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_senderEmail, "LegalFlow");
            var subject = "You’ve been invited to join a group";
            var to = new EmailAddress(toEmail);

            string url = $"{_frontendBaseUrl}/?token={token}";
            Console.WriteLine("----------------------------------------");
            Console.WriteLine("----------------------------------------");
            Console.WriteLine("----------------------------------------");
            Console.WriteLine("----------------------------------------");
            Console.WriteLine("----------------------------------------");
            Console.WriteLine("----------------------------------------");
            Console.WriteLine(url);
            string htmlContent = $@"
            <p>Hello,</p>
            <p>You have been invited to join the LegalFlow platform.</p>
            <p><a href='{url}'>Click here to accept the invitation</a></p>
            <p>{url}</p>
            <p>This link is personal and should not be shared.</p>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);

            try
            {
                var response = await client.SendEmailAsync(msg);
                Console.WriteLine($"SendGrid Status: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SendGrid error: " + ex.Message);
            }


            
        }
    }
}
