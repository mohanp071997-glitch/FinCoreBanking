
using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using FinCoreBanking.API.Data;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers;

// FEATURE: Final approver APIs for account opening applications.
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Approver")]
public class ApplicationApprovalController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApplicationApprovalController(ApplicationDbContext context)
    {
        _context = context;
    }

    // FEATURE: Get applications awaiting final approval.
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingApplications()
    {
        var applications = await _context.AccountOpeningApplications
            .AsNoTracking()
            .Where(x => x.Status == "Pending Final Approval")
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

    // FEATURE: Approve application and create an account atomically.
    [HttpPost("{id:long}/approve")]
    public async Task<IActionResult> ApproveApplication(long id)
    {
        var approverUserId = GetCurrentUserId();

        if (approverUserId == null)
            return Unauthorized(new { message = "Approver user ID is missing from token." });

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var application = await _context.AccountOpeningApplications
            .FirstOrDefaultAsync(x =>
                x.AccountOpeningApplicationId == id);

        if (application == null)
            return NotFound(new { message = "Application not found." });

        if (application.Status != "Pending Final Approval")
            return Conflict(new { message = "Application is not awaiting final approval." });

        // FEATURE: Require a completed, fully verified reviewer decision.
        var review = await _context.ApplicationReviews
            .AsNoTracking()
            .Where(x =>
                x.AccountOpeningApplicationId == id &&
                x.ReviewDecision == "Verified")
            .OrderByDescending(x => x.ReviewedAtUtc)
            .FirstOrDefaultAsync();

        if (review == null ||
            !review.PersonalDetailsVerified ||
            !review.IdentityDocumentVerified ||
            !review.AddressDocumentVerified ||
            !review.ApplicantPhotoVerified)
        {
            return Conflict(new
            {
                message = "A fully verified reviewer decision is required."
            });
        }

        using var json = JsonDocument.Parse(application.ApplicationData);
        var root = json.RootElement;

        if (!root.TryGetProperty("PersonalDetails", out var personal) ||
            !root.TryGetProperty("AdditionalDetails", out var additional))
        {
            return BadRequest(new
            {
                message = "Application personal or additional details are missing."
            });
        }

        string ReadJsonString(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var value)
                ? value.GetString()?.Trim() ?? string.Empty
                : string.Empty;
        }

        var email = ReadJsonString(personal, "email");

        if (string.IsNullOrWhiteSpace(email) ||
            !string.Equals(email, application.Email,
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Application email is missing or inconsistent."
            });
        }

        var fullName = ReadJsonString(personal, "fullName");
        var accountTypeName = ReadJsonString(additional, "accountType");

        if (string.IsNullOrWhiteSpace(fullName) ||
            string.IsNullOrWhiteSpace(accountTypeName))
        {
            return BadRequest(new
            {
                message = "Full name and account type are required."
            });
        }

        var accountType = await _context.AccountTypes
            .FirstOrDefaultAsync(x =>
                x.AccountTypeName == accountTypeName);

        if (accountType == null)
        {
            return BadRequest(new
            {
                message = "The selected account type does not exist."
            });
        }

        // FEATURE: Match the application to an existing login user.
        var user = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.Email == application.Email && x.IsActive);

        if (user == null)
        {
            return Conflict(new
            {
                message = "No active login user matches this application."
            });
        }

        // FEATURE: Reuse the existing customer for this user.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x => x.UserId == user.UserId);

        if (customer == null)
        {
            return Conflict(new
            {
                message = "Customer profile must be created before account approval."
            });
        }

        if (!customer.IsActive)
        {
            return Conflict(new
            {
                message = "The customer profile is inactive."
            });
        }

        // FEATURE: Prevent duplicate account creation on retry.
        var alreadyHasThisAccountType = await _context.Accounts
            .AnyAsync(x =>
                x.CustomerId == customer.CustomerId &&
                x.AccountTypeId == accountType.AccountTypeId &&
                x.AccountStatus == "Active");

        if (alreadyHasThisAccountType)
        {
            return Conflict(new
            {
                message = "Customer already has an active account of this type."
            });
        }

        // FEATURE: Validate date of birth before updating the customer.
        var dateOfBirthText = ReadJsonString(personal, "dateOfBirth");

        if (!DateTime.TryParse(
                dateOfBirthText,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var dateOfBirth) ||
            dateOfBirth.Date >= DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message = "A valid past date of birth is required."
            });
        }

        var nameParts = fullName.Split(
            ' ',
            StringSplitOptions.RemoveEmptyEntries);

        var firstName = nameParts[0];
        var lastName = nameParts.Length > 1
            ? string.Join(" ", nameParts.Skip(1))
            : null;

        // FEATURE: Update the existing customer profile from verified details.
        customer.FirstName = firstName;
        customer.LastName = lastName;
        customer.DateOfBirth = dateOfBirth;
        customer.Email = application.Email;
        customer.AddressLine1 = ReadJsonString(personal, "addressLine1");
        customer.AddressLine2 = ReadJsonString(personal, "addressLine2");
        customer.City = ReadJsonString(personal, "city");
        customer.State = ReadJsonString(personal, "state");
        customer.PostalCode = ReadJsonString(personal, "postalCode");
        customer.ModifiedDate = DateTime.UtcNow;

        // FEATURE: Generate a unique-format account number.
        var accountNumber =
            $"FCB{DateTime.UtcNow:yyyyMMddHHmmssfff}";

        var now = DateTime.UtcNow;

        var account = new Account
        {
            CustomerId = customer.CustomerId,
            AccountTypeId = accountType.AccountTypeId,
            AccountNumber = accountNumber,
            CurrentBalance = 0m,
            AccountStatus = "Active",
            OpenedDate = now,
            CreatedDate = now
        };

        _context.Accounts.Add(account);

        // FEATURE: Mark the application approved and record history.
        var previousStatus = application.Status;
        application.Status = "Approved";

        _context.ApplicationStatusHistories.Add(
            new ApplicationStatusHistory
            {
                AccountOpeningApplicationId =
                    application.AccountOpeningApplicationId,
                PreviousStatus = previousStatus,
                NewStatus = "Approved",
                ChangedByUserId = approverUserId.Value,
                Reason = "Final approval granted.",
                ChangedAtUtc = now
            });

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Application approved and account created successfully.",
            application.AccountOpeningApplicationId,
            application.ApplicationRequestId,
            application.Status,
            customer.CustomerId,
            account.AccountId,
            account.AccountNumber,
            account.AccountTypeId,
            account.CurrentBalance
        });
    }

    // FEATURE: Reject application with a mandatory reason.
    [HttpPost("{id:long}/reject")]
    public async Task<IActionResult> RejectApplication(
        long id,
        [FromBody] RejectApplicationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Reason))
        {
            return BadRequest(new
            {
                message = "A rejection reason is required."
            });
        }

        if (request.Reason.Trim().Length > 1000)
        {
            return BadRequest(new
            {
                message = "The rejection reason cannot exceed 1000 characters."
            });
        }

        var approverUserId = GetCurrentUserId();

        if (approverUserId == null)
            return Unauthorized(new { message = "Approver user ID is missing from token." });

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var application = await _context.AccountOpeningApplications
            .FirstOrDefaultAsync(x =>
                x.AccountOpeningApplicationId == id);

        if (application == null)
            return NotFound(new { message = "Application not found." });

        if (application.Status != "Pending Final Approval")
        {
            return Conflict(new
            {
                message = "Application is not awaiting final approval."
            });
        }

        var previousStatus = application.Status;
        application.Status = "Rejected";

        _context.ApplicationStatusHistories.Add(
            new ApplicationStatusHistory
            {
                AccountOpeningApplicationId =
                    application.AccountOpeningApplicationId,
                PreviousStatus = previousStatus,
                NewStatus = "Rejected",
                ChangedByUserId = approverUserId.Value,
                Reason = request.Reason.Trim(),
                ChangedAtUtc = DateTime.UtcNow
            });

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Application rejected successfully.",
            application.AccountOpeningApplicationId,
            application.ApplicationRequestId,
            application.Status
        });
    }

    // FEATURE: Read the authenticated user's ID from JWT claims.
    private int? GetCurrentUserId()
    {
        var value =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("UserId")?.Value ??
            User.FindFirst("userId")?.Value;

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }
}

// FEATURE: Request model for rejection.
public class RejectApplicationRequest
{
    public string Reason { get; set; } = string.Empty;
}
