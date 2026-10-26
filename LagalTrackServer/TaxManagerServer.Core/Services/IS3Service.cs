using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Services
{
    public interface IS3Service
    {
        string GeneratePreSignedURL(string objectKey, string contentType, TimeSpan expiryDuration);
        // URL the browser PUTs the file to; it must send exactly this Content-Type
        string GeneratePreSignedUploadURL(string objectKey, string contentType, TimeSpan expiryDuration);
        // Size in bytes, or null when the object does not exist
        Task<long?> GetObjectSizeAsync(string objectKey);
        Task<string> UploadFileToS3Async(Stream fileStream, string objectKey, string contentType);
        Task<(Stream Stream, string ContentType)> DownloadFileFromS3Async(string objectKey);
        Task<List<string>> ListFilesInFolderAsync(string folderPrefix);
        Task DeleteFileAsync(string objectKey);
        //Task<Stream> DownloadFileAsync(string fileName);
        Task<(Stream Stream, string ContentType)> DownloadFileAsync(string objectKey);


    }
}
