using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InviteController : ControllerBase
    {
        private readonly IInviteService _inviteService;

        public InviteController(IInviteService inviteService)
        {
            _inviteService = inviteService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("invite-lawyer")]
        public async Task<IActionResult> InviteLawyer([FromBody] InviteLawyerModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var groupIdClaim = User.Claims.FirstOrDefault(c => c.Type == "GroupId");
            if (groupIdClaim == null)
                return Unauthorized("Group ID not found.");

            int groupId = int.Parse(groupIdClaim.Value);

            var invite = await _inviteService.CreateInviteAsync(model.Email, groupId);

            return Ok(new { Token = invite.Token });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateInviteToken([FromBody] ValidateTokenRequest request)
        {
            var invite = await _inviteService.GetInviteByTokenAsync(request.Token);
            if (invite == null || invite.IsUsed || invite.CreatedAt.AddMinutes(15) < DateTime.UtcNow)
                return BadRequest("Invalid or expired token.");

            return Ok(new
            {
                email = invite.Email,
                groupId = invite.GroupId
            });
        }

    }
}
