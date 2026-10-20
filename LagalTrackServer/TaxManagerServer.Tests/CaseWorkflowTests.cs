using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaxManagerServer.Tests.Infrastructure;

namespace TaxManagerServer.Tests
{
    [Collection(ApiCollection.Name)]
    public class CaseWorkflowTests
    {
        private readonly LegalTrackApiFactory _factory;

        public CaseWorkflowTests(LegalTrackApiFactory factory)
        {
            _factory = factory;
            _factory.OpenAi.StatusCode = HttpStatusCode.OK;
        }

        [Fact]
        public async Task Client_create_list_edit_and_delete()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync("Dana Levi");
            Assert.Single((await admin.GetJsonAsync("/api/client")).EnumerateArray());

            // The React edit form sends only the fields, without an id
            var update = await admin.Http.PutAsJsonAsync($"/api/client/{clientId}", new { fullName = "Dana Cohen", email = "d@example.com", phone = "052" });
            await ApiAssert.StatusAsync(HttpStatusCode.OK, update);
            var updated = await update.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("Dana Cohen", updated.GetProperty("fullName").GetString());
            Assert.Equal(clientId, updated.GetProperty("id").GetInt32());

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest, await admin.Http.PostAsJsonAsync("/api/client", new { fullName = " " }));
            await ApiAssert.StatusAsync(HttpStatusCode.Created, await admin.Http.PostAsJsonAsync("/api/client", new { fullName = "No Contact Details" }));

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent, await admin.Http.DeleteAsync($"/api/client/{clientId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await admin.Http.GetAsync($"/api/client/{clientId}"));
        }

        [Fact]
        public async Task Client_with_cases_cannot_be_deleted()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync();
            var folderId = await admin.CreateFolderAsync(clientId);

            await ApiAssert.StatusAsync(HttpStatusCode.Conflict, await admin.Http.DeleteAsync($"/api/client/{clientId}"));
            await ApiAssert.StatusAsync(HttpStatusCode.OK, await admin.Http.GetAsync($"/api/folders/{folderId}"));
        }

        [Fact]
        public async Task Folder_create_list_rename_and_missing_returns_404()
        {
            var admin = await ApiSession.RegisterOfficeAsync(_factory);
            var clientId = await admin.CreateClientAsync();
            var folderId = await admin.CreateFolderAsync(clientId, "Lease");

            Assert.Single((await admin.GetJsonAsync("/api/folders")).EnumerateArray());
            Assert.Single((await admin.GetJsonAsync($"/api/folders/by-client/{clientId}")).EnumerateArray());

            await ApiAssert.StatusAsync(HttpStatusCode.NoContent,
                await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new { folderName = "Lease 2024", clientId }));
            var renamed = await admin.GetJsonAsync($"/api/folders/{folderId}");
            Assert.Equal("Lease 2024", renamed.GetProperty("folderName").GetString());
            Assert.Equal("Dana Levi", renamed.GetProperty("clientName").GetString());

            // Move the case to another client of the office
            var otherClientId = await admin.CreateClientAsync("Other Client");
            await ApiAssert.StatusAsync(HttpStatusCode.NoContent,
                await admin.Http.PutAsJsonAsync($"/api/folders/{folderId}", new { folderName = "Lease 2024", clientId = otherClientId }));
            var moved = await admin.GetJsonAsync($"/api/folders/{folderId}");
            Assert.Equal(otherClientId, moved.GetProperty("clientId").GetInt32());
            Assert.Equal("Other Client", moved.GetProperty("clientName").GetString());

            await ApiAssert.StatusAsync(HttpStatusCode.BadRequest,
                await admin.Http.PostAsJsonAsync("/api/folders", new { folderName = "No client", clientId = 999999 }));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await admin.Http.GetAsync("/api/folders/999999"));
            await ApiAssert.StatusAsync(HttpStatusCode.NotFound, await admin.Http.DeleteAsync("/api/folders/999999"));
        }
    }
}
