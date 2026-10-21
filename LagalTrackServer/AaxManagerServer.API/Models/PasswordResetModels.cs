namespace TaxManagerServer.API.Models
{
    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = "";
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
