using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Controllers;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Services;

namespace TaxManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentController : OfficeControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IFolderService _folderService;
        private readonly IS3Service _s3Service;
        private readonly IMapper _mapper;

        public DocumentController(IDocumentService documentService, IFolderService folderService, IS3Service s3Service, IMapper mapper)
        {
            _documentService = documentService;
            _folderService = folderService;
            _s3Service = s3Service;
            _mapper = mapper;
        }

        private async Task<bool> IsOwnFolderAsync(int folderId)
        {
            var folder = await _folderService.GetByIdAsync(folderId);
            return folder != null && await IsInMyOfficeAsync(folder.GroupId);
        }

        private async Task<Document?> GetOwnDocumentAsync(int id)
        {
            var document = await _documentService.GetByIdAsync(id);
            return document != null && await IsOwnFolderAsync(document.FolderId) ? document : null;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDTO>>> Get()
        {
            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Unauthorized();

            var documents = await _documentService.GetAllByGroupAsync(groupId.Value);
            return Ok(_mapper.Map<IEnumerable<DocumentDTO>>(documents));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDTO>> Get(int id)
        {
            var document = await GetOwnDocumentAsync(id);
            if (document == null)
                return NotFound();

            return Ok(_mapper.Map<DocumentDTO>(document));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DocumentPostModel document)
        {
            if (document == null || string.IsNullOrWhiteSpace(document.DocumentName) || string.IsNullOrWhiteSpace(document.FilePath))
                return BadRequest("Document name and file path are required.");

            if (!await IsOwnFolderAsync(document.FolderId))
                return BadRequest("Folder not found.");

            var documentToAdd = new Document
            {
                DocumentName = document.DocumentName,
                FilePath = document.FilePath,
                FolderId = document.FolderId,
                UploadDate = DateTime.UtcNow
            };

            await _documentService.AddAsync(documentToAdd);
            return CreatedAtAction(nameof(Get), new { id = documentToAdd.DocumentId }, _mapper.Map<DocumentDTO>(documentToAdd));
        }

        // Renames a document or moves it to another case of the same office.
        // The stored file (FilePath) is not changed here.
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] DocumentPostModel document)
        {
            if (document == null || string.IsNullOrWhiteSpace(document.DocumentName))
                return BadRequest("Document name is required.");

            var existingDocument = await GetOwnDocumentAsync(id);
            if (existingDocument == null)
                return NotFound();

            if (document.FolderId != 0 && document.FolderId != existingDocument.FolderId)
            {
                if (!await IsOwnFolderAsync(document.FolderId))
                    return BadRequest("Folder not found.");
                existingDocument.FolderId = document.FolderId;
            }

            existingDocument.DocumentName = document.DocumentName;
            await _documentService.UpdateAsync(existingDocument);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingDocument = await GetOwnDocumentAsync(id);
            if (existingDocument == null)
                return NotFound();

            await _s3Service.DeleteFileAsync(existingDocument.FilePath);
            await _documentService.DeleteAsync(id);
            return NoContent();
        }
    }
}
