using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Service;

namespace TaxManagerServer.API.Controllers
{
    // Receives the browser's PUT / GET on the signed URLs handed out by LocalFileStorageService.
    // Anonymous on purpose: like an S3 pre-signed URL, access is granted by the signature and expiry.
    [Route("api/localfiles")]
    [ApiController]
    [AllowAnonymous]
    public class LocalFilesController : ControllerBase
    {
        private const long MaxUploadBytes = 50L * 1024 * 1024;
        private readonly LocalFileStorageService _storage;

        public LocalFilesController(LocalFileStorageService storage)
        {
            _storage = storage;
        }

        [HttpPut("upload")]
        [RequestSizeLimit(MaxUploadBytes + 1024 * 1024)]
        public async Task<IActionResult> Upload([FromQuery] string objectKey, [FromQuery] long expires,
            [FromQuery] string? contentType, [FromQuery] string? signature)
        {
            if (string.IsNullOrWhiteSpace(objectKey) ||
                !_storage.VerifySignature("PUT", objectKey, expires, contentType ?? "", signature))
                return StatusCode(StatusCodes.Status403Forbidden, "Invalid or expired upload link.");

            if (Request.ContentLength > MaxUploadBytes)
                return StatusCode(StatusCodes.Status413PayloadTooLarge, "File is larger than 50MB.");

            try
            {
                await _storage.UploadFileToS3Async(Request.Body, objectKey, contentType ?? "application/octet-stream");
                return Ok();
            }
            catch (FileNotFoundException)
            {
                return BadRequest("Invalid object key.");
            }
        }

        [HttpGet("download")]
        public async Task<IActionResult> Download([FromQuery] string objectKey, [FromQuery] long expires,
            [FromQuery] string? signature)
        {
            if (string.IsNullOrWhiteSpace(objectKey) ||
                !_storage.VerifySignature("GET", objectKey, expires, "", signature))
                return StatusCode(StatusCodes.Status403Forbidden, "Invalid or expired download link.");

            try
            {
                var (stream, contentType) = await _storage.DownloadFileAsync(objectKey);
                return File(stream, contentType);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found.");
            }
        }
    }
}
