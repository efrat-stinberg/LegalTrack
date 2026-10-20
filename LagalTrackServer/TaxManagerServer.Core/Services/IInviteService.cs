using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Services
{
    public interface IInviteService
    {
        // Creates the invite and tries to email it. Email failures don't throw:
        // the result carries the link so the admin can share it another way.
        Task<InviteResult> CreateInviteAsync(string email, int groupId);

        // Returns the invite only if it exists, is unused and has not expired.
        Task<Invite?> GetValidInviteAsync(string token);
    }

    public class InviteResult
    {
        public required Invite Invite { get; init; }
        public required string InviteLink { get; init; }
        public bool EmailSent { get; init; }
        public string? EmailError { get; init; }
    }
}
