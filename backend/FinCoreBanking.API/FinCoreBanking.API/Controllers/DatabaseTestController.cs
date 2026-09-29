using FinCoreBanking.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseTestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DatabaseTestController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> TestConnection()
        {
            var canConnect = await _context.Database.CanConnectAsync();

            if (canConnect)
            {
                return Ok("FinCore Banking database connection successful!");
            }

            return StatusCode(500, "Database connection failed.");
        }
    }
}