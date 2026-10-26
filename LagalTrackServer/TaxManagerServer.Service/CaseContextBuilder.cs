using System.Text;
using Microsoft.Extensions.Configuration;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Service
{
    // A numbered passage sent to the AI; the answer cites it as [Number]
    public record ChatExcerpt(int Number, Document Document, int? Page, string Text);

    // IsPartial: only the passages most related to the question were sent, not the whole case
    public record ChatContext(List<ChatExcerpt> Excerpts, List<string> Notes, bool IsPartial);

    // Chooses what the AI reads for a question. A small case is sent whole (most accurate, and it
    // answers questions about the whole case such as "summarize"). A larger case is cut into passages
    // with embeddings, and only the passages closest in meaning to the question are sent.
    public class CaseContextBuilder
    {
        // Bump when the chunking changes, so stored passages are rebuilt
        public const string ChunkerVersion = "chunk-1";
        public const int ChunkChars = 1500;
        public const int OverlapChars = 200;

        private readonly OpenAiClient _openAi;
        private readonly IRepositoryManager _repository;
        private readonly int _fullContextChars;
        private readonly int _excerptCount;

        public CaseContextBuilder(OpenAiClient openAi, IRepositoryManager repository, IConfiguration configuration)
        {
            _openAi = openAi;
            _repository = repository;
            _fullContextChars = configuration.GetValue("Chat:FullContextChars", 30_000);
            _excerptCount = configuration.GetValue("Chat:Excerpts", 8);
        }

        // searchQuery is only called when the case is too large to send whole
        public async Task<ChatContext> BuildAsync(List<CaseDocumentText> documents, Func<Task<string>> searchQuery)
        {
            var notes = documents.Where(d => d.Text == null).Select(d => d.Note ?? $"[Could not read {d.Document.DocumentName}]").ToList();
            var readable = documents.Where(d => d.Text != null).ToList();
            if (readable.Count == 0)
                return new ChatContext(new List<ChatExcerpt>(), notes, false);

            if (readable.Sum(d => d.Text!.Length) <= _fullContextChars)
            {
                var excerpts = new List<ChatExcerpt>();
                foreach (var doc in readable)
                    foreach (var (page, text) in Pages(doc))
                        if (!string.IsNullOrWhiteSpace(text))
                            excerpts.Add(new ChatExcerpt(excerpts.Count + 1, doc.Document, page, text.Trim()));
                return new ChatContext(excerpts, notes, false);
            }

            var chunks = await GetChunksAsync(readable);
            var queryVector = (await _openAi.EmbedAsync(new[] { await searchQuery() }))[0];
            var order = readable.Select((d, i) => (d.Document.DocumentId, i)).ToDictionary(x => x.DocumentId, x => x.i);
            var selected = chunks
                .OrderByDescending(c => Dot(queryVector, c.Vector))
                .Take(_excerptCount)
                // In reading order, so passages of the same document read naturally
                .OrderBy(c => order[c.Row.DocumentId]).ThenBy(c => c.Row.ChunkIndex)
                .ToList();

            var documentsById = readable.ToDictionary(d => d.Document.DocumentId, d => d.Document);
            var partial = selected
                .Select((c, i) => new ChatExcerpt(i + 1, documentsById[c.Row.DocumentId], c.Row.Page, c.Row.Text))
                .ToList();
            return new ChatContext(partial, notes, true);
        }

        // PDF pages are numbered from 1; other files are one block without a page
        private static IEnumerable<(int? Page, string Text)> Pages(CaseDocumentText doc)
        {
            if (doc.Extractor?.StartsWith("pdf") == true)
                return doc.Text!.Split(CaseDocumentText.PageBreak).Select((text, i) => ((int?)(i + 1), text));
            return new[] { ((int?)null, doc.Text!) };
        }

        private static string VersionOf(CaseDocumentText doc) => $"{doc.Extractor}|{ChunkerVersion}|{OpenAiClient.EmbeddingModel}";

        // The stored passages of each document; missing or outdated ones are cut and embedded now
        private async Task<List<(DocumentChunk Row, float[] Vector)>> GetChunksAsync(List<CaseDocumentText> documents)
        {
            var ids = documents.Select(d => d.Document.DocumentId).ToList();
            var stored = (await _repository.DocumentChunks.FindAsync(c => ids.Contains(c.DocumentId)))
                .GroupBy(c => c.DocumentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var result = new List<(DocumentChunk, float[])>();
            var added = new List<DocumentChunk>();
            foreach (var doc in documents)
            {
                var rows = stored.GetValueOrDefault(doc.Document.DocumentId) ?? new List<DocumentChunk>();
                var version = VersionOf(doc);
                if (rows.Count > 0 && rows.All(r => r.Version == version))
                {
                    // Two questions at the same moment may both have stored the passages; use one copy
                    result.AddRange(rows.GroupBy(r => r.ChunkIndex).Select(g => g.First()).Select(r => (r, ToVector(r.Embedding))));
                    continue;
                }

                foreach (var row in rows)
                    await _repository.DocumentChunks.DeleteAsync(row);
                foreach (var (page, text) in Pages(doc))
                    foreach (var chunk in Chunk(text))
                        added.Add(new DocumentChunk
                        {
                            DocumentId = doc.Document.DocumentId,
                            ChunkIndex = added.Count(a => a.DocumentId == doc.Document.DocumentId),
                            Page = page,
                            Text = chunk,
                            Version = version
                        });
            }

            if (added.Count > 0)
            {
                // The document name helps match questions that name it ("what does the lease say")
                var names = documents.ToDictionary(d => d.Document.DocumentId, d => d.Document.DocumentName);
                var vectors = await _openAi.EmbedAsync(added.Select(c => $"{names[c.DocumentId]}\n{c.Text}").ToList());
                for (int i = 0; i < added.Count; i++)
                {
                    added[i].Embedding = ToBytes(vectors[i]);
                    await _repository.DocumentChunks.AddAsync(added[i]);
                    result.Add((added[i], vectors[i]));
                }
            }

            try
            {
                await _repository.SaveAsync();
            }
            catch (Exception ex)
            {
                // Storing is only a saving for the next question; stop tracking the rows so the chat's own save works
                Console.WriteLine($"Could not store document passages: {ex.Message}");
                foreach (var row in added)
                    await _repository.DocumentChunks.DeleteAsync(row);
            }
            return result;
        }

        // Cuts text into passages of about ChunkChars at line ends. Each passage repeats the last
        // lines of the one before, so a sentence on the border is whole in at least one of them.
        public static List<string> Chunk(string text)
        {
            var lines = text.Replace("\r", "").Split('\n')
                .Where(l => !string.IsNullOrWhiteSpace(l))
                // A very long line (e.g. a paragraph of a Word file) is cut at spaces
                .SelectMany(SplitLongLine)
                .ToList();

            var chunks = new List<string>();
            var current = new List<string>();
            var length = 0;
            foreach (var line in lines)
            {
                if (length + line.Length > ChunkChars && current.Count > 0)
                {
                    chunks.Add(string.Join("\n", current));
                    var overlap = new List<string>();
                    var overlapLength = 0;
                    for (int i = current.Count - 1; i >= 0 && overlapLength + current[i].Length <= OverlapChars; i--)
                    {
                        overlap.Insert(0, current[i]);
                        overlapLength += current[i].Length + 1;
                    }
                    current = overlap;
                    length = overlapLength;
                }
                current.Add(line);
                length += line.Length + 1;
            }
            if (current.Count > 0)
                chunks.Add(string.Join("\n", current));
            return chunks;
        }

        private static IEnumerable<string> SplitLongLine(string line)
        {
            while (line.Length > ChunkChars)
            {
                var cut = line.LastIndexOf(' ', ChunkChars);
                if (cut <= 0)
                    cut = ChunkChars;
                yield return line[..cut];
                line = line[cut..].TrimStart();
            }
            if (line.Length > 0)
                yield return line;
        }

        // OpenAI embeddings have length 1, so the dot product is the cosine similarity
        private static float Dot(float[] a, float[] b)
        {
            float sum = 0;
            for (int i = 0; i < Math.Min(a.Length, b.Length); i++)
                sum += a[i] * b[i];
            return sum;
        }

        private static byte[] ToBytes(float[] vector)
        {
            var bytes = new byte[vector.Length * sizeof(float)];
            Buffer.BlockCopy(vector, 0, bytes, 0, bytes.Length);
            return bytes;
        }

        private static float[] ToVector(byte[] bytes)
        {
            var vector = new float[bytes.Length / sizeof(float)];
            Buffer.BlockCopy(bytes, 0, vector, 0, bytes.Length);
            return vector;
        }

        // How a passage is labeled for the AI and in the sources list
        public static string Label(ChatExcerpt excerpt) =>
            excerpt.Page == null ? excerpt.Document.DocumentName : $"{excerpt.Document.DocumentName}, page {excerpt.Page}";

        public static string Format(ChatContext context)
        {
            var sb = new StringBuilder();
            foreach (var excerpt in context.Excerpts)
                sb.Append($"[{excerpt.Number}] {Label(excerpt)}\n{excerpt.Text}\n\n");
            foreach (var note in context.Notes)
                sb.Append(note).Append('\n');
            return sb.ToString();
        }
    }
}
