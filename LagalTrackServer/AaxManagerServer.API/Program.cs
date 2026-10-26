using TaxManager.Core.Services;
using TaxManager.Data;
using TaxManager.Service;
using TaxManagerServer.Core;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Data.Repositories;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using TaxManagerServer.Core.Middlewares;
using Microsoft.EntityFrameworkCore;
using Amazon.S3;
using Microsoft.AspNetCore.Hosting;
using TaxManagerServer.Core.Services;
using TaxManagerServer.Service;
using TaxManagerServer.Data;
using TaxManagerServer.API.Security;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddUserSecrets<Program>();

builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<LoginAttemptLimiter>();

// Render (and most hosts) put the API behind a proxy; take the caller's IP from X-Forwarded-For
// so the login limit counts each client separately instead of the proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Description = "Bearer Authentication with JWT Token",
        Type = SecuritySchemeType.Http
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            },
            new List<string>()
        }
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured.")))
    };
});

// Add CORS policy.
// Set Cors:AllowedOrigins (comma separated, e.g. "https://legaltrack.onrender.com,https://legal-track.onrender.com")
// to restrict which sites may call the API; when it is not set any origin is allowed.
var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            if (allowedOrigins.Length > 0)
                policy.WithOrigins(allowedOrigins);
            else
                policy.AllowAnyOrigin();
            policy.AllowAnyMethod()
                  .AllowAnyHeader();
        });
});




// Add AWS S3 service
builder.Services.AddDbContext<DataContext>(
    options => options.UseMySql(
        builder.Configuration["ConnectionStrings:DefaultConnection"],
        new MySqlServerVersion(new Version(8, 0, 25)) // Replace with your MySQL server version
    ));


builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<IS3Service, S3Service>();

builder.Services.AddScoped<IPdfTextExtractor, PdfTextExtractor>();
// Images are read by the OpenAI model, through its own pooled HttpClient
builder.Services.AddHttpClient<IImageTextExtractor, ImageTextExtractor>(client => client.Timeout = TimeSpan.FromMinutes(2));
builder.Services.AddScoped<IDocumentTextExtractor, DocumentTextExtractor>();


// Register application services
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IGroupService, GroupService>();
// Typed HttpClient: one pooled client for the OpenAI calls, replaceable in tests
builder.Services.AddHttpClient<IChatService, ChatService>(client => client.Timeout = TimeSpan.FromMinutes(2));
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IFolderService, FolderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IRepositoryManager, RepositoryManager>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IFolderRepository, FolderRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IInviteRepository, InviteRepository>();
builder.Services.AddScoped<IInviteService, InviteService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
// Email:Provider (ses / mailjet / brevo / sendgrid) picks the provider;
// without it, the first one configured: SES, Mailjet, Brevo, otherwise SendGrid
var emailProvider = builder.Configuration["Email:Provider"]?.Trim().ToLowerInvariant();
if (string.IsNullOrEmpty(emailProvider))
    emailProvider = !string.IsNullOrWhiteSpace(builder.Configuration["Ses:SenderEmail"]) ? "ses"
        : !string.IsNullOrWhiteSpace(builder.Configuration["Mailjet:ApiKey"]) ? "mailjet"
        : !string.IsNullOrWhiteSpace(builder.Configuration["Brevo:ApiKey"]) ? "brevo"
        : "sendgrid";
switch (emailProvider)
{
    case "ses":
        builder.Services.AddScoped<IEmailService, SesEmailService>();
        break;
    case "mailjet":
        builder.Services.AddHttpClient<IEmailService, MailjetEmailService>(client => client.Timeout = TimeSpan.FromSeconds(30));
        break;
    case "brevo":
        builder.Services.AddHttpClient<IEmailService, BrevoEmailService>(client => client.Timeout = TimeSpan.FromSeconds(30));
        break;
    case "sendgrid":
        builder.Services.AddScoped<IEmailService, SendGridEmailService>();
        break;
    default:
        throw new InvalidOperationException($"Unknown Email:Provider '{emailProvider}'. Use ses, mailjet, brevo or sendgrid.");
}
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));


// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Mapping));

var app = builder.Build();

// Apply small idempotent schema changes (see SchemaUpgrader). A failure is logged, not fatal,
// so the API still starts and the rest of the system keeps working.
using (var scope = app.Services.CreateScope())
{
    try
    {
        await SchemaUpgrader.UpgradeAsync(scope.ServiceProvider.GetRequiredService<DataContext>(), app.Logger);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Schema upgrade failed");
    }
}

//Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseForwardedHeaders();

app.UseHttpsRedirection();

// Use CORS middleware
app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//app.MapGet("/", () => "Welcome to the AaxManager API!");

app.Run();

// Lets the integration tests start the app with WebApplicationFactory<Program>
public partial class Program { }
