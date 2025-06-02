using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Services;
using UglyToad.PdfPig;

namespace TaxManagerServer.Service
{
    public class PdfTextExtractor : IPdfTextExtractor
    {
        public async Task<string> ExtractTextAsync(Stream pdfStream)
        {
            using var memoryStream = new MemoryStream();
            await pdfStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var sb = new StringBuilder();
            using var document = PdfDocument.Open(memoryStream);

            foreach (var page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }

            return sb.ToString();
        }
    }
}
