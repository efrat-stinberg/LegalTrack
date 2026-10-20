using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    // Offices are created by /api/register-admin; users only see their own office.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupController : OfficeControllerBase
    {
        private readonly IGroupService _groupService;
        private readonly IMapper _mapper;

        public GroupController(IGroupService groupService, IMapper mapper)
        {
            _groupService = groupService;
            _mapper = mapper;
        }

        // GET: api/Group — the caller's own office
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GroupDto>>> GetAllGroups()
        {
            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Ok(Array.Empty<GroupDto>());

            var group = await _groupService.GetGroupByIdAsync(groupId.Value);
            return Ok(group == null ? Array.Empty<GroupDto>() : new[] { _mapper.Map<GroupDto>(group) });
        }

        // GET: api/Group/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GroupDto>> GetGroupById(int id)
        {
            if (!await IsInMyOfficeAsync(id))
                return NotFound();

            var group = await _groupService.GetGroupByIdAsync(id);
            if (group == null)
                return NotFound();

            return Ok(_mapper.Map<GroupDto>(group));
        }
    }
}
