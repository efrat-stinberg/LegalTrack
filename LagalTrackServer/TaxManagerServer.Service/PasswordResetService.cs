using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class PasswordResetService : IPasswordResetService
    {
        // A link sent by email is short-lived; one an admin passes on by hand gets a day
        private const int DefaultEmailLinkMinutes = 60;
        private const int DefaultAdminLinkMinutes = 24 * 60;

        private readonly IUserRepository _users;
        private readonly IRepository<PasswordReset> _resets;
        private readonly IRepositoryManager _repositoryManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            IUserRepository users,
            IRepository<PasswordReset> resets,
            IRepositoryManager repositoryManager,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<PasswordResetService> logger)
        {
            _users = users;
            _resets = resets;
            _repositoryManager = repositoryManager;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task RequestByEmailAsync(string email)
        {
            var user = await _users.GetByEmailAsync(email.Trim());
            if (user == null)
                return;

            var link = await CreateLinkAsync(user, Minutes("PasswordReset:EmailLinkMinutes", DefaultEmailLinkMinutes));
            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email, link);
            }
            catch (EmailSendException ex)
            {
                // Not reported to the caller (that would reveal the address exists); the admin can create a link instead
                _logger.LogWarning("Password reset email to user {UserId} was not sent: {Error}", user.UserId, ex.Message);
            }
        }

        public Task<string> CreateLinkForUserAsync(User user) =>
            CreateLinkAsync(user, Minutes("PasswordReset:AdminLinkMinutes", DefaultAdminLinkMinutes));

        public async Task<User?> GetUserForTokenAsync(string token)
        {
            var reset = await FindValidAsync(token);
            return reset == null ? null : await _users.GetByIdAsync(reset.UserId);
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var reset = await FindValidAsync(token);
            if (reset == null)
                return false;

            var user = await _users.GetByIdAsync(reset.UserId);
            if (user == null)
                return false;

            user.Password = new PasswordHasher<User>().HashPassword(user, newPassword);
            reset.UsedAt = DateTime.UtcNow;
            await _users.UpdateAsync(user);
            await _resets.UpdateAsync(reset);
            await _repositoryManager.SaveAsync();
            return true;
        }

        private async Task<string> CreateLinkAsync(User user, int minutes)
        {
            // A new link replaces any earlier unused ones for this user
            var now = DateTime.UtcNow;
            foreach (var old in await _resets.FindAsync(r => r.UserId == user.UserId && r.UsedAt == null && r.ExpiresAt > now))
            {
                old.ExpiresAt = now;
                await _resets.UpdateAsync(old);
            }

            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            await _resets.AddAsync(new PasswordReset
            {
                UserId = user.UserId,
                TokenHash = Hash(token),
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(minutes),
            });
            await _repositoryManager.SaveAsync();

            return FrontendLinks.Build(_configuration, "reset", token);
        }

        private async Task<PasswordReset?> FindValidAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var hash = Hash(token.Trim());
            var now = DateTime.UtcNow;
            var matches = await _resets.FindAsync(r => r.TokenHash == hash && r.UsedAt == null && r.ExpiresAt > now);
            return matches.FirstOrDefault();
        }

        private static string Hash(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

        private int Minutes(string key, int fallback) =>
            int.TryParse(_configuration[key], out var minutes) && minutes > 0 ? minutes : fallback;
    }
}
