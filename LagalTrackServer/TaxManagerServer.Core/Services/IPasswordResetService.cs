using TaxManager.Core.Models;

namespace TaxManagerServer.Core.Services
{
    public interface IPasswordResetService
    {
        // "Forgot password": emails a reset link when the address belongs to a user. Never reports
        // whether it does, so the endpoint can't be used to discover registered emails.
        Task RequestByEmailAsync(string email);

        // For an office admin: a reset link to pass on by hand (used when email can't be sent).
        Task<string> CreateLinkForUserAsync(User user);

        // The user the token belongs to, or null if it is unknown, used or expired
        Task<User?> GetUserForTokenAsync(string token);

        // Sets the new password and uses up the token. False when the token is not valid.
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }
}
