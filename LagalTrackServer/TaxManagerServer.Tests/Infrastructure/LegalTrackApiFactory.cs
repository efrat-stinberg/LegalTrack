using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaxManager.Data;
using TaxManagerServer.Core.Services;
using TaxManagerServer.Service;

namespace TaxManagerServer.Tests.Infrastructure
{
    // Starts the real API (controllers, auth, EF Core, MySQL) in memory.
    // Only the external services are replaced: S3, SendGrid and OpenAI.
    //
    // Needs a MySQL server. Set LEGALTRACK_TEST_DB to its connection string; the default expects a
    // local server on port 3307 with a passwordless root. The test database is dropped and recreated.
    public class LegalTrackApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        public const string FrontendBaseUrl = "https://legaltrack.test";

        public FakeS3Service S3 { get; } = new();
        public FakeEmailService Email { get; } = new();
        public FakeOpenAiHandler OpenAi { get; } = new();

        public string ConnectionString { get; } =
            Environment.GetEnvironmentVariable("LEGALTRACK_TEST_DB")
            ?? "server=127.0.0.1;port=3307;database=legaltrack_tests;user=root;password=";

        public LegalTrackApiFactory()
        {
            // Environment variables are read when Program creates its builder, before any test override hook runs
            Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", ConnectionString);
            Environment.SetEnvironmentVariable("JWT__Key", "test-signing-key-that-is-long-enough-for-hmac-sha256");
            Environment.SetEnvironmentVariable("JWT__Issuer", "legaltrack-tests");
            Environment.SetEnvironmentVariable("JWT__Audience", "legaltrack-tests");
            Environment.SetEnvironmentVariable("JWT__TokenExpirationMinutes", "60");
            Environment.SetEnvironmentVariable("Invite__ExpirationMinutes", "60");
            Environment.SetEnvironmentVariable("Frontend__BaseUrl", FrontendBaseUrl);
            Environment.SetEnvironmentVariable("ChatKey", "test-openai-key");
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureTestServices(services =>
            {
                services.AddSingleton<IS3Service>(S3);
                services.AddSingleton<IEmailService>(Email);
                services.AddHttpClient<IChatService, ChatService>()
                    .ConfigurePrimaryHttpMessageHandler(() => OpenAi);
                services.AddHttpClient<IImageTextExtractor, ImageTextExtractor>()
                    .ConfigurePrimaryHttpMessageHandler(() => OpenAi);
            });
        }

        public async Task InitializeAsync()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseMySql(ConnectionString, new MySqlServerVersion(new Version(8, 0, 25)))
                .Options;
            await using var context = new DataContext(options);
            await context.Database.EnsureDeletedAsync();
            // The real migrations, so the tests also prove they build a working schema
            await context.Database.MigrateAsync();
        }

        Task IAsyncLifetime.DisposeAsync() => Task.CompletedTask;

        public DataContext CreateDbContext()
        {
            var scope = Services.CreateScope();
            return scope.ServiceProvider.GetRequiredService<DataContext>();
        }
    }

    [CollectionDefinition(Name)]
    public class ApiCollection : ICollectionFixture<LegalTrackApiFactory>
    {
        public const string Name = "api";
    }
}
