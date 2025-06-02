using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;
using System.Net.Http.Headers;
using System.Text;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace TaxManagerServer.Service
{
    public class ChatService : IChatService
    {
        private readonly IRepositoryManager _repository;
        private readonly IFolderService _folderService;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;



        public ChatService(IRepositoryManager repository, IFolderService folderService , IConfiguration configuration)
        {
            _repository = repository;
            _folderService = folderService;
            _httpClient = new HttpClient(new HttpClientHandler
            {
                AllowAutoRedirect = true
            })
            {
                Timeout = TimeSpan.FromMinutes(2),
                DefaultRequestVersion = HttpVersion.Version11
            };
            _configuration = configuration;
        }


        public async Task<List<ChatMessage>> GetChatHistoryAsync(int folderId)
        {
            var allMessages = await _repository.ChatMessages.GetAllAsync();
            return allMessages
                .Where(m => m.FolderId == folderId)
                .OrderBy(m => m.CreatedAt)
                .ToList();
        }

        public async Task<ChatMessage> AskQuestionAsync(int folderId, string question)
        {
            // קבלת הטקסט המופק מהתיקייה
            var extractedText = await _folderService.GetExtractedTextFromFolderAsync(folderId);

            // בניית הפורמט ל-OpenAI עם הקונטקסט של הטקסט מהתיקייה
            var prompt = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "You are a legal assistant helping with case files." },
                    new { role = "system", content = $"Case files content: {extractedText}" },
                    new { role = "user", content = question }
                }
            };


        

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            var json = JsonSerializer.Serialize(prompt);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _configuration.GetValue<string>("ChatKey"));

        
            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"OpenAI API Error: {(int)response.StatusCode} {response.ReasonPhrase}\n{errorContent}");
            }

            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            var answer = result
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

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