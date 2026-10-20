using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InviteController : OfficeControllerBase
    {
        private readonly IInviteService _inviteService;
        private readonly IUserService _userService;

        public InviteController(IInviteService inviteService, IUserService userService)
        {
            _inviteService = inviteService;
            _userService = userService;
        }

        // Always returns the invite link. If the email could not be sent, EmailSent is false and
        // EmailError says why, so the admin can still pass the link on (e.g. by WhatsApp).
        [Authorize(Roles = "Admin")]
        [HttpPost("invite-lawyer")]
        public async Task<IActionResult> InviteLawyer([FromBody] InviteLawyerModel model)
        {
            if (!_userService.IsValidEmail(model?.Email ?? ""))
                return BadRequest("Invalid email format.");

            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Unauthorized("Group ID not found.");

            if (await _userService.GetByEmailAsync(model!.Email) != null)
                return Conflict("A user with this email already exists.");

            var result = await _inviteService.CreateInviteAsync(model.Email.Trim(), groupId.Value);

            return Ok(new
            {
                Token = result.Invite.Token,
                result.InviteLink,
                result.EmailSent,
                result.EmailError
            });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateInviteToken([FromBody] ValidateTokenRequest request)
        {
            var invite = await _inviteService.GetValidInviteAsync(request?.Token ?? "");
            if (invite == null)
                return BadRequest("Invalid or expired token.");

            return Ok(new
            {
                email = invite.Email,
                groupId = invite.GroupId
            });
        }
    }
}
