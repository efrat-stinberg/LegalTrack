using Microsoft.Extensions.Configuration;

namespace TaxManagerServer.Service
{
    // Links into the lawyers' app. They point at the site root (not a page path) because the static
    // host only serves index.html at "/"; the React app forwards ?invite= and ?reset= to their pages.
    public static class FrontendLinks
    {
        // Used when Frontend:BaseUrl is not configured (the deployed lawyers' app)
        private const string DefaultFrontendBaseUrl = "https://legaltrack.onrender.com";

        public static string Build(IConfiguration configuration, string parameter, string token)
        {
            var baseUrl = configuration["Frontend:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
                baseUrl = DefaultFrontendBaseUrl;
            return $"{baseUrl.TrimEnd('/')}/?{parameter}={Uri.EscapeDataString(token)}";
        }
    }
}
