using System.ComponentModel.DataAnnotations;

namespace TaxManagerServer.Core.Models
{
    // A single-use password reset link. Only a SHA-256 hash of the token is stored,
    // so a leaked database row cannot be turned back into a working link.
    public class PasswordReset
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        [MaxLength(64)]
        public string TokenHash { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? UsedAt { get; set; }
    }
}
