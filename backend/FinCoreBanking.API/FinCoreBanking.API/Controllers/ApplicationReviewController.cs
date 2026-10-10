
using System.Security.Claims;
using System.Text.Json;
using FinCoreBanking.API.Data;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers;

// FEATURE: Account opening application review APIs.
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Reviewer")]
public class ApplicationReviewController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApplicationReviewController(ApplicationDbContext context)
    {
        _context = context;
    }

    // FEATURE: Get pending applications for reviewer.
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingApplications()
    {
        var applications = await _context.AccountOpeningApplications
            .AsNoTracking()
            .Where(x => x.Status == "Pending Approval")
            .OrderBy(x => x.SubmittedAt)
            .Select(x => new
            {
                x.AccountOpeningApplicationId,
                x.ApplicationRequestId,
                x.Email,
                x.Status,
                x.SubmittedAt
            })
            .ToListAsync();

        return Ok(applications);
    }

    // FEATURE: Get application details for review.
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetApplicationDetails(long id)
    {
        var application = await _context.AccountOpeningApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.AccountOpeningApplicationId == id);

        if (application == null)
        {
            return NotFound(new
            {
                message = "Application not found."
            });
        }

        // FEATURE: Parse saved application JSON.
        using var document = JsonDocument.Parse(
            application.ApplicationData);

        var applicationData = document.RootElement.Clone();

        return Ok(new
        {
            application.AccountOpeningApplicationId,
            application.ApplicationRequestId,
            application.Email,
            application.Status,
            application.SubmittedAt,
            ApplicationData = applicationData
        });
    }

    // FEATURE: Save reviewer verification decision.
    [HttpPost("{id:long}/decision")]
    public async Task<IActionResult> SubmitReview(
        long id,
        [FromBody] SubmitApplicationReviewRequest request)
    {
        if (request == null)
        {
            return BadRequest(new
            {
                message = "Request body is required."
            });
        }

        var decision = request.ReviewDecision?.Trim();

        if (decision != "Verified" && decision != "Rejected")
        {
            return BadRequest(new
            {
                message = "ReviewDecision must be Verified or Rejected."
            });
        }

        if (decision == "Rejected" &&
            string.IsNullOrWhiteSpace(request.Comments))
        {
            return BadRequest(new
            {
                message = "Comments are required when rejecting an application."
            });
        }

        // FEATURE: Resolve reviewer ID from authenticated JWT claims.
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("UserId")?.Value
            ?? User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var reviewerUserId))
        {
            return Unauthorized(new
            {
                message = "Reviewer user ID was not found in the token."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var application = await _context.AccountOpeningApplications
            .FirstOrDefaultAsync(x =>
                x.AccountOpeningApplicationId == id);

        if (application == null)
        {
            return NotFound(new
            {
                message = "Application not found."
            });
        }

        if (application.Status != "Pending Approval")
        {
            return Conflict(new
            {
                message = "This application is not awaiting review."
            });
        }

        // FEATURE: Store review verification results.
        var review = new ApplicationReview
        {
            AccountOpeningApplicationId =
                application.AccountOpeningApplicationId,
            ReviewerUserId = reviewerUserId,
            ReviewDecision = decision,
            PersonalDetailsVerified =
                request.PersonalDetailsVerified,
            IdentityDocumentVerified =
                request.IdentityDocumentVerified,
            AddressDocumentVerified =
                request.AddressDocumentVerified,
            ApplicantPhotoVerified =
                request.ApplicantPhotoVerified,
            Comments = request.Comments?.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            ReviewedAtUtc = DateTime.UtcNow
        };

        var previousStatus = application.Status;

        // FEATURE: Update status for the next workflow stage.
        application.Status = decision == "Verified"
            ? "Pending Final Approval"
            : "Rejected";

        // FEATURE: Record application status history.
        var history = new ApplicationStatusHistory
        {
            AccountOpeningApplicationId =
                application.AccountOpeningApplicationId,
            PreviousStatus = previousStatus,
            NewStatus = application.Status,
            ChangedByUserId = reviewerUserId,
            Reason = request.Comments?.Trim(),
            ChangedAtUtc = DateTime.UtcNow
        };

        _context.ApplicationReviews.Add(review);
        _context.ApplicationStatusHistories.Add(history);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Application review saved successfully.",
            application.ApplicationRequestId,
            review.ReviewDecision,
            application.Status
        });
    }
}

// FEATURE: Request DTO for reviewer decision.
public class SubmitApplicationReviewRequest
{
    public string ReviewDecision { get; set; } = string.Empty;

    public bool PersonalDetailsVerified { get; set; }

    public bool IdentityDocumentVerified { get; set; }

    public bool AddressDocumentVerified { get; set; }

    public bool ApplicantPhotoVerified { get; set; }

    public string? Comments { get; set; }
}
