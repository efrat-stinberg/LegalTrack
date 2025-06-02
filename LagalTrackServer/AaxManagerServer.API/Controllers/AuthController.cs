using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IRepositoryManager _repositoryManager;
        private readonly IUserService _userService;

        public AuthController(IConfiguration configuration, IUserRepository userRepository, IRepositoryManager repositoryManager, IUserService userService)
        {
            _configuration = configuration;
            _userRepository = userRepository;
            _repositoryManager = repositoryManager;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginModel loginModel)
        {
            if (!_userService.IsValidEmail(loginModel.Email))
            {
                return BadRequest("Invalid email format.");
            }

            if (!_userService.IsValidPassword(loginModel.Password))
            {
                return BadRequest("Password must be at least 5 characters long and contain both letters and numbers.");
            }

            var user = await _userRepository.GetByEmailAsync(loginModel.Email);
            if (user != null && loginModel.Email == user.Email && loginModel.Password == user.Password)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString())
                };

                var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetValue<string>("JWT:Key")));
                var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
                var tokenOptions = new JwtSecurityToken(
                    issuer: _configuration.GetValue<string>("JWT:Issuer"),
                    audience: _configuration.GetValue<string>("JWT:Audience"),
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(6),
                    signingCredentials: signinCredentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
                return Ok(new { Token = tokenString });
            }
            return Unauthorized();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserPostModel registerModel)
        {
            if (!_userService.IsValidEmail(registerModel.Email))
            {
                return BadRequest("Invalid email format.");
            }

            if (!_userService.IsValidPassword(registerModel.Password))
            {
                return BadRequest("Password must be at least 5 characters long and contain both letters and numbers.");
            }

            var existingUser = await _userRepository.GetByEmailAsync(registerModel.Email);
            if (existingUser != null)
            {
                return Conflict("User with this email already exists.");
            }

            var newUser = new User
            {
                UserName = registerModel.UserName,
                Email = registerModel.Email,
                Password = registerModel.Password,
            };

            await _userRepository.AddAsync(newUser);
            await _repositoryManager.SaveAsync();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, newUser.UserName),
                new Claim(ClaimTypes.NameIdentifier, newUser.UserId.ToString())
            };

            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetValue<string>("JWT:Key")));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var tokenOptions = new JwtSecurityToken(
                issuer: _configuration.GetValue<string>("JWT:Issuer"),
                audience: _configuration.GetValue<string>("JWT:Audience"),
                claims: claims,
                expires: DateTime.Now.AddMinutes(6),
                signingCredentials: signinCredentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return Ok(new { Token = tokenString });
        }
    }
}
