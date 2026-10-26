using System.IO.Compression;
using System.Text;
using System.Xml.Linq;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class DocumentTextExtractor : IDocumentTextExtractor
    {
        // Bump a version when its reader changes, so text cached by the old one is extracted again
        public const string Pdf = "pdf-2";
        public const string Word = "docx-1";
        public const string Image = "image-1";

        public static readonly IReadOnlyDictionary<string, string> ImageMediaTypes = new Dictionary<string, string>
        {
            [".png"] = "image/png",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".webp"] = "image/webp",
            [".gif"] = "image/gif",
        };

        private static readonly XNamespace W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

        private readonly IPdfTextExtractor _pdfTextExtractor;
        private readonly IImageTextExtractor _imageTextExtractor;

        public DocumentTextExtractor(IPdfTextExtractor pdfTextExtractor, IImageTextExtractor imageTextExtractor)
        {
            _pdfTextExtractor = pdfTextExtractor;
            _imageTextExtractor = imageTextExtractor;
        }

        public string? GetExtractor(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            if (extension == ".pdf")
                return Pdf;
            if (extension == ".docx")
                return Word;
            if (ImageMediaTypes.ContainsKey(extension))
                return Image;
            return null;
        }

        public async Task<string> ExtractTextAsync(Stream stream, string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return GetExtractor(fileName) switch
            {
                Pdf => await _pdfTextExtractor.ExtractTextAsync(stream),
                Word => await ExtractWordTextAsync(stream),
                Image => await _imageTextExtractor.ExtractTextAsync(stream, ImageMediaTypes[extension]),
                _ => throw new NotSupportedException($"Unsupported file type: {extension}")
            };
        }

        // A .docx is a zip; the body text is in word/document.xml. Word stores text in reading order,
        // so Hebrew needs no reordering. Paragraphs become lines, table cells are separated by " | ".
        public static async Task<string> ExtractWordTextAsync(Stream stream)
        {
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            using var zip = new ZipArchive(memoryStream, ZipArchiveMode.Read);
            var entry = zip.GetEntry("word/document.xml")
                ?? throw new InvalidDataException("Not a Word document (word/document.xml is missing).");
            XDocument xml;
            using (var entryStream = entry.Open())
                xml = XDocument.Load(entryStream);

            var sb = new StringBuilder();
            var body = xml.Root?.Element(W + "body");
            if (body != null)
                AppendBlocks(body, sb);
            return sb.ToString();
        }

        private static void AppendBlocks(XElement container, StringBuilder sb)
        {
            foreach (var element in container.Elements())
            {
                if (element.Name == W + "p")
                    sb.AppendLine(ParagraphText(element));
                else if (element.Name == W + "tbl")
                {
                    foreach (var row in element.Elements(W + "tr"))
                    {
                        var cells = row.Elements(W + "tc")
                            .Select(cell => string.Join(" ", cell.Descendants(W + "p").Select(ParagraphText)).Trim());
                        sb.AppendLine(string.Join(" | ", cells));
                    }
                }
                else if (element.Name == W + "sdt")
                    AppendBlocks(element.Element(W + "sdtContent") ?? element, sb);
            }
        }

        private static string ParagraphText(XElement paragraph)
        {
            var sb = new StringBuilder();
            foreach (var node in paragraph.Descendants())
            {
                if (node.Name == W + "t")
                    sb.Append(node.Value);
                else if (node.Name == W + "tab")
                    sb.Append('\t');
                else if (node.Name == W + "br" || node.Name == W + "cr")
                    sb.Append('\n');
            }
            return sb.ToString();
        }
    }
}
