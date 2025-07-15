namespace TaxManagerServer.API.Models
{
    public class RegisterRequest
    {
        public string Token { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public int GroupId { get; set; }
    }
}
