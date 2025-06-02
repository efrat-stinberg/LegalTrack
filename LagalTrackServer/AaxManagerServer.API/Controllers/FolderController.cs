using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Security.Claims;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Models.TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;

namespace TaxManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FolderController : ControllerBase
    {
        private readonly IFolderService _folderService;
        private readonly IMapper _mapper;

        public FolderController(IFolderService folderService, IMapper mapper)
        {
            _folderService = folderService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Folder>>> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token or is not a valid integer.");
            }

            var folders = await _folderService.GetAllAsync(userId);
            return Ok(folders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FolderDTO>> GetById(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var folder = await _folderService.GetByIdAsync(id);
            if (folder == null || folder.UserId.ToString() != userId)
            {
                return NotFound();
            }

            var folderDto = _mapper.Map<FolderDTO>(folder);
            return Ok(folderDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] FolderPostModel folder)
        {
            if (folder == null)
            {
                return BadRequest("Invalid folder data.");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var existingFolder = await _folderService.GetByIdAsync(id);
            if (existingFolder == null || existingFolder.UserId.ToString() != userId)
            {
                return NotFound();
            }

            existingFolder.FolderName = folder.FolderName;
            await _folderService.UpdateAsync(existingFolder);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var existingFolder = await _folderService.GetByIdAsync(id);
            if (existingFolder == null || existingFolder.UserId.ToString() != userId)
            {
                return NotFound();
            }

            await _folderService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<FolderDTO>> Post([FromBody] FolderPostModel folderPostModel)
        {
            if (folderPostModel == null || string.IsNullOrEmpty(folderPostModel.FolderName))
            {
                return BadRequest("Invalid folder data.");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var newFolder = new Folder
            {
                FolderName = folderPostModel.FolderName,
                UserId = int.Parse(userId),
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
            var text = await _folderService.GetExtractedTextFromFolderAsync(folderId);
            return Ok(text);
        }


    }
}
