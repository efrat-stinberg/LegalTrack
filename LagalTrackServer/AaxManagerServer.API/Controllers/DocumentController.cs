using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace TaxManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IMapper _mapper;

        public DocumentController(IDocumentService documentService, IMapper mapper)
        {
            _documentService = documentService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDTO>>> Get()
        {
            var documents = await _documentService.GetAllAsync();
            var documentsDto = _mapper.Map<IEnumerable<DocumentDTO>>(documents);
            return Ok(documentsDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDTO>> Get(int id)
        {
            var document = await _documentService.GetByIdAsync(id);
            if (document == null)
            {
                return NotFound();
            }
            var documentDto = _mapper.Map<DocumentDTO>(document);
            return Ok(documentDto);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DocumentPostModel document)
        {
            if (document == null)
            {
                return BadRequest("Document is null.");
            }

            var documentToAdd = new Document
            {
                DocumentName = document.DocumentName,
                FilePath = document.FilePath,
                FolderId = document.FolderId
            };

            await _documentService.AddAsync(documentToAdd);
            return CreatedAtAction(nameof(Get), new { id = documentToAdd.DocumentId }, document);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] DocumentPostModel document)
        {
            if (document == null)
            {
                return BadRequest("Document is null or ID mismatch.");
            }

            var existingDocument = await _documentService.GetByIdAsync(id);
            if (existingDocument == null)
            {
                return NotFound();
            }

            var documentToUpdate = new Document
            {
                DocumentName = document.DocumentName,
                FilePath = document.FilePath,
                FolderId = document.FolderId
            };

            await _documentService.UpdateAsync(documentToUpdate);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingDocument = await _documentService.GetByIdAsync(id);
            if (existingDocument == null)
            {
                return NotFound();
            }

            await _documentService.DeleteAsync(id);
            return NoContent();
        }
    }
}
