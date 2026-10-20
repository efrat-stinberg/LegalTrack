using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Controllers;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;

namespace TaxManager.API.Controllers
{
    // Users are created only through /api/register-admin and the invite flow (/api/register).
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : OfficeControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public UsersController(IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }

        // The caller may see a user if it is themself or someone in their office
        private async Task<bool> CanSeeAsync(User user)
        {
            var me = await GetCurrentUserAsync();
            return me != null && (me.UserId == user.UserId || (me.GroupId != null && me.GroupId == user.GroupId));
        }

        // GET: api/users — the admin's office only
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> Get()
        {
            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Ok(Array.Empty<UserDTO>());

            var users = await _userService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<UserDTO>>(users.Where(u => u.GroupId == groupId)));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDTO>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null || !await CanSeeAsync(user))
                return NotFound();

            return Ok(_mapper.Map<UserDTO>(user));
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<UserDTO>> GetByEmail(string email)
        {
            var user = await _userService.GetByEmailAsync(email);
            if (user == null || !await CanSeeAsync(user))
                return NotFound();

            return Ok(_mapper.Map<UserDTO>(user));
        }

        // A user may edit themself; an admin may edit users of their office
        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] UserPutModel updatedUser)
        {
            if (string.IsNullOrWhiteSpace(updatedUser?.UserName))
                return BadRequest("User name is required.");
            if (!_userService.IsValidEmail(updatedUser.Email))
                return BadRequest("Invalid email format.");

            var me = await GetCurrentUserAsync();
            var existingUser = await _userService.GetByIdAsync(id);
            if (me == null || existingUser == null || !await CanSeeAsync(existingUser))
                return NotFound();
            if (me.UserId != id && !me.IsAdmin)
                return Forbid();

            if (!string.Equals(existingUser.Email, updatedUser.Email, StringComparison.OrdinalIgnoreCase)
                && await _userService.GetByEmailAsync(updatedUser.Email) != null)
                return Conflict("A user with this email already exists.");

            await _userService.UpdateAsync(id, new User { Email = updatedUser.Email, UserName = updatedUser.UserName.Trim() });
            return NoContent();
        }

        // An admin may remove other users of their office
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            var me = await GetCurrentUserAsync();
            var user = await _userService.GetByIdAsync(id);
            if (me == null || user == null || !await CanSeeAsync(user))
                return NotFound();
            if (user.UserId == me.UserId)
                return BadRequest("You cannot delete your own account.");

            await _userService.DeleteAsync(id);
            return NoContent();
        }
    }
}
