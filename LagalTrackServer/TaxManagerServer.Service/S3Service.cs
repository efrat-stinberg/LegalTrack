using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using TaxManagerServer.Core.Services;

namespace TaxManager.Service
{
    public class S3Service : IS3Service
    {
        private readonly IConfiguration _configuration;
        private readonly string _bucketName;
        private IAmazonS3? _client;

        public S3Service(IConfiguration configuration)
        {
            _configuration = configuration;
            _bucketName = configuration["AWS:BucketName"] ?? "";
        }

        // Created on first use, so a missing AWS setting only breaks file operations,
        // not every endpoint whose service happens to depend on S3
        private IAmazonS3 _s3Client
        {
            get
            {
                if (_client != null)
                    return _client;

                var regionName = _configuration["AWS:Region"];
                if (string.IsNullOrWhiteSpace(regionName) || string.IsNullOrWhiteSpace(_bucketName))
                    throw new InvalidOperationException("AWS S3 is not configured on the server (AWS:Region / AWS:BucketName).");

                _client = new AmazonS3Client(_configuration["AWS:AccessKey"], _configuration["AWS:SecretKey"], RegionEndpoint.GetBySystemName(regionName));
                return _client;
            }
        }

        public string GeneratePreSignedURL(string objectKey, string contentType, TimeSpan expiryDuration)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = objectKey,
                Expires = DateTime.UtcNow.Add(expiryDuration),
                ContentType = contentType
            };

            return _s3Client.GetPreSignedURL(request);
        }

        public string GeneratePreSignedUploadURL(string objectKey, string contentType, TimeSpan expiryDuration)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = objectKey,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.Add(expiryDuration),
                ContentType = contentType
            };

            return _s3Client.GetPreSignedURL(request);
        }

        public async Task<long?> GetObjectSizeAsync(string objectKey)
        {
            try
            {
                var metadata = await _s3Client.GetObjectMetadataAsync(_bucketName, objectKey);
                return metadata.ContentLength;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        //public async Task<string> UploadFileToS3Async(Stream fileStream, string objectKey, string contentType)
        //{
        //    var putRequest = new PutObjectRequest
        //    {
        //        BucketName = _bucketName,
        //        Key = objectKey,
        //        InputStream = fileStream,
        //        ContentType = contentType
        //    };

        //    var response = await _s3Client.PutObjectAsync(putRequest);

        //    return $"https://{_bucketName}.s3.amazonaws.com/{objectKey}";
        //}

        // 🔽 NEW: download method for retrieving a file from S3
        public async Task<(Stream Stream, string ContentType)> DownloadFileFromS3Async(string objectKey)
        {
            try
            {
                var getRequest = new GetObjectRequest
                {
                    BucketName = _bucketName,
                    Key = objectKey
                };

                var response = await _s3Client.GetObjectAsync(getRequest);

                return (response.ResponseStream, response.Headers.ContentType);
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new FileNotFoundException("File not found in S3", ex);
            }
        }

        public async Task<(Stream Stream, string ContentType)> DownloadFileAsync(string objectKey)
        {
            try
            {
                var getRequest = new GetObjectRequest
                {
                    BucketName = _bucketName,
                    Key = objectKey
                };

                var response = await _s3Client.GetObjectAsync(getRequest);

                return (response.ResponseStream, response.Headers.ContentType);
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new FileNotFoundException("File not found in S3", ex);
            }
        }


        public async Task<List<string>> ListFilesInFolderAsync(string folderPrefix)
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = folderPrefix
            };

            var files = new List<string>();
            ListObjectsV2Response response;

            do
            {
                response = await _s3Client.ListObjectsV2Async(request);
                foreach (var entry in response.S3Objects)
                {
                    files.Add(entry.Key);
                }
                request.ContinuationToken = response.NextContinuationToken;
            }
            while ((bool)response.IsTruncated);

            return files;
        }

        public async Task DeleteFileAsync(string objectKey)
        {
            Console.WriteLine("i entered to DeleteFileAsync s3 service ");
            try
            {
                var deleteRequest = new Amazon.S3.Model.DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = objectKey
                };

                await _s3Client.DeleteObjectAsync(deleteRequest);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting file from S3: {ex.Message}", ex);
            }
        }

        public async Task<string> UploadFileToS3Async(Stream stream, string key, string contentType)
        {
            var request = new TransferUtilityUploadRequest
            {
                InputStream = stream,
                Key = key,
                BucketName = _bucketName,
                ContentType = contentType,
                CannedACL = S3CannedACL.Private
            };

            var fileTransferUtility = new TransferUtility(_s3Client);
            await fileTransferUtility.UploadAsync(request);

            return $"https://{_bucketName}.s3.amazonaws.com/{key}";
        }



    }
}
