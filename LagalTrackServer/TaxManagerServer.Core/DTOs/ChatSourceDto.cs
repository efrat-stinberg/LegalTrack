namespace TaxManagerServer.Core.DTOs
{
    // A passage the answer cites as [Number]
    public class ChatSourceDto
    {
        public int Number { get; set; }
        public int DocumentId { get; set; }
        public string DocumentName { get; set; } = "";
        // S3 key, to open the document
        public string ObjectKey { get; set; } = "";
        public int? Page { get; set; }
    }
}
