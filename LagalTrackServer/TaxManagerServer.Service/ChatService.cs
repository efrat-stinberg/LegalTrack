using System.Text.Json;
using System.Text.RegularExpressions;
using TaxManager.Core.Services;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class ChatService : IChatService
    {
        // Earlier questions and answers sent along, so follow-ups ("and what about the tenant?") make sense
        public const int HistoryTurns = 3;
        // Long earlier answers are cut; the model only needs their gist to follow the conversation
        private const int HistoryAnswerChars = 2000;
        // gpt-4o-mini accepts ~128k tokens; keep the case text well under that
        private const int MaxContextChars = 200_000;

        private const string AnswerInstructions =
            "You are a legal assistant helping with case files. Answer in the language of the question, " +
            "based only on the numbered passages from the case files below. " +
            "After each statement taken from the files, cite the passage numbers in square brackets, like [2] or [1][3]. " +
            "If the passages don't contain the answer, say so.";

        private const string PartialInstructions =
            " The case is large, so these are only the passages most related to the question, not the whole files. " +
            "If the question needs the whole case (for example a full summary or every date), say that the answer is based on part of the files.";

        private const string SearchInstructions =
            "Turn the user's last question into a standalone search query for finding passages in legal case files. " +
            "Use the conversation to fill in what the question refers to (names, documents, topics). " +
            "Write the query in the language of the question. Reply with the query only.";

        private static readonly Regex Citation = new(@"\[(\d+)\]");

        private readonly IRepositoryManager _repository;
        private readonly IFolderService _folderService;
        private readonly OpenAiClient _openAi;
        private readonly CaseContextBuilder _contextBuilder;

        public ChatService(IRepositoryManager repository, IFolderService folderService, OpenAiClient openAi, CaseContextBuilder contextBuilder)
        {
            _repository = repository;
            _folderService = folderService;
            _openAi = openAi;
            _contextBuilder = contextBuilder;
        }

        public async Task<List<ChatMessage>> GetChatHistoryAsync(int folderId)
        {
            var messages = await _repository.ChatMessages.FindAsync(m => m.FolderId == folderId);
            return messages.OrderBy(m => m.CreatedAt).ThenBy(m => m.Id).ToList();
        }

        public async Task<ChatMessage> AskQuestionAsync(int folderId, string question)
        {
            if (!_openAi.IsConfigured)
                throw new ChatUnavailableException("The AI chat is not configured on the server (missing ChatKey).");

            var history = (await GetChatHistoryAsync(folderId)).TakeLast(HistoryTurns).ToList();
            var documents = await _folderService.GetDocumentTextsAsync(folderId);
            var context = await _contextBuilder.BuildAsync(documents, () => SearchQueryAsync(history, question));

            var contextText = CaseContextBuilder.Format(context);
            if (contextText.Length > MaxContextChars)
                contextText = contextText[..MaxContextChars] + "\n[...the rest of the case files was cut for length...]";

            var messages = new List<object>
            {
                new { role = "system", content = AnswerInstructions + (context.IsPartial ? PartialInstructions : "") },
                new { role = "system", content = $"Case files passages:\n{contextText}" }
            };
            messages.AddRange(HistoryMessages(history));
            messages.Add(new { role = "user", content = question });

            var answer = await _openAi.CompleteAsync(messages);

            var message = new ChatMessage
            {
                FolderId = folderId,
                Question = question,
                Answer = answer,
                Sources = JsonSerializer.Serialize(CitedSources(answer, context)),
                CreatedAt = DateTime.UtcNow
            };

            await _repository.ChatMessages.AddAsync(message);
            await _repository.SaveAsync();

            return message;
        }

        // A follow-up question alone often doesn't say what it is about; the model rewrites it for the search
        private async Task<string> SearchQueryAsync(List<ChatMessage> history, string question)
        {
            if (history.Count == 0)
                return question;

            var messages = new List<object> { new { role = "system", content = SearchInstructions } };
            messages.AddRange(HistoryMessages(history));
            messages.Add(new { role = "user", content = question });
            var query = (await _openAi.CompleteAsync(messages)).Trim();
            return string.IsNullOrEmpty(query) ? question : $"{query}\n{question}";
        }

        private static IEnumerable<object> HistoryMessages(List<ChatMessage> history) =>
            history.SelectMany(m => new object[]
            {
                new { role = "user", content = m.Question },
                new { role = "assistant", content = m.Answer.Length > HistoryAnswerChars ? m.Answer[..HistoryAnswerChars] + "…" : m.Answer }
            });

        // The passages the answer cites, by their number
        private static List<ChatSourceDto> CitedSources(string answer, ChatContext context)
        {
            var byNumber = context.Excerpts.ToDictionary(e => e.Number);
            return Citation.Matches(answer)
                .Select(m => int.TryParse(m.Groups[1].Value, out var n) ? n : 0)
                .Distinct()
                .Where(byNumber.ContainsKey)
                .OrderBy(n => n)
                .Select(n => byNumber[n])
                .Select(e => new ChatSourceDto
                {
                    Number = e.Number,
                    DocumentId = e.Document.DocumentId,
                    DocumentName = e.Document.DocumentName,
                    ObjectKey = e.Document.FilePath,
                    Page = e.Page
                })
                .ToList();
        }
    }
}
