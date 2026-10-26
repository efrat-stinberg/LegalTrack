using System.ComponentModel.DataAnnotations;

namespace TaxManagerServer.Core.Models
{
    // A passage of a document's text with its embedding (a vector of its meaning), so the chat can send
    // the AI only the passages that relate to a question when a case is too large to send whole
    public class DocumentChunk
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        // Order of the passage within the document
        public int ChunkIndex { get; set; }
        // PDF page the passage comes from; null for files without pages (Word, images)
        public int? Page { get; set; }
        public string Text { get; set; } = null!;
        // float32 values, little-endian
        public byte[] Embedding { get; set; } = null!;
        // Reader, chunking and embedding model that produced the row; rows of another version are rebuilt
        [MaxLength(80)]
        public string Version { get; set; } = null!;
    }
}
