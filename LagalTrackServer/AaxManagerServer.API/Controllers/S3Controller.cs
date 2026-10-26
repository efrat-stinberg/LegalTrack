using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class S3Controller : OfficeControllerBase
    {
        // Matches the 50MB limit the React upload screen enforces
        private const long MaxUploadBytes = 50L * 1024 * 1024;

        private readonly IS3Service _s3Service;
        private readonly IDocumentService _documentService;
        private readonly IFolderService _folderService;

        public S3Controller(IS3Service s3Service, IDocumentService documentService, IFolderService folderService)
        {
            _s3Service = s3Service;
            _documentService = documentService;
            _folderService = folderService;
        }

        private async Task<bool> IsOwnFolderAsync(int folderId)
        {
            var folder = await _folderService.GetByIdAsync(folderId);
            return folder != null && await IsInMyOfficeAsync(folder.GroupId);
        }

        // Finds the document stored under this S3 key, only if it belongs to the caller's office
        private async Task<Document?> GetOwnDocumentByKeyAsync(string objectKey)
        {
            var document = await _documentService.GetByFilePathAsync(objectKey.TrimStart('/'));
            return document != null && await IsOwnFolderAsync(document.FolderId) ? document : null;
        }

        [HttpPost("upload")]
        [RequestSizeLimit(MaxUploadBytes + 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadBytes + 1024 * 1024)]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int folderId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");
            if (file.Length > MaxUploadBytes)
                return StatusCode(StatusCodes.Status413PayloadTooLarge, "File is larger than 50MB.");
            if (!await IsOwnFolderAsync(folderId))
                return BadRequest("Folder not found.");

            var safeFileName = Uri.EscapeDataString(file.FileName);
            var objectKey = $"{Guid.NewGuid()}_{safeFileName}";
            var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;

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
                return Ok(new { Url = url, document.DocumentId, ObjectKey = objectKey });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload failed: {ex}");
                return StatusCode(500, $"Error uploading file to S3: {ex.Message}");
            }
        }

        // Step 1 of a direct browser upload: a short-lived URL the browser PUTs the file to
        [HttpGet("presigned-upload-url")]
        public async Task<IActionResult> GetPreSignedUploadUrl([FromQuery] int folderId, [FromQuery] string fileName,
            [FromQuery] string? contentType, [FromQuery] long? size)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest("Missing file name.");
            if (size <= 0)
                return BadRequest("No file uploaded.");
            if (size > MaxUploadBytes)
                return StatusCode(StatusCodes.Status413PayloadTooLarge, "File is larger than 50MB.");
            if (!await IsOwnFolderAsync(folderId))
                return BadRequest("Folder not found.");

            if (string.IsNullOrWhiteSpace(contentType))
                contentType = "application/octet-stream";

            var objectKey = $"{Guid.NewGuid()}_{Uri.EscapeDataString(fileName)}";
            try
            {
                var url = _s3Service.GeneratePreSignedUploadURL(objectKey, contentType, TimeSpan.FromMinutes(15));
                return Ok(new { uploadUrl = url, objectKey, contentType });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error preparing the S3 upload: {ex.Message}");
            }
        }

        [HttpGet("presigned-download-url")]
        public async Task<IActionResult> GetPreSignedDownloadUrl([FromQuery] string objectKey)
        {
            if (string.IsNullOrWhiteSpace(objectKey))
                return BadRequest("Missing object key.");

            var document = await GetOwnDocumentByKeyAsync(objectKey);
            if (document == null)
                return NotFound("Document not found.");

            var url = _s3Service.GeneratePreSignedURL(document.FilePath, null!, TimeSpan.FromMinutes(5));
            return Ok(new { Url = url });
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadFile([FromQuery] string objectKey)
        {
            if (string.IsNullOrWhiteSpace(objectKey))
                return BadRequest("Missing object key.");

            var document = await GetOwnDocumentByKeyAsync(objectKey);
            if (document == null)
                return NotFound("Document not found.");

            try
            {
                var (stream, contentType) = await _s3Service.DownloadFileFromS3Async(document.FilePath);
                return File(stream, contentType ?? "application/octet-stream", document.DocumentName);
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

        // Step 2 of a direct browser upload: saves the document once the file is in S3
        [HttpPost("notify-upload")]
        public async Task<IActionResult> NotifyUpload([FromBody] NotifyUploadDto dto)
        {
            // Only keys this API hands out: "<guid>_<escaped name>", no folders
            var parts = (dto.ObjectKey ?? "").Split('_', 2);
            if (parts.Length != 2 || !Guid.TryParse(parts[0], out _) || parts[1].Length == 0 || parts[1].Contains('/'))
                return BadRequest(new { error = "Invalid object key" });
            if (!await IsOwnFolderAsync(dto.FolderId))
                return BadRequest(new { error = "Folder not found" });
            if (await _documentService.GetByFilePathAsync(dto.ObjectKey!) != null)
                return Conflict(new { error = "This file is already registered" });

            long? size;
            try
            {
                size = await _s3Service.GetObjectSizeAsync(dto.ObjectKey!);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error checking the file in S3: {ex.Message}" });
            }
            if (size == null)
                return BadRequest(new { error = "The file was not found in S3" });
            if (size > MaxUploadBytes)
            {
                await _s3Service.DeleteFileAsync(dto.ObjectKey!);
                return StatusCode(StatusCodes.Status413PayloadTooLarge, new { error = "File is larger than 50MB." });
            }

            var document = new Document
            {
                DocumentName = string.IsNullOrWhiteSpace(dto.FileName) ? Uri.UnescapeDataString(parts[1]) : dto.FileName.Trim(),
                FilePath = dto.ObjectKey!,
                FolderId = dto.FolderId,
                UploadDate = DateTime.UtcNow
            };

            await _documentService.AddAsync(document);
            return Ok(new { document.DocumentId, document.DocumentName, ObjectKey = document.FilePath });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteByFileKey([FromQuery] string fileKey)
        {
            if (string.IsNullOrWhiteSpace(fileKey))
                return BadRequest("File key is required");

            // React sends the stored key URL-encoded once more; decode it back
            var decodedFileKey = Uri.UnescapeDataString(fileKey);
            var document = await GetOwnDocumentByKeyAsync(decodedFileKey)
                           ?? await GetOwnDocumentByKeyAsync(fileKey);
            if (document == null)
                return NotFound("Document not found.");

            await _s3Service.DeleteFileAsync(document.FilePath);
            await _documentService.DeleteAsync(document.DocumentId);

            return NoContent();
        }
    }
}
