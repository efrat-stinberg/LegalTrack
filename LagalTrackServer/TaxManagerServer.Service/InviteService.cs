using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class InviteService : IInviteService
    {
        private readonly IRepositoryManager _repositoryManager;
        private readonly IEmailService _emailService;

        public InviteService(IRepositoryManager repositoryManager, IEmailService emailService)
        {
            _repositoryManager = repositoryManager;
            _emailService = emailService;
        }

        public async Task<Invite> CreateInviteAsync(string email, int groupId)
        {
            var token = Guid.NewGuid().ToString();

            var invite = new Invite
            {
                Email = email,
                GroupId = groupId,
                Token = token,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repositoryManager.Invite.AddAsync(invite);
            await _repositoryManager.SaveAsync();

            await _emailService.SendInviteEmailAsync(email, token);

            return invite;
        }


        public async Task<Invite?> GetInviteByTokenAsync(string token)
        {
            var invite = await _repositoryManager.Invite.GetByTokenAsync(token);

            if (invite == null)
                return null;

            return invite;
        }

        public async Task<bool> IsTokenValidAsync(string token)
        {
            var invite = await _repositoryManager.Invite.GetByTokenAsync(token);

            return invite != null &&
                   invite.IsUsed == false &&
                   invite.CreatedAt.AddMinutes(15) > DateTime.UtcNow;
        }


    }
}
