using System.Text;
using System.Text.RegularExpressions;
using TaxManagerServer.Core.Services;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace TaxManagerServer.Service
{
    // Rebuilds the text line by line from the letter positions. PdfPig's page.Text gives the letters in
    // drawing order: Hebrew comes out reversed and all lines run together, which the AI cannot read well.
    public class PdfTextExtractor : IPdfTextExtractor
    {
        private static readonly Regex Hebrew = new(@"[֐-׿]");
        // Inside right-to-left text these keep their own left-to-right order: Latin words, numbers, dates, phones
        private static readonly Regex LtrRun = new(@"%?[A-Za-z0-9]+(?:[.,:/@_+\-\s]+[A-Za-z0-9]+)*");

        public async Task<string> ExtractTextAsync(Stream pdfStream)
        {
            using var memoryStream = new MemoryStream();
            await pdfStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var sb = new StringBuilder();
            using var document = PdfDocument.Open(memoryStream);

            foreach (var page in document.GetPages())
            {
                sb.Append(ExtractPage(page));
            }

            return sb.ToString();
        }

        public static string ExtractPage(Page page)
        {
            var letters = page.Letters.Where(l => !string.IsNullOrEmpty(l.Value)).ToList();
            if (letters.Count == 0)
                return "";

            // Group letters into lines by baseline, top to bottom
            var lines = new List<List<Letter>>();
            foreach (var letter in letters.OrderByDescending(l => l.StartBaseLine.Y))
            {
                var line = lines.LastOrDefault();
                var tolerance = Math.Max(letter.PointSize, 4) * 0.4;
                if (line != null && Math.Abs(line[0].StartBaseLine.Y - letter.StartBaseLine.Y) <= tolerance)
                    line.Add(letter);
                else
                    lines.Add(new List<Letter> { letter });
            }

            var sb = new StringBuilder();
            foreach (var line in lines)
            {
                // A wide gap separates table cells or columns; a small one is a word space
                var segments = new List<string>();
                var current = new StringBuilder();
                var ordered = line.OrderBy(l => l.StartBaseLine.X).ToList();
                for (int i = 0; i < ordered.Count; i++)
                {
                    if (i > 0)
                    {
                        var prev = ordered[i - 1];
                        var size = Math.Max(prev.PointSize, 4);
                        var gap = ordered[i].StartBaseLine.X - prev.EndBaseLine.X;
                        if (gap > size * 0.8)
                        {
                            segments.Add(current.ToString().Trim());
                            current.Clear();
                        }
                        else if (gap > size * 0.15 && prev.Value != " " && ordered[i].Value != " ")
                            current.Append(' ');
                    }
                    current.Append(ordered[i].Value);
                }
                segments.Add(current.ToString().Trim());
                segments.RemoveAll(string.IsNullOrEmpty);

                // A Hebrew line reads right to left: so do its cells, and each one is turned to reading order
                if (segments.Any(s => Hebrew.IsMatch(s)))
                    segments = segments
                        .Select(s => Hebrew.IsMatch(s) || LtrRun.Match(s).Length != s.Length ? VisualToLogical(s) : s)
                        .Reverse()
                        .ToList();

                sb.AppendLine(string.Join(" | ", segments));
            }
            return sb.ToString();
        }

        // Reverse the drawn (left-to-right) text, then put Latin words and numbers back in their own order
        private static string VisualToLogical(string visual)
        {
            var reversed = new string(visual.Reverse().Select(Mirror).ToArray());
            return LtrRun.Replace(reversed, m => new string(m.Value.Reverse().ToArray()));
        }

        private static char Mirror(char c) => c switch
        {
            '(' => ')', ')' => '(', '[' => ']', ']' => '[', '<' => '>', '>' => '<', _ => c
        };
    }
}
