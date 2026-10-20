using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class ChatService : IChatService
    {
        public const string OpenAiEndpoint = "https://api.openai.com/v1/chat/completions";

        // gpt-4o-mini accepts ~128k tokens; keep the case text well under that
        private const int MaxContextChars = 200_000;

        private readonly IRepositoryManager _repository;
        private readonly IFolderService _folderService;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ChatService(IRepositoryManager repository, IFolderService folderService, HttpClient httpClient, IConfiguration configuration)
        {
            _repository = repository;
            _folderService = folderService;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<ChatMessage>> GetChatHistoryAsync(int folderId)
        {
            var messages = await _repository.ChatMessages.FindAsync(m => m.FolderId == folderId);
            return messages.OrderBy(m => m.CreatedAt).ToList();
        }

        public async Task<ChatMessage> AskQuestionAsync(int folderId, string question)
        {
            var apiKey = _configuration.GetValue<string>("ChatKey");
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new ChatUnavailableException("The AI chat is not configured on the server (missing ChatKey).");

            // קבלת הטקסט המופק מהתיקייה
            var extractedText = await _folderService.GetExtractedTextFromFolderAsync(folderId);
            if (extractedText.Length > MaxContextChars)
                extractedText = extractedText[..MaxContextChars] + "\n[...the rest of the case files was cut for length...]";

            // בניית הפורמט ל-OpenAI עם הקונטקסט של הטקסט מהתיקייה
            var prompt = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "You are a legal assistant helping with case files. Answer in the language of the question, based only on the case files below. If the files don't contain the answer, say so." },
                    new { role = "system", content = $"Case files content: {extractedText}" },
                    new { role = "user", content = question }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, OpenAiEndpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(prompt), Encoding.UTF8, "application/json")
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

            var answer = JsonSerializer.Deserialize<JsonElement>(content)
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            var message = new ChatMessage
            {
                FolderId = folderId,
                Question = question,
                Answer = answer,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.ChatMessages.AddAsync(message);
            await _repository.SaveAsync();

            return message;
        }
    }
}
