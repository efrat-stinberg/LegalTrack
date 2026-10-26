using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Tests.Infrastructure
{
    // In-memory stand-in for Amazon S3
    public class FakeS3Service : IS3Service
    {
        public ConcurrentDictionary<string, (byte[] Bytes, string ContentType)> Objects { get; } = new();

        public string GeneratePreSignedURL(string objectKey, string contentType, TimeSpan expiryDuration) =>
            $"https://fake-s3.test/{objectKey}?expires={expiryDuration.TotalMinutes}";

        public string GeneratePreSignedUploadURL(string objectKey, string contentType, TimeSpan expiryDuration) =>
            $"https://fake-s3.test/{objectKey}?method=PUT&contentType={Uri.EscapeDataString(contentType)}";

        public Task<long?> GetObjectSizeAsync(string objectKey) =>
            Task.FromResult(Objects.TryGetValue(objectKey, out var obj) ? (long?)obj.Bytes.Length : null);

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

    // Records invite and password-reset emails instead of sending them; can be switched to fail like SendGrid would
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

        public ConcurrentDictionary<string, string> ResetLinksByEmail { get; } = new();

        public Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            if (FailWith != null)
                throw new EmailSendException(FailWith);
            ResetLinksByEmail[toEmail] = resetLink;
            return Task.CompletedTask;
        }
    }

    // Answers OpenAI calls and remembers what was sent.
    // Chat completions answer Answer, or what Respond returns for the request.
    // Embeddings are word counts hashed into a vector, so texts that share words come out similar.
    public class FakeOpenAiHandler : HttpMessageHandler
    {
        public const int EmbeddingSize = 512;

        public ConcurrentQueue<string> RequestBodies { get; } = new();
        public ConcurrentQueue<string> EmbeddingBodies { get; } = new();
        public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.OK;
        public string Answer { get; set; } = "The contract was signed on 5 May 2024.";
        public Func<JsonElement, string?>? Respond { get; set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var requestBody = request.Content == null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
            var isEmbeddings = request.RequestUri?.AbsolutePath.EndsWith("/embeddings") == true;
            (isEmbeddings ? EmbeddingBodies : RequestBodies).Enqueue(requestBody);

            if (StatusCode != HttpStatusCode.OK)
                return new HttpResponseMessage(StatusCode) { Content = new StringContent("{\"error\":{\"message\":\"fake failure\"}}") };

            var json = JsonSerializer.Deserialize<JsonElement>(requestBody);
            object body = isEmbeddings
                ? new
                {
                    data = json.GetProperty("input").EnumerateArray()
                        .Select((input, index) => new { index, embedding = Embed(input.GetString() ?? "") })
                        .ToArray()
                }
                : new
                {
                    choices = new[] { new { message = new { role = "assistant", content = Respond?.Invoke(json) ?? Answer } } }
                };
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };
        }

        public static float[] Embed(string text)
        {
            var vector = new float[EmbeddingSize];
            foreach (var word in Regex.Split(text.ToLowerInvariant(), @"[^\p{L}\p{N}]+").Where(w => w.Length > 2))
            {
                // FNV-1a: the same word always lands in the same place
                uint hash = 2166136261;
                foreach (var c in word)
                    hash = (hash ^ c) * 16777619;
                vector[hash % EmbeddingSize] += 1;
            }
            var length = (float)Math.Sqrt(vector.Sum(v => v * v));
            return length == 0 ? vector : vector.Select(v => v / length).ToArray();
        }

        // The text of the message at this position of a chat request
        public static string MessageText(JsonElement request, int index) =>
            request.GetProperty("messages")[index].GetProperty("content").GetString() ?? "";
    }
}
