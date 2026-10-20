using Microsoft.Extensions.Configuration;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class InviteService : IInviteService
    {
        // Used when Invite:ExpirationMinutes is not configured
        private const int DefaultExpirationMinutes = 7 * 24 * 60;
        // Used when Frontend:BaseUrl is not configured (the deployed lawyers' app)
        private const string DefaultFrontendBaseUrl = "https://legaltrack.onrender.com";

        private readonly IRepositoryManager _repositoryManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public InviteService(IRepositoryManager repositoryManager, IEmailService emailService, IConfiguration configuration)
        {
            _repositoryManager = repositoryManager;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<InviteResult> CreateInviteAsync(string email, int groupId)
        {
            var invite = new Invite
            {
                Email = email,
                GroupId = groupId,
                Token = Guid.NewGuid().ToString(),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repositoryManager.Invite.AddAsync(invite);
            await _repositoryManager.SaveAsync();

            var inviteLink = BuildInviteLink(invite.Token);
            try
            {
                await _emailService.SendInviteEmailAsync(email, inviteLink);
                return new InviteResult { Invite = invite, InviteLink = inviteLink, EmailSent = true };
            }
            catch (EmailSendException ex)
            {
                return new InviteResult { Invite = invite, InviteLink = inviteLink, EmailSent = false, EmailError = ex.Message };
            }
        }

        public async Task<Invite?> GetValidInviteAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var invite = await _repositoryManager.Invite.GetByTokenAsync(token);
            if (invite == null || invite.IsUsed)
                return null;

            return invite.CreatedAt.AddMinutes(GetExpirationMinutes()) < DateTime.UtcNow ? null : invite;
        }

        private int GetExpirationMinutes() =>
            int.TryParse(_configuration["Invite:ExpirationMinutes"], out var minutes) && minutes > 0
                ? minutes
                : DefaultExpirationMinutes;

        // Links point at the site root (not /register) because the static host only serves index.html at "/";
        // the React app forwards ?invite=... to its /register page.
        private string BuildInviteLink(string token)
        {
            var baseUrl = _configuration["Frontend:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
                baseUrl = DefaultFrontendBaseUrl;
            baseUrl = baseUrl.TrimEnd('/');
            return $"{baseUrl}/?invite={Uri.EscapeDataString(token)}";
        }
    }
}
