using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using TaxManagerServer.Core.Services;

namespace TaxManager.Service
{
    // Stores the uploaded files in a folder on this computer instead of AWS S3.
    // Implements the same IS3Service contract, so the controllers and the React screens do not change.
    //
    // Layout on disk:  <root>/<guid>/<original file name>
    // The S3-style object key stays "<guid>_<escaped name>", exactly as before, so it keeps working
    // with the Documents table. The "pre-signed" URLs point to this API and are protected by an HMAC
    // signature (the browser sends no Authorization header on these requests, just like with S3).
    public class LocalFileStorageService : IS3Service
    {
        private const int MaxFileNameLength = 120;
        private static readonly FileExtensionContentTypeProvider ContentTypes = new();

        private readonly string _root;
        private readonly string _signingKey;
        private readonly string? _publicBaseUrl;
        private readonly IHttpContextAccessor _http;

        public LocalFileStorageService(IConfiguration configuration, IHttpContextAccessor http, string defaultRoot)
        {
            var configured = configuration["Storage:LocalPath"];
            _root = Path.GetFullPath(string.IsNullOrWhiteSpace(configured) ? defaultRoot : configured);
            Directory.CreateDirectory(_root);

            _signingKey = configuration["Storage:SigningKey"];
            if (string.IsNullOrWhiteSpace(_signingKey))
                _signingKey = configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured.");
            _publicBaseUrl = configuration["Storage:PublicBaseUrl"]?.TrimEnd('/');
            _http = http;
        }

        public string RootPath => _root;

        // ===== paths =====

        // "<guid>_<escaped name>"  ->  <root>/<guid>/<unescaped name, shortened>
        private string PathForKey(string objectKey)
        {
            var key = (objectKey ?? "").TrimStart('/');
            var parts = key.Split('_', 2);
            if (parts.Length != 2 || !Guid.TryParse(parts[0], out var guid) || parts[1].Length == 0)
                throw new FileNotFoundException("File not found");

            var name = Uri.UnescapeDataString(parts[1]);
            foreach (var c in Path.GetInvalidFileNameChars())
                name = name.Replace(c, '_');
            name = name.Trim().TrimEnd('.');
            if (name.Length == 0 || name == "." || name == "..")
                name = "file";
            if (name.Length > MaxFileNameLength)
            {
                var ext = Path.GetExtension(name);
                if (ext.Length > 15) ext = "";
                name = name.Substring(0, MaxFileNameLength - ext.Length) + ext;
            }

            return Path.Combine(_root, guid.ToString("D"), name);
        }

        // ===== signed URLs =====

        private string BaseUrl()
        {
            if (!string.IsNullOrEmpty(_publicBaseUrl))
                return _publicBaseUrl;
            var request = _http.HttpContext?.Request;
            if (request == null)
                throw new InvalidOperationException("Storage:PublicBaseUrl is not configured and there is no current request.");
            return $"{request.Scheme}://{request.Host}{request.PathBase}";
        }

        private string Sign(string method, string objectKey, long expires, string contentType)
        {
            var data = $"{method}\n{objectKey}\n{expires}\n{contentType}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_signingKey));
            return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLowerInvariant();
        }

        public bool VerifySignature(string method, string objectKey, long expires, string contentType, string? signature)
        {
            if (string.IsNullOrEmpty(signature) || DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expires)
                return false;
            var expected = Encoding.UTF8.GetBytes(Sign(method, objectKey, expires, contentType));
            return CryptographicOperations.FixedTimeEquals(expected, Encoding.UTF8.GetBytes(signature));
        }

        private string SignedUrl(string action, string method, string objectKey, string contentType, TimeSpan expiry)
        {
            contentType ??= "";
            var expires = DateTimeOffset.UtcNow.Add(expiry).ToUnixTimeSeconds();
            var sig = Sign(method, objectKey, expires, contentType);
            return $"{BaseUrl()}/api/localfiles/{action}?objectKey={Uri.EscapeDataString(objectKey)}" +
                   $"&expires={expires}&contentType={Uri.EscapeDataString(contentType)}&method={method}&signature={sig}";
        }

        public string GeneratePreSignedURL(string objectKey, string contentType, TimeSpan expiryDuration) =>
            SignedUrl("download", "GET", objectKey, "", expiryDuration);

        public string GeneratePreSignedUploadURL(string objectKey, string contentType, TimeSpan expiryDuration) =>
            SignedUrl("upload", "PUT", objectKey, contentType, expiryDuration);

        // ===== storage operations =====

        public Task<long?> GetObjectSizeAsync(string objectKey)
        {
            var path = PathForKey(objectKey);
            return Task.FromResult(File.Exists(path) ? new FileInfo(path).Length : (long?)null);
        }

        public async Task<string> UploadFileToS3Async(Stream fileStream, string objectKey, string contentType)
        {
            var path = PathForKey(objectKey);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            await using (var target = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None, 81920, useAsync: true))
            {
                await fileStream.CopyToAsync(target);
            }
            return path;
        }

        public Task<(Stream Stream, string ContentType)> DownloadFileFromS3Async(string objectKey) => DownloadFileAsync(objectKey);

        public Task<(Stream Stream, string ContentType)> DownloadFileAsync(string objectKey)
        {
            var path = PathForKey(objectKey);
            if (!File.Exists(path))
                throw new FileNotFoundException("File not found in local storage");
            if (!ContentTypes.TryGetContentType(path, out var contentType))
                contentType = "application/octet-stream";
            Stream stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, useAsync: true);
            return Task.FromResult((stream, contentType));
        }

        public Task<List<string>> ListFilesInFolderAsync(string folderPrefix)
        {
            var keys = new List<string>();
            foreach (var dir in Directory.EnumerateDirectories(_root))
            {
                foreach (var file in Directory.EnumerateFiles(dir))
                {
                    var key = $"{Path.GetFileName(dir)}_{Uri.EscapeDataString(Path.GetFileName(file))}";
                    if (key.StartsWith(folderPrefix ?? "", StringComparison.Ordinal))
                        keys.Add(key);
                }
            }
            return Task.FromResult(keys);
        }

        public Task DeleteFileAsync(string objectKey)
        {
            string path;
            try { path = PathForKey(objectKey); }
            catch (FileNotFoundException) { return Task.CompletedTask; }

            if (File.Exists(path))
                File.Delete(path);
            var dir = Path.GetDirectoryName(path)!;
            if (Directory.Exists(dir) && !Directory.EnumerateFileSystemEntries(dir).GetEnumerator().MoveNext())
                Directory.Delete(dir);
            return Task.CompletedTask;
        }
    }
}
