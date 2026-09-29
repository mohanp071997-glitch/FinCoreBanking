using FinCoreBanking.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing account types.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public AccountTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns all active account types.
        [HttpGet]
        public async Task<IActionResult> GetAccountTypes()
        {
            var accountTypes = await _context.AccountTypes
                .Where(x => x.IsActive)
                .ToListAsync();

            return Ok(accountTypes);
        }
    }
}