using TaxManagerServer.Service;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    public class PdfTextExtractorTests
    {
        private static async Task<string[]> ExtractLinesAsync(Stream pdf) =>
            (await new PdfTextExtractor().ExtractTextAsync(pdf))
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Fixtures/hebrew-lease.pdf was printed to PDF by Chrome from right-to-left HTML
        [Fact]
        public async Task Hebrew_comes_out_in_reading_order_line_by_line()
        {
            await using var pdf = File.OpenRead(Path.Combine(AppContext.BaseDirectory, "Fixtures", "hebrew-lease.pdf"));
            var lines = await ExtractLinesAsync(pdf);

            Assert.Equal("חוזה שכירות", lines[0]);
            Assert.Contains("השוכר ישלם דמי שכירות של 6,500 ש\"ח לחודש, החל מיום 1.3.2024.", lines);
            Assert.Contains("המשכיר: חברת Levi Properties בע\"מ (ח.פ. 514236987), טלפון 03-5551234.", lines);
            Assert.Contains(lines, l => l.EndsWith("יעמוד על 20% מדמי השכירות השנתיים."));
            Assert.Contains("חודש | סכום", lines);
        }

        [Fact]
        public async Task English_text_is_unchanged()
        {
            using var pdf = new MemoryStream(ApiSession.CreatePdf("The contract was signed on 5 May 2024 in Haifa"));
            var lines = await ExtractLinesAsync(pdf);
            Assert.Equal(new[] { "The contract was signed on 5 May 2024 in Haifa" }, lines);
        }
    }
}
