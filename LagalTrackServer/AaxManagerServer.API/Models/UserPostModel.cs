namespace TaxManagerServer.API.Models
{
    public class UserPostModel
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int? GroupId { get; set; }
        public bool IsAdmin { get; set; }

    }
}
