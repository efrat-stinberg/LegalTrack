namespace TaxManagerServer.Core.Models
{
    // Allowed values of Folder.Status. Stored as text so the database stays readable.
    public static class FolderStatus
    {
        public const string Open = "open";
        public const string InProgress = "in_progress";
        public const string Waiting = "waiting";
        public const string Closed = "closed";

        public static readonly IReadOnlyList<string> All = new[] { Open, InProgress, Waiting, Closed };

        public static bool IsValid(string? status) => status != null && All.Contains(status);
    }
}
