using Amazon;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // Sends through Amazon SES (API v2, over HTTPS) with the same AWS user as S3.
    // The sender address must be a verified identity in SES; while the account is in the
    // SES sandbox, recipients must be verified too.
    public class SesEmailService : EmailServiceBase
    {
        private readonly IConfiguration _configuration;
        private readonly string? _senderEmail;
        private readonly ILogger<SesEmailService> _logger;
        private IAmazonSimpleEmailServiceV2? _client;

        public SesEmailService(IConfiguration configuration, ILogger<SesEmailService> logger)
        {
            _configuration = configuration;
            _senderEmail = configuration["Ses:SenderEmail"];
            _logger = logger;
        }

        // For tests: a ready-made client
        public SesEmailService(IConfiguration configuration, ILogger<SesEmailService> logger, IAmazonSimpleEmailServiceV2 client)
            : this(configuration, logger)
        {
            _client = client;
        }

        // Created on first use, like the S3 client
        private IAmazonSimpleEmailServiceV2 Client
        {
            get
            {
                if (_client != null)
                    return _client;

                var regionName = _configuration["Ses:Region"] ?? _configuration["AWS:Region"];
                if (string.IsNullOrWhiteSpace(regionName))
                    throw new EmailSendException("AWS:Region (or Ses:Region) is not configured on the server.");

                _client = new AmazonSimpleEmailServiceV2Client(_configuration["AWS:AccessKey"], _configuration["AWS:SecretKey"],
                    RegionEndpoint.GetBySystemName(regionName));
                return _client;
            }
        }

        protected override async Task SendAsync(string toEmail, string subject, string htmlContent, string plainContent)
        {
            if (string.IsNullOrWhiteSpace(_senderEmail))
                throw new EmailSendException("Ses:SenderEmail is not configured on the server.");

            var request = new SendEmailRequest
            {
                FromEmailAddress = $"{SenderName} <{_senderEmail}>",
                Destination = new Destination { ToAddresses = new List<string> { toEmail } },
                Content = new EmailContent
                {
                    Simple = new Message
                    {
                        Subject = new Content { Data = subject, Charset = "UTF-8" },
                        Body = new Body
                        {
                            Html = new Content { Data = htmlContent, Charset = "UTF-8" },
                            Text = new Content { Data = plainContent, Charset = "UTF-8" }
                        }
                    }
                }
            };

            try
            {
                await Client.SendEmailAsync(request);
            }
            catch (EmailSendException)
            {
                throw;
            }
            catch (AmazonSimpleEmailServiceV2Exception ex)
            {
                // e.g. MessageRejected "Email address is not verified" (sandbox), AccessDenied (missing ses:SendEmail)
                _logger.LogError(ex, "SES rejected the email");
                throw new EmailSendException($"SES returned {(int)ex.StatusCode} {ex.ErrorCode}: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SES request failed");
                throw new EmailSendException($"Could not reach SES: {ex.Message}", ex);
            }
        }
    }
}
