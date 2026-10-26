using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using UglyToad.PdfPig.Fonts.Standard14Fonts;
using UglyToad.PdfPig.Writer;

namespace TaxManagerServer.Tests.Infrastructure
{
    // An HTTP client logged in as one user, plus helpers for the common calls
    public class ApiSession
    {
        public HttpClient Http { get; }
        public string Email { get; }
        public string Token { get; }

        public ApiSession(HttpClient http, string email, string token)
        {
            Http = http;
            Email = email;
            Token = token;
            Http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public static string UniqueEmail(string prefix) => $"{prefix}-{Guid.NewGuid():N}@example.com";

        public static async Task<string> ReadTokenAsync(HttpResponseMessage response)
        {
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString()!;
        }

        // Registers a new office with its admin and returns a session for that admin
        public static async Task<ApiSession> RegisterOfficeAsync(LegalTrackApiFactory factory, string name = "Admin")
        {
            var email = UniqueEmail("admin");
            var http = factory.CreateClient();
            var response = await http.PostAsJsonAsync("/api/register-admin", new { userName = name, email, password = "Passw0rd" });
            return new ApiSession(factory.CreateClient(), email, await ReadTokenAsync(response));
        }

        public static async Task<HttpResponseMessage> LoginAsync(LegalTrackApiFactory factory, string email, string password) =>
            await factory.CreateClient().PostAsJsonAsync("/api/login", new { email, password });

        // Invites a lawyer and completes registration through the emailed link
        public async Task<ApiSession> InviteAndRegisterLawyerAsync(LegalTrackApiFactory factory, string name = "Lawyer")
        {
            var email = UniqueEmail("lawyer");
            var invite = await Http.PostAsJsonAsync("/api/invite/invite-lawyer", new { email });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, invite);

            var token = InviteTokenFromLink(factory.Email.LinksByEmail[email]);
            var register = await factory.CreateClient().PostAsJsonAsync("/api/register", new { token, name, password = "Lawy3rPass" });
            return new ApiSession(factory.CreateClient(), email, await ReadTokenAsync(register));
        }

        public static string InviteTokenFromLink(string link) => QueryValue(link, "invite");

        public static string QueryValue(string link, string name)
        {
            var query = new Uri(link).Query.TrimStart('?').Split('&')
                .Select(p => p.Split('=', 2))
                .ToDictionary(p => p[0], p => Uri.UnescapeDataString(p[1]));
            return query[name];
        }

        public async Task<JsonElement> GetJsonAsync(string url)
        {
            var response = await Http.GetAsync(url);
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            return await response.Content.ReadFromJsonAsync<JsonElement>();
        }

        public async Task<int> CreateClientAsync(string fullName = "Dana Levi")
        {
            var response = await Http.PostAsJsonAsync("/api/client", new { fullName, email = "dana@example.com", phone = "050-0000000" });
            await ApiAssert.StatusAsync(HttpStatusCode.Created, response);
            return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
        }

        public async Task<int> CreateFolderAsync(int clientId, string folderName = "Contract dispute")
        {
            var response = await Http.PostAsJsonAsync("/api/folders", new { folderName, clientId });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("folderId").GetInt32();
        }

        // Uploads a one-page PDF containing the given text; returns (documentId, objectKey)
        public Task<(int DocumentId, string ObjectKey)> UploadPdfAsync(int folderId, string text, string fileName = "contract.pdf") =>
            UploadFileAsync(folderId, CreatePdf(text), fileName, "application/pdf");

        public async Task<(int DocumentId, string ObjectKey)> UploadFileAsync(int folderId, byte[] bytes, string fileName, string contentType)
        {
            using var form = new MultipartFormDataContent();
            var file = new ByteArrayContent(bytes);
            file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            form.Add(file, "file", fileName);
            form.Add(new StringContent(folderId.ToString()), "folderId");

            var response = await Http.PostAsync("/api/s3/upload", form);
            await ApiAssert.StatusAsync(HttpStatusCode.OK, response);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return (json.GetProperty("documentId").GetInt32(), json.GetProperty("objectKey").GetString()!);
        }

        // A minimal .docx: one paragraph per line, then a table with the given rows
        public static byte[] CreateDocx(string[] paragraphs, string[][] tableRows)
        {
            const string w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
            static string Escape(string s) => System.Security.SecurityElement.Escape(s)!;
            var body = string.Concat(paragraphs.Select(p => $"<w:p><w:r><w:t xml:space=\"preserve\">{Escape(p)}</w:t></w:r></w:p>"));
            if (tableRows.Length > 0)
                body += "<w:tbl>" + string.Concat(tableRows.Select(row =>
                    "<w:tr>" + string.Concat(row.Select(cell => $"<w:tc><w:p><w:r><w:t>{Escape(cell)}</w:t></w:r></w:p></w:tc>")) + "</w:tr>")) + "</w:tbl>";

            using var ms = new MemoryStream();
            using (var zip = new System.IO.Compression.ZipArchive(ms, System.IO.Compression.ZipArchiveMode.Create, true))
            {
                void Add(string name, string content)
                {
                    using var writer = new StreamWriter(zip.CreateEntry(name).Open());
                    writer.Write(content);
                }
                Add("[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>");
                Add("_rels/.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>");
                Add("word/document.xml", $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:document xmlns:w=\"{w}\"><w:body>{body}</w:body></w:document>");
            }
            return ms.ToArray();
        }

        public static byte[] CreatePdf(string text)
        {
            var builder = new PdfDocumentBuilder();
            var page = builder.AddPage(UglyToad.PdfPig.Content.PageSize.A4);
            var font = builder.AddStandard14Font(Standard14Font.Helvetica);
            page.AddText(text, 12, new UglyToad.PdfPig.Core.PdfPoint(25, 700), font);
            return builder.Build();
        }
    }

    public static class ApiAssert
    {
        // Assert.Equal on the status code, but shows the response body when it fails
        public static async Task StatusAsync(HttpStatusCode expected, HttpResponseMessage response)
        {
            if (response.StatusCode != expected)
            {
                var body = await response.Content.ReadAsStringAsync();
                Assert.Fail($"{response.RequestMessage?.Method} {response.RequestMessage?.RequestUri?.PathAndQuery}: expected {(int)expected} {expected}, got {(int)response.StatusCode} {response.StatusCode}. Body: {body}");
            }
        }
    }
}
