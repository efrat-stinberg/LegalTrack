using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    // Self-service password reset by email, plus a link an office admin can create and pass on by hand
    [Route("api/password")]
    [ApiController]
    public class PasswordController : OfficeControllerBase
    {
        private readonly IPasswordResetService _resetService;
        private readonly IUserService _userService;

        public PasswordController(IPasswordResetService resetService, IUserService userService)
        {
            _resetService = resetService;
            _userService = userService;
        }

        // Same answer whether or not the email is registered, so this can't be used to probe for accounts
        [HttpPost("forgot")]
        public async Task<IActionResult> Forgot([FromBody] ForgotPasswordRequest request)
        {
            if (!_userService.IsValidEmail(request?.Email ?? ""))
                return BadRequest("Invalid email format.");

            await _resetService.RequestByEmailAsync(request!.Email);
            return Ok(new { message = "If the email is registered, a reset link was sent." });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateTokenRequest request)
        {
            var user = await _resetService.GetUserForTokenAsync(request?.Token ?? "");
            if (user == null)
                return BadRequest("Invalid or expired reset link.");

            return Ok(new { email = user.Email });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> Reset([FromBody] ResetPasswordRequest request)
        {
            if (!_userService.IsValidPassword(request?.Password ?? ""))
                return BadRequest("Password must be at least 5 characters long and contain both letters and numbers.");

            if (!await _resetService.ResetPasswordAsync(request!.Token, request.Password))
                return BadRequest("Invalid or expired reset link.");

            return Ok();
        }

        // An admin creates a reset link for a user in their own office
        [Authorize(Roles = "Admin")]
        [HttpPost("admin-link/{userId}")]
        public async Task<IActionResult> CreateAdminLink(int userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null || !await IsInMyOfficeAsync(user.GroupId))
                return NotFound();

            var link = await _resetService.CreateLinkForUserAsync(user);
            return Ok(new { resetLink = link });
        }
    }
}
