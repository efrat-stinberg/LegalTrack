namespace TaxManagerServer.API.Models
{
    // Client fields the UI may set. Office (GroupId) and Id always come from the server.
    public class ClientInputModel
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}
