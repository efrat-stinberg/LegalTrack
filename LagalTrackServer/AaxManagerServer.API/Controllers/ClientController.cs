using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManagerServer.API.Models;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientController : OfficeControllerBase
    {
        private readonly IClientService _clientService;

        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
        }

        private async Task<Client?> GetOwnClientAsync(int id)
        {
            var client = await _clientService.GetByIdAsync(id);
            return client != null && await IsInMyOfficeAsync(client.GroupId) ? client : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Unauthorized();

            return Ok(await _clientService.GetAllByGroupAsync(groupId.Value));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var client = await GetOwnClientAsync(id);
            return client == null ? NotFound() : Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClientInputModel input)
        {
            if (string.IsNullOrWhiteSpace(input?.FullName))
                return BadRequest("Client name is required.");

            var groupId = await GetCurrentGroupIdAsync();
            if (groupId == null)
                return Unauthorized();

            var client = new Client
            {
                FullName = input.FullName.Trim(),
                Email = input.Email?.Trim() ?? "",
                Phone = input.Phone?.Trim() ?? "",
                GroupId = groupId.Value
            };

            await _clientService.AddAsync(client);
            return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
        }

        // The id comes from the route; the body only carries the editable fields
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClientInputModel input)
        {
            if (string.IsNullOrWhiteSpace(input?.FullName))
                return BadRequest("Client name is required.");

            var client = await GetOwnClientAsync(id);
            if (client == null)
                return NotFound();

            client.FullName = input.FullName.Trim();
            client.Email = input.Email?.Trim() ?? "";
            client.Phone = input.Phone?.Trim() ?? "";
            await _clientService.UpdateAsync(client);

            return Ok(client);
        }

        // Deleting a client would cascade-delete all of its cases, so require the cases to be removed first
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (await GetOwnClientAsync(id) == null)
                return NotFound();

            if (await _clientService.HasFoldersAsync(id))
                return Conflict("לא ניתן למחוק לקוח שיש לו תיקים. יש למחוק או להעביר את התיקים קודם.");

            await _clientService.DeleteAsync(id);
            return NoContent();
        }
    }
}
