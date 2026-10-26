using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // Reads the text in an image with the same OpenAI model the chat uses (it accepts images)
    public class ImageTextExtractor : IImageTextExtractor
    {
        // OpenAI accepts images up to 20MB
        public const long MaxImageBytes = 20L * 1024 * 1024;

        private const string Instructions =
            "Transcribe all the text in this image exactly as written, in its original language and reading order. " +
            "Keep the line breaks; write table rows on separate lines with the cells separated by \" | \". " +
            "Do not translate, summarize or add anything. " +
            "If the image has little or no text, describe what it shows in one or two sentences starting with \"Image:\".";

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ImageTextExtractor(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> ExtractTextAsync(Stream imageStream, string mediaType)
        {
            var apiKey = _configuration.GetValue<string>("ChatKey");
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new ChatUnavailableException("Reading images needs the AI service (missing ChatKey).");

            using var memoryStream = new MemoryStream();
            await imageStream.CopyToAsync(memoryStream);
            if (memoryStream.Length > MaxImageBytes)
                throw new InvalidDataException("The image is larger than 20MB, which the AI service cannot read.");

            var body = new
            {
                model = ChatService.Model,
                messages = new object[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = Instructions },
                            new { type = "image_url", image_url = new { url = $"data:{mediaType};base64,{Convert.ToBase64String(memoryStream.ToArray())}" } }
                        }
                    }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, ChatService.OpenAiEndpoint)
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

            return JsonSerializer.Deserialize<JsonElement>(content)
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }
    }
}
