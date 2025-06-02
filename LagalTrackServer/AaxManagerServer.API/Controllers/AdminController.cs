using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxManager.Data;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _dbContext;

        public AdminController(DataContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAllData()
        {
            await _dbContext.Documents.ExecuteDeleteAsync();
            await _dbContext.ChatMessages.ExecuteDeleteAsync();
            await _dbContext.Folders.ExecuteDeleteAsync();
            await _dbContext.Users.ExecuteDeleteAsync();
            await _dbContext.Groups.ExecuteDeleteAsync();

            return Ok("All data deleted successfully");
        }
    }
}


