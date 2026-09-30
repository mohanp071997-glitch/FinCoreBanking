using System.Security.Claims;
using FinCoreBanking.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CardsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Gets cards belonging to the logged-in customer.
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentCards()
    {
        // Gets the logged-in user ID from the JWT token.
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the customer linked to the logged-in user.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");

        // Gets active customer's cards.
        var cards = await _context.Cards
            .Where(x => x.CustomerId == customer.CustomerId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync();

        return Ok(cards);
    }

    // Updates the status of the logged-in customer's card.
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateCardStatus(
        int id,
        [FromBody] UpdateCardStatusRequest request)
    {
        // Gets the logged-in user ID from the JWT token.
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the customer linked to the logged-in user.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");

        // Gets the card belonging to the logged-in customer.
        var card = await _context.Cards
            .FirstOrDefaultAsync(x =>
                x.CardId == id &&
                x.CustomerId == customer.CustomerId);

        if (card == null)
            return NotFound("Card not found.");

        // Validates the requested card status.
        if (request.Status != "Active" &&
            request.Status != "Blocked")
        {
            return BadRequest("Invalid card status.");
        }

        // Updates the card status.
        card.CardStatus = request.Status;

        // Updates the modified date.
        card.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(card);
    }

    // Request model for updating card status.
    public class UpdateCardStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}