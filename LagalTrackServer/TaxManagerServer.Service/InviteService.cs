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

        private string BuildInviteLink(string token) => FrontendLinks.Build(_configuration, "invite", token);
    }
}
