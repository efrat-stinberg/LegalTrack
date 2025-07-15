using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var clients = await _clientService.GetAllAsync();
            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var client = await _clientService.GetByIdAsync(id);
            if (client == null)
                return NotFound();
            return Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Client client)
        {
            Console.WriteLine("------------------------");
            Console.WriteLine("------------------------");
            Console.WriteLine("------------------------");
            Console.WriteLine("------------------------");
            Console.WriteLine("------------------------");
            Console.WriteLine("------------------------");

            Console.WriteLine("Received client object:");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(client));
            
            if (client == null)
            {
                Console.WriteLine("Received null client");
                return BadRequest("Client data is null");
            }

            Console.WriteLine($"Received client: Name={client.FullName}, Email={client.Email}, Phone={client.Phone}");

            try
            {
                await _clientService.AddAsync(client);
                Console.WriteLine("Client added successfully");
                return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error adding client: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("Inner Exception: " + ex.InnerException.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Client client)
        {
            if (id != client.Id)
                return BadRequest();

            await _clientService.UpdateAsync(client);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _clientService.DeleteAsync(id);
            return NoContent();
        }
    }
}
