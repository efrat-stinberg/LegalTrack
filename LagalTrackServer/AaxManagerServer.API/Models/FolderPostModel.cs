using System.Collections.ObjectModel;

namespace TaxManagerServer.API.Models
{
    public class FolderPostModel
    {
        public string FolderName { get; set; }
        public int GroupId { get; set; }

        public int ClientId { get; set; }

        // Optional on create (defaults to "open"); on update a missing status keeps the current one
        public string? Status { get; set; }
        // Replaced on every update: send null to clear the deadline
        public DateTime? NextDeadline { get; set; }
        public string? NextDeadlineNote { get; set; }
    }
}
