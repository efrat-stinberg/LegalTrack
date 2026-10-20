using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.ObjectModel;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Controllers;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

[Route("api/folders")]
[ApiController]
[Authorize]
public class FolderController : OfficeControllerBase
{
    private readonly IFolderService _folderService;
    private readonly IClientService _clientService;
    private readonly IMapper _mapper;

    public FolderController(IFolderService folderService, IClientService clientService, IMapper mapper)
    {
        _folderService = folderService;
        _clientService = clientService;
        _mapper = mapper;
    }

    // Returns the folder only if it exists and belongs to the caller's office
    private async Task<Folder?> GetOwnFolderAsync(int id)
    {
        var folder = await _folderService.GetByIdAsync(id);
        return folder != null && await IsInMyOfficeAsync(folder.GroupId) ? folder : null;
    }

    private async Task<bool> IsOwnClientAsync(int clientId)
    {
        var client = await _clientService.GetByIdAsync(clientId);
        return client != null && await IsInMyOfficeAsync(client.GroupId);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Folder>>> GetAll()
    {
        var groupId = await GetCurrentGroupIdAsync();
        if (groupId == null)
            return Unauthorized("Group ID could not be resolved from user.");

        var folders = await _folderService.GetAllByGroupAsync(groupId.Value);
        return Ok(folders);
    }

    [HttpGet("by-client/{clientId}")]
    public async Task<ActionResult<List<FolderDTO>>> GetByClient(int clientId)
    {
        if (!await IsOwnClientAsync(clientId))
            return NotFound();

        var folders = await _folderService.GetAllByClientAsync(clientId);
        return Ok(_mapper.Map<List<FolderDTO>>(folders));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FolderDTO>> GetById(int id)
    {
        var folder = await GetOwnFolderAsync(id);
        if (folder == null)
            return NotFound();

        return Ok(_mapper.Map<FolderDTO>(folder));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put(int id, [FromBody] FolderPostModel folder)
    {
        if (folder == null || string.IsNullOrWhiteSpace(folder.FolderName))
            return BadRequest("Invalid folder data.");

        var existingFolder = await GetOwnFolderAsync(id);
        if (existingFolder == null)
            return NotFound();

        if (!await IsOwnClientAsync(folder.ClientId))
            return BadRequest("Client not found.");

        existingFolder.FolderName = folder.FolderName.Trim();
        existingFolder.ClientId = folder.ClientId;
        await _folderService.UpdateAsync(existingFolder);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        if (await GetOwnFolderAsync(id) == null)
            return NotFound();

        await _folderService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<FolderDTO>> Post([FromBody] FolderPostModel folderPostModel)
    {
        if (folderPostModel == null || string.IsNullOrWhiteSpace(folderPostModel.FolderName))
            return BadRequest("Invalid folder data.");

        var groupId = await GetCurrentGroupIdAsync();
        if (groupId == null)
            return Unauthorized();

        if (!await IsOwnClientAsync(folderPostModel.ClientId))
            return BadRequest("Client not found.");

        var newFolder = new Folder
        {
            FolderName = folderPostModel.FolderName.Trim(),
            GroupId = groupId.Value,
            ClientId = folderPostModel.ClientId,
            CreatedDate = DateTime.UtcNow,
            Documents = new Collection<Document>()
        };

        await _folderService.AddAsync(newFolder);

        var folderDto = new FolderDTO
        {
            FolderId = newFolder.FolderId,
            FolderName = newFolder.FolderName,
            CreatedDate = newFolder.CreatedDate,
            ClientId = newFolder.ClientId,
        };

        return Ok(folderDto);
    }

    [HttpGet("folders/{folderId}/extracted-text")]
    public async Task<IActionResult> GetExtractedText(int folderId)
    {
        if (await GetOwnFolderAsync(folderId) == null)
            return NotFound();

        var text = await _folderService.GetExtractedTextFromFolderAsync(folderId);
        return Ok(text);
    }
}
