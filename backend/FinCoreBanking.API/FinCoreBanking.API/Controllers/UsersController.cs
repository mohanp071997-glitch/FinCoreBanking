using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing users.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

     
        // Returns all active users from the database.
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Where(x => x.IsActive)
                .Select(x => new UserResponse
                {
                    UserId = x.UserId,
                    UserName = x.UserName,
                    Email = x.Email,
                    IsActive = x.IsActive,
                    CreatedDate = x.CreatedDate,
                    ModifiedDate = x.ModifiedDate
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}