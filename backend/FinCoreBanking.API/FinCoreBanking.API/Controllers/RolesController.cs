using FinCoreBanking.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing application roles.
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public RolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns all active roles from the database.
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .Where(x => x.IsActive)
                .ToListAsync();

            return Ok(roles);
        }
    }
}