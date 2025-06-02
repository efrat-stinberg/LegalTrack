using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using TaxManager.Service;
using TaxManagerServer.Core.DTOs;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using System;
using Microsoft.EntityFrameworkCore;
using Amazon.S3.Model;
using Amazon.S3;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class S3Controller : ControllerBase
    {
        private readonly IS3Service _s3Service;
        private readonly IDocumentService _documentService;

        public S3Controller(IS3Service s3Service, IDocumentService documentService)
        {
            _s3Service = s3Service;
            _documentService = documentService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int folderId)
        {
            Console.WriteLine($"Received file: {file?.FileName}, size: {file?.Length}, folderId: {folderId}");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");
            //var objectKey = Path.GetFileName(file.FileName);
            var safeFileName = Uri.EscapeDataString(file.FileName);
            var objectKey = $"{Guid.NewGuid()}_{safeFileName}";
            Console.WriteLine($"========object key :{objectKey}");

            //var objectKey = $"uploads/{Guid.NewGuid()}_{file.FileName}";

            var contentType = file.ContentType ?? "application/octet-stream";

            try
            {
                using var stream = file.OpenReadStream();
                var url = await _s3Service.UploadFileToS3Async(stream, objectKey, contentType);

                var document = new Document
                {
                    DocumentName = file.FileName,
                    FilePath = objectKey,
                    FolderId = folderId,
                    UploadDate = DateTime.UtcNow
                };

                await _documentService.AddAsync(document);
                return Ok(new { Url = url });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload failed: {ex}");
                return StatusCode(500, $"Error uploading file to S3: {ex.Message}");
            }
        }

        [HttpGet("presigned-upload-url")]
        public IActionResult GetPreSignedUploadUrl([FromQuery] string fileName, [FromQuery] string contentType)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest("Missing file name.");

            if (string.IsNullOrWhiteSpace(contentType))
                contentType = "application/octet-stream"; // fallback

            //var key = $"uploads/{Guid.NewGuid()}_{fileName}";
            var safeFileName = Uri.EscapeDataString(fileName);
            var objectKey = $"{Guid.NewGuid()}_{safeFileName}";
            var url = _s3Service.GeneratePreSignedURL(objectKey, contentType, TimeSpan.FromMinutes(10));

            return Ok(new { uploadUrl = url, objectKey = objectKey });
        }



        [HttpGet("presigned-download-url")]
        public ActionResult<string> GetPreSignedDownloadUrl([FromQuery] string objectKey)
        {
            if (string.IsNullOrWhiteSpace(objectKey))
                return BadRequest("Missing object key.");

            objectKey = objectKey.TrimStart('/');
            var url = _s3Service.GeneratePreSignedURL(objectKey, null, TimeSpan.FromMinutes(5));
            return Ok(new { Url = url });
        }


        [HttpGet("download")]
        public async Task<IActionResult> DownloadFile([FromQuery] string objectKey)
        {
            if (string.IsNullOrWhiteSpace(objectKey))
                return BadRequest("Missing object key.");

            objectKey = objectKey.TrimStart('/');

            try
            {
                var (stream, contentType) = await _s3Service.DownloadFileFromS3Async(objectKey);
                return File(stream, contentType ?? "application/octet-stream", objectKey);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found in S3.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error downloading file from S3: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> ListFiles([FromQuery] string folderPrefix)
        {
            try
            {
                var files = await _s3Service.ListFilesInFolderAsync(folderPrefix);
                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error listing files from S3: {ex.Message}");
            }
        }

        [HttpPost("notify-upload")]
        public async Task<IActionResult> NotifyUpload([FromBody] NotifyUploadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ObjectKey) || string.IsNullOrWhiteSpace(dto.ContentType))
            {
                return BadRequest(new { error = "Missing object key or content type" });
            }

            Console.WriteLine($"Uploaded file to folder {dto.FolderId}: {dto.ObjectKey} ({dto.ContentType})");

            var document = new Document
            {
                DocumentName = Path.GetFileName(dto.ObjectKey),
                FilePath = dto.ObjectKey,
                FolderId = dto.FolderId,
                UploadDate = DateTime.UtcNow
            };

            await _documentService.AddAsync(document);
            return Ok(new { message = "Upload notification received and document saved." });
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteByFileKey([FromQuery] string fileKey)
        {
            Console.WriteLine($"Received fileKey: {fileKey}");

            if (string.IsNullOrWhiteSpace(fileKey))
                return BadRequest("File key is required");

            // פענח את ה-URL encoding
            var decodedFileKey = Uri.UnescapeDataString(fileKey);
            Console.WriteLine($"Decoded fileKey: {decodedFileKey}");

            var document = await _documentService.GetByFilePathAsync(decodedFileKey);

            if (document == null)
                return NotFound($"Document not found: {decodedFileKey}");

            await _s3Service.DeleteFileAsync(document.FilePath);
            await _documentService.DeleteAsync(document.DocumentId);

            return NoContent();
        }

    }
}
