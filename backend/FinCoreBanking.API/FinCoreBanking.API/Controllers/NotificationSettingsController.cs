using System.Security.Claims;
using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationSettingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Gets the current user's notification settings.
    [HttpGet]
    public async Task<IActionResult> GetNotificationSettings()
    {
        // Gets the user ID from the JWT token.
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        // Finds the user's notification settings.
        var settings = await _context.UserNotificationSettings
            .FirstOrDefaultAsync(x => x.UserId == userId);

        // Creates default settings for a new user.
        if (settings == null)
        {
            settings = new UserNotificationSetting
            {
                UserId = userId,
                TransactionAlerts = true,
                LoginAlerts = true,
                PromotionalNotifications = false,
                CreatedDate = DateTime.UtcNow
            };

            _context.UserNotificationSettings.Add(settings);

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            transactionAlerts = settings.TransactionAlerts,
            loginAlerts = settings.LoginAlerts,
            promotionalNotifications =
                settings.PromotionalNotifications
        });
    }

    // Updates the current user's notification settings.
    [HttpPut]
    public async Task<IActionResult> UpdateNotificationSettings(
        [FromBody] UpdateNotificationSettingsRequest request)
    {
        // Gets the user ID from the JWT token.
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        // Finds the user's notification settings.
        var settings = await _context.UserNotificationSettings
            .FirstOrDefaultAsync(x => x.UserId == userId);

        // Creates settings if they do not exist.
        if (settings == null)
        {
            settings = new UserNotificationSetting
            {
                UserId = userId,
                TransactionAlerts = request.TransactionAlerts,
                LoginAlerts = request.LoginAlerts,
                PromotionalNotifications =
                    request.PromotionalNotifications,
                CreatedDate = DateTime.UtcNow
            };

            _context.UserNotificationSettings.Add(settings);
        }
        else
        {
            // Updates the existing settings.
            settings.TransactionAlerts =
                request.TransactionAlerts;

            settings.LoginAlerts =
                request.LoginAlerts;

            settings.PromotionalNotifications =
                request.PromotionalNotifications;

            settings.ModifiedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Notification settings updated successfully.",
            transactionAlerts = settings.TransactionAlerts,
            loginAlerts = settings.LoginAlerts,
            promotionalNotifications =
                settings.PromotionalNotifications
        });
    }
}