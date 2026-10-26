namespace TaxManagerServer.Core.Services
{
    // Turns a stored case file into plain text for the AI chat. Picks the reader by file extension.
    public interface IDocumentTextExtractor
    {
        // Name and version of the reader for this file (kept with cached text, e.g. "pdf-2"),
        // or null when the file type can't be read
        string? GetExtractor(string fileName);

        Task<string> ExtractTextAsync(Stream stream, string fileName);
    }

    // Reads the text in a picture (a photographed or scanned page)
    public interface IImageTextExtractor
    {
        Task<string> ExtractTextAsync(Stream imageStream, string mediaType);
    }
}
