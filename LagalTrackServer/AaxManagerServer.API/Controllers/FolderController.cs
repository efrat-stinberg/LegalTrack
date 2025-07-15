using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.ObjectModel;
using System.Security.Claims;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;

[Route("api/folders")]
[ApiController]
[Authorize]
public class FolderController : ControllerBase
{
    private readonly IFolderService _folderService;
    private readonly IMapper _mapper;
    private readonly IUserService _userService;

    public FolderController(IFolderService folderService, IMapper mapper, IUserService userService)
    {
        _folderService = folderService;
        _mapper = mapper;
        _userService = userService;
    }

    private async Task<int?> GetGroupIdFromUserAsync()
    {
        Console.WriteLine("-------------------------------------");
        Console.WriteLine("-------------------------------------");
        Console.WriteLine("-------------------------------------");
        Console.WriteLine("i entered to GetGroupIdFromUserAsync");
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine(userIdClaim);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return null;

        var user = await _userService.GetByIdAsync(userId);
        return user?.GroupId;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Folder>>> GetAll()
    {
        Console.WriteLine("-------------------------------------");
        Console.WriteLine("-------------------------------------");
        Console.WriteLine("-------------------------------------");
        var groupId = await GetGroupIdFromUserAsync();
        if (groupId == null)
            return Unauthorized("Group ID could not be resolved from user.");

        var folders = await _folderService.GetAllByGroupAsync(groupId.Value);
        return Ok(folders);
    }

    [HttpGet("by-client/{clientId}")]
    public async Task<ActionResult<List<FolderDTO>>> GetByClient(int clientId)
    {
        var folders = await _folderService.GetAllByClientAsync(clientId);
        var dtos = _mapper.Map<List<FolderDTO>>(folders);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FolderDTO>> GetById(int id)
    {
        var groupId = await GetGroupIdFromUserAsync();
        var folder = await _folderService.GetByIdAsync(id);

        if (folder == null || folder.GroupId != groupId)
            return NotFound();

        var folderDto = _mapper.Map<FolderDTO>(folder);
        return Ok(folderDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put(int id, [FromBody] FolderPostModel folder)
    {
        if (folder == null)
            return BadRequest("Invalid folder data.");

        var groupId = await GetGroupIdFromUserAsync();
        var existingFolder = await _folderService.GetByIdAsync(id);

        if (existingFolder == null || existingFolder.GroupId != groupId)
            return NotFound();

        existingFolder.FolderName = folder.FolderName;
        existingFolder.ClientId = folder.ClientId;
        await _folderService.UpdateAsync(existingFolder);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var groupId = await GetGroupIdFromUserAsync();
        var existingFolder = await _folderService.GetByIdAsync(id);

        if (existingFolder == null || existingFolder.GroupId != groupId)
            return NotFound();

        await _folderService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<FolderDTO>> Post([FromBody] FolderPostModel folderPostModel)
    {
        if (folderPostModel == null || string.IsNullOrEmpty(folderPostModel.FolderName))
            return BadRequest("Invalid folder data.");

        var groupId = await GetGroupIdFromUserAsync();
        if (groupId == null)
            return Unauthorized();

        var newFolder = new Folder
        {
            FolderName = folderPostModel.FolderName,
            GroupId = groupId.Value,
            ClientId = folderPostModel.ClientId,
            CreatedDate = DateTime.Now,
            Documents = new Collection<Document>()
        };

        await _folderService.AddAsync(newFolder);

        var folderDto = new FolderDTO
        {
            FolderId = newFolder.FolderId,
            FolderName = newFolder.FolderName,
            CreatedDate = newFolder.CreatedDate,
        };

        return Ok(folderDto);
    }

    [HttpGet("folders/{folderId}/extracted-text")]
    public async Task<IActionResult> GetExtractedText(int folderId)
    {
        var groupId = await GetGroupIdFromUserAsync();
        var folder = await _folderService.GetByIdAsync(folderId);

        if (folder == null || folder.GroupId != groupId)
            return NotFound();

        var text = await _folderService.GetExtractedTextFromFolderAsync(folderId);
        return Ok(text);
    }
}
