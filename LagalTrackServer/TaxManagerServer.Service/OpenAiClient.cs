using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // The OpenAI calls the server makes: chat answers, reading images and embeddings.
    // Any failure becomes ChatUnavailableException, which the API answers with 503 and the reason.
    public class OpenAiClient
    {
        public const string ChatEndpoint = "https://api.openai.com/v1/chat/completions";
        public const string EmbeddingsEndpoint = "https://api.openai.com/v1/embeddings";
        public const string ChatModel = "gpt-4o-mini";
        // Multilingual (reads Hebrew), 1536 values per text
        public const string EmbeddingModel = "text-embedding-3-small";
        // Texts per embeddings request; the API accepts up to 2048 but also limits tokens per request
        private const int EmbeddingBatch = 64;

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public OpenAiClient(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public bool IsConfigured => !string.IsNullOrWhiteSpace(_configuration.GetValue<string>("ChatKey"));

        // messages: objects of the chat API ({ role, content })
        public async Task<string> CompleteAsync(IEnumerable<object> messages)
        {
            var json = await PostAsync(ChatEndpoint, new { model = ChatModel, messages });
            return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
        }

        public async Task<float[][]> EmbedAsync(IReadOnlyList<string> texts)
        {
            var result = new List<float[]>(texts.Count);
            for (int start = 0; start < texts.Count; start += EmbeddingBatch)
            {
                var batch = texts.Skip(start).Take(EmbeddingBatch).ToArray();
                var json = await PostAsync(EmbeddingsEndpoint, new { model = EmbeddingModel, input = batch });
                // Each item says which input it belongs to
                var vectors = new float[batch.Length][];
                foreach (var item in json.GetProperty("data").EnumerateArray())
                    vectors[item.GetProperty("index").GetInt32()] =
                        item.GetProperty("embedding").EnumerateArray().Select(v => v.GetSingle()).ToArray();
                result.AddRange(vectors);
            }
            return result.ToArray();
        }

        private async Task<JsonElement> PostAsync(string url, object body)
        {
            var apiKey = _configuration.GetValue<string>("ChatKey");
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new ChatUnavailableException("The AI chat is not configured on the server (missing ChatKey).");

            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                throw new ChatUnavailableException($"Could not reach the AI service: {ex.Message}", ex);
            }

            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new ChatUnavailableException($"The AI service returned {(int)response.StatusCode}: {content}");
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
    }
}
