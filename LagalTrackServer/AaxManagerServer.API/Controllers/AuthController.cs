using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IRepositoryManager _repositoryManager;
        private readonly IUserService _userService;
        private readonly IAuthService _authService;
        private readonly IInviteService _inviteService;

        public AuthController(
            IConfiguration configuration,
            IUserRepository userRepository,
            IRepositoryManager repositoryManager,
            IUserService userService,
            IAuthService authService,
            IInviteService inviteService)
        {
            _configuration = configuration;
            _userRepository = userRepository;
            _repositoryManager = repositoryManager;
            _userService = userService;
            _authService = authService;
            _inviteService = inviteService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginModel loginModel)
        {
            if (!_userService.IsValidEmail(loginModel.Email))
                return BadRequest("Invalid email format.");

            // The password policy is enforced at registration; here we only check the password matches
            if (string.IsNullOrEmpty(loginModel.Password))
                return BadRequest("Password is required.");

            var user = await _userRepository.GetByEmailAsync(loginModel.Email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

            var passwordHasher = new PasswordHasher<User>();
            PasswordVerificationResult result;
            try
            {
                result = passwordHasher.VerifyHashedPassword(user, user.Password, loginModel.Password);
            }
            catch (FormatException)
            {
                // Stored value is not a hash (e.g. a user created by the old POST /api/users endpoint)
                result = PasswordVerificationResult.Failed;
            }
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid credentials.");

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Name))
                return BadRequest("Name is required.");

            if (!_userService.IsValidPassword(request.Password ?? ""))
                return BadRequest("Password must be at least 5 characters long and contain both letters and numbers.");

            var invite = await _inviteService.GetValidInviteAsync(request.Token);
            if (invite == null)
                return BadRequest("Invalid or expired token.");

            var email = invite.Email;
            var groupId = invite.GroupId;

            if (await _userRepository.GetByEmailAsync(email) != null)
                return Conflict("User already exists.");

            var newUser = new User
            {
                UserName = request.Name.Trim(),
                Email = email,
                GroupId = groupId,
                IsAdmin = false
            };

            var passwordHasher = new PasswordHasher<User>();
            newUser.Password = passwordHasher.HashPassword(newUser, request.Password);

            await _userRepository.AddAsync(newUser);
            invite.IsUsed = true;
            await _repositoryManager.SaveAsync();

            var token = _authService.GenerateJwtToken(newUser);
            return Ok(new { Token = token });
        }

        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] UserPostModel model)
        {
            if (string.IsNullOrWhiteSpace(model.UserName))
                return BadRequest("User name is required.");

            if (!_userService.IsValidEmail(model.Email))
                return BadRequest("Invalid email format.");

            if (!_userService.IsValidPassword(model.Password))
                return BadRequest("Password must be at least 5 characters long and contain both letters and numbers.");

            if (await _userRepository.GetByEmailAsync(model.Email) != null)
                return Conflict("User already exists.");

            var adminUser = new User
            {
                UserName = model.UserName,
                Email = model.Email,
                IsAdmin = true
            };

            var passwordHasher = new PasswordHasher<User>();
            adminUser.Password = passwordHasher.HashPassword(adminUser, model.Password);

            await _userRepository.AddAsync(adminUser);
            await _repositoryManager.SaveAsync();

            var group = new Group
            {
                Name = $"{model.UserName}'s Group",
                CreatedByUserId = adminUser.UserId
            };

            await _repositoryManager.GroupRepository.AddAsync(group);
            await _repositoryManager.SaveAsync();

            adminUser.GroupId = group.Id;
            await _userRepository.UpdateAsync(adminUser);
            await _repositoryManager.SaveAsync();

            var token = _authService.GenerateJwtToken(adminUser);
            return Ok(new { Token = token });
        }
    }
}
