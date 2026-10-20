using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Tests.Infrastructure
{
    // In-memory stand-in for Amazon S3
    public class FakeS3Service : IS3Service
    {
        public ConcurrentDictionary<string, (byte[] Bytes, string ContentType)> Objects { get; } = new();

        public string GeneratePreSignedURL(string objectKey, string contentType, TimeSpan expiryDuration) =>
            $"https://fake-s3.test/{objectKey}?expires={expiryDuration.TotalMinutes}";

        public async Task<string> UploadFileToS3Async(Stream fileStream, string objectKey, string contentType)
        {
            using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms);
            Objects[objectKey] = (ms.ToArray(), contentType);
            return $"https://fake-s3.test/{objectKey}";
        }

        public Task<(Stream Stream, string ContentType)> DownloadFileFromS3Async(string objectKey) => DownloadFileAsync(objectKey);

        public Task<(Stream Stream, string ContentType)> DownloadFileAsync(string objectKey)
        {
            if (!Objects.TryGetValue(objectKey, out var obj))
                throw new FileNotFoundException("File not found in S3");
            return Task.FromResult<(Stream, string)>((new MemoryStream(obj.Bytes), obj.ContentType));
        }

        public Task<List<string>> ListFilesInFolderAsync(string folderPrefix) =>
            Task.FromResult(Objects.Keys.Where(k => k.StartsWith(folderPrefix)).ToList());

        public Task DeleteFileAsync(string objectKey)
        {
            Objects.TryRemove(objectKey, out _);
            return Task.CompletedTask;
        }
    }

    // Records invite emails instead of sending them; can be switched to fail like SendGrid would
    public class FakeEmailService : IEmailService
    {
        public ConcurrentDictionary<string, string> LinksByEmail { get; } = new();
        public string? FailWith { get; set; }

        public Task SendInviteEmailAsync(string toEmail, string inviteLink)
        {
            if (FailWith != null)
                throw new EmailSendException(FailWith);
            LinksByEmail[toEmail] = inviteLink;
            return Task.CompletedTask;
        }
    }

    // Answers OpenAI chat-completion calls and remembers what was sent
    public class FakeOpenAiHandler : HttpMessageHandler
    {
        public ConcurrentQueue<string> RequestBodies { get; } = new();
        public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.OK;
        public string Answer { get; set; } = "The contract was signed on 5 May 2024.";

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestBodies.Enqueue(request.Content == null ? "" : await request.Content.ReadAsStringAsync(cancellationToken));

            if (StatusCode != HttpStatusCode.OK)
                return new HttpResponseMessage(StatusCode) { Content = new StringContent("{\"error\":{\"message\":\"fake failure\"}}") };

            var body = JsonSerializer.Serialize(new
            {
                choices = new[] { new { message = new { role = "assistant", content = Answer } } }
            });
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
        }
    }
}
