using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]

    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;
        private readonly IMapper _mapper;

        public GroupController(IGroupService groupService, IMapper mapper)
        {
            _groupService = groupService;
            _mapper = mapper;
        }

        // GET: api/Group
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GroupDto>>> GetAllGroups()
        {
            var groups = await _groupService.GetAllGroupsAsync();
            var groupDtos = _mapper.Map<IEnumerable<GroupDto>>(groups);
            return Ok(groupDtos);
        }

        // GET: api/Group/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GroupDto>> GetGroupById(int id)
        {
            var group = await _groupService.GetGroupByIdAsync(id);
            if (group == null)
                return NotFound();

            var groupDto = _mapper.Map<GroupDto>(group);
            return Ok(groupDto);
        }

        // POST: api/Group
        [HttpPost]
        public async Task<ActionResult<GroupDto>> CreateGroup([FromBody] GroupDto groupDto)
        {
            var group = _mapper.Map<Group>(groupDto);
            var createdGroup = await _groupService.CreateGroupAsync(group);
            var createdGroupDto = _mapper.Map<GroupDto>(createdGroup);
            return CreatedAtAction(nameof(GetGroupById), new { id = createdGroup.Id }, createdGroupDto);
        }
    }
}
