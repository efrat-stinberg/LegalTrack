namespace TaxManagerServer.API.Models
{
    public class DocumentPostModel
    {
        public string DocumentName { get; set; }
        public string FilePath { get; set; }
        public int FolderId { get; set; }
    }
}
