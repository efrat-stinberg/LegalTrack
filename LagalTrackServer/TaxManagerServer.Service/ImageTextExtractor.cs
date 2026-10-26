using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    // Reads the text in an image with the same OpenAI model the chat uses (it accepts images)
    public class ImageTextExtractor : IImageTextExtractor
    {
        // OpenAI accepts images up to 20MB
        public const long MaxImageBytes = 20L * 1024 * 1024;

        private const string Instructions =
            "Transcribe all the text in this image exactly as written, in its original language and reading order. " +
            "Keep the line breaks; write table rows on separate lines with the cells separated by \" | \". " +
            "Do not translate, summarize or add anything. " +
            "If the image has little or no text, describe what it shows in one or two sentences starting with \"Image:\".";

        private readonly OpenAiClient _openAi;

        public ImageTextExtractor(OpenAiClient openAi)
        {
            _openAi = openAi;
        }

        public async Task<string> ExtractTextAsync(Stream imageStream, string mediaType)
        {
            if (!_openAi.IsConfigured)
                throw new ChatUnavailableException("Reading images needs the AI service (missing ChatKey).");

            using var memoryStream = new MemoryStream();
            await imageStream.CopyToAsync(memoryStream);
            if (memoryStream.Length > MaxImageBytes)
                throw new InvalidDataException("The image is larger than 20MB, which the AI service cannot read.");

            return await _openAi.CompleteAsync(new object[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = Instructions },
                        new { type = "image_url", image_url = new { url = $"data:{mediaType};base64,{Convert.ToBase64String(memoryStream.ToArray())}" } }
                    }
                }
            });
        }
    }
}
