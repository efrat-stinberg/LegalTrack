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
        Task<string> UploadFileToS3Async(Stream fileStream, string objectKey, string contentType);
        Task<(Stream Stream, string ContentType)> DownloadFileFromS3Async(string objectKey);
        Task<List<string>> ListFilesInFolderAsync(string folderPrefix);
        Task DeleteFileAsync(string objectKey);
        //Task<Stream> DownloadFileAsync(string fileName);
        Task<(Stream Stream, string ContentType)> DownloadFileAsync(string objectKey);


    }
}
