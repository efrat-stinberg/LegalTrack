using System.ComponentModel.DataAnnotations;

namespace TaxManagerServer.Core.Models
{
    // Text already extracted from a document, so the AI chat does not download and parse every file on every question.
    // A row is used only while FilePath and Extractor still match; otherwise the text is extracted again.
    public class DocumentText
    {
        [Key]
        public int DocumentId { get; set; }
        // The stored file the text came from
        [MaxLength(1024)]
        public string FilePath { get; set; } = null!;
        // Which extractor and version produced the text (e.g. "pdf-2"); a newer version replaces old rows
        [MaxLength(40)]
        public string Extractor { get; set; } = null!;
        public string Text { get; set; } = null!;
        public DateTime ExtractedAt { get; set; }
    }
}
