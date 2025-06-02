using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManager.Service;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;

namespace TaxManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public UsersController(IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }

        // GET: api/<UsersController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> Get()
        {
            var users = await _userService.GetAllAsync(); // Use async method
            var usersDto = _mapper.Map<IEnumerable<UserDTO>>(users);
            return Ok(usersDto);
        }

        // GET api/<UsersController>/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<User>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id); // Use async method
            if (user == null)
            {
                return NotFound();
            }
            var userDto = _mapper.Map<UserDTO>(user);
            return Ok(userDto);
        }


        [HttpGet("{email}")]
        public async Task<ActionResult<User>> GetByEmail(string email)
        {
            var user = await _userService.GetByEmailAsync(email); // Use async method
            if (user == null)
            {
                return NotFound();
            }
            var userDto = _mapper.Map<UserDTO>(user);
            return Ok(userDto);
        }

        //[HttpGet]
        //public async Task<IActionResult> GetUser()
        //{
        //    // קבלת ה-ID מה-Middleware
        //    if (!HttpContext.Items.TryGetValue("UserId", out var userId))
        //    {
        //        return Unauthorized();
        //    }

        //    var user = await _userService.GetByIdAsync(int.Parse(userId.ToString()));
        //    if (user == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(user);
        //}

        // POST api/<UsersController>
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] UserPostModel newUser)
        {
            if (newUser == null)
            {
                return BadRequest();
            }

            var userToAdd = new User { UserName = newUser.Email, Password = newUser.Password , Email = newUser.Email};
            await _userService.AddAsync(userToAdd); // Use async method
            return CreatedAtAction(nameof(Get), new { id = userToAdd.UserId }, newUser);
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] UserPutModel updatedUser)
        {
            var existingUser = await _userService.GetByIdAsync(id); // Use async method
            if (existingUser == null)
            {
                return NotFound();
            }

            var userToUpdate = new User { Email = updatedUser.Email, UserName = updatedUser.UserName}; // Set UserId for update
            await _userService.UpdateAsync(id, userToUpdate); // Pass id as the first argument
            return NoContent();
        }


        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var user = await _userService.GetByIdAsync(id); // Use async method
            if (user == null)
            {
                return NotFound();
            }

            await _userService.DeleteAsync(id); // Use async method
            return NoContent();
        }
    }
}
