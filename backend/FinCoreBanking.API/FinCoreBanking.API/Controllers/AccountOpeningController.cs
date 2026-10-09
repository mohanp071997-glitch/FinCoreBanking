
using FinCoreBanking.API.Data;
using FinCoreBanking.API.Models;
using FinCoreBanking.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace FinCoreBanking.API.Controllers;

// FEATURE: Account Opening Email OTP APIs
[ApiController]
[Route("api/[controller]")]
public class AccountOpeningController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;

    public AccountOpeningController(
        ApplicationDbContext context,
        EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // FEATURE: Create and save Account Opening Draft
    [HttpPost("draft")]
    public async Task<IActionResult> CreateDraft()
    {
        var draft = new AccountOpeningDraft
        {
            ApplicationDraftId = Guid.NewGuid(),
            Email = null,
            DraftData = null,
            EmailVerified = false,
            IsSubmitted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        _context.AccountOpeningDrafts.Add(draft);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            applicationDraftId = draft.ApplicationDraftId,
            message = "Application draft created successfully."
        });
    }

    // FEATURE: Send Account Opening OTP
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(
        [FromBody] SendAccountOpeningOtpRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Request body is required." });
        }

        var email = request.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email) ||
            !new EmailAddressAttribute().IsValid(email) ||
            request.ApplicationDraftId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "Valid email and application draft ID are required."
            });
        }

        // FEATURE: Validate application draft
        var draft = await _context.AccountOpeningDrafts
            .FirstOrDefaultAsync(x =>
                x.ApplicationDraftId == request.ApplicationDraftId);

        if (draft == null)
        {
            return NotFound(new
            {
                message = "Application draft not found. Create a draft first."
            });
        }

        if (draft.IsSubmitted)
        {
            return BadRequest(new
            {
                message = "This application has already been submitted."
            });
        }

        if (!string.IsNullOrWhiteSpace(draft.Email) &&
            !string.Equals(
                draft.Email,
                email,
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Email does not match this application draft."
            });
        }

        var now = DateTime.UtcNow;

        // FEATURE: Rate limit OTP requests per email
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.Serializable);

        var rateLimit = await _context.AccountOpeningOtpRateLimits
            .FirstOrDefaultAsync(x => x.Email == email);

        if (rateLimit == null)
        {
            rateLimit = new AccountOpeningOtpRateLimit
            {
                Email = email,
                WindowStartedAt = now,
                RequestCount = 0
            };

            _context.AccountOpeningOtpRateLimits.Add(rateLimit);
        }

        if (now - rateLimit.WindowStartedAt >= TimeSpan.FromMinutes(15))
        {
            rateLimit.WindowStartedAt = now;
            rateLimit.RequestCount = 0;
        }

        if (rateLimit.RequestCount >= 3)
        {
            await transaction.RollbackAsync();

            return StatusCode(429, new
            {
                message = "Too many OTP requests. Try again after 15 minutes."
            });
        }

        // FEATURE: Find OTP for this specific draft
        var otpRecord = await _context.AccountOpeningOtps
            .FirstOrDefaultAsync(x =>
                x.Email == email &&
                x.ApplicationDraftId == request.ApplicationDraftId);

        if (otpRecord?.IsVerified == true)
        {
            await transaction.RollbackAsync();

            return BadRequest(new
            {
                message = "Email is already verified for this application."
            });
        }

        // FEATURE: Generate cryptographically secure OTP
        var otp = RandomNumberGenerator
            .GetInt32(100000, 1000000)
            .ToString();

        if (otpRecord == null)
        {
            otpRecord = new AccountOpeningOtp
            {
                Email = email,
                ApplicationDraftId = request.ApplicationDraftId,
                OtpHash = HashOtp(email, otp),
                ExpiresAt = now.AddMinutes(5),
                IsVerified = false,
                IsUsed = false,
                FailedAttempts = 0,
                CreatedAt = now
            };

            _context.AccountOpeningOtps.Add(otpRecord);
        }
        else
        {
            otpRecord.OtpHash = HashOtp(email, otp);
            otpRecord.ExpiresAt = now.AddMinutes(5);
            otpRecord.IsVerified = false;
            otpRecord.IsUsed = false;
            otpRecord.FailedAttempts = 0;
            otpRecord.CreatedAt = now;
        }

        rateLimit.RequestCount++;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        // FEATURE: Send OTP email
        try
        {
            await _emailService.SendOtpEmailAsync(email, otp);
        }
        catch (Exception)
        {
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return StatusCode(500, new
            {
                message = "Unable to send OTP email. Please try again later."
            });
        }

        return Ok(new
        {
            message = "OTP sent successfully.",
            expiresInSeconds = 300,
            applicationDraftId = request.ApplicationDraftId
        });
    }

    // FEATURE: Verify Account Opening OTP
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(
        [FromBody] VerifyAccountOpeningOtpRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Request body is required." });
        }

        var email = request.Email?.Trim().ToLowerInvariant();
        var otp = request.Otp?.Trim();

        if (string.IsNullOrWhiteSpace(email) ||
            !new EmailAddressAttribute().IsValid(email) ||
            request.ApplicationDraftId == Guid.Empty ||
            string.IsNullOrWhiteSpace(otp) ||
            otp.Length != 6 ||
            !otp.All(char.IsDigit))
        {
            return BadRequest(new
            {
                message = "Valid email, application draft ID and 6-digit OTP are required."
            });
        }

        // FEATURE: Find the specific application draft
        var draft = await _context.AccountOpeningDrafts
            .FirstOrDefaultAsync(x =>
                x.ApplicationDraftId == request.ApplicationDraftId);

        if (draft == null)
        {
            return NotFound(new
            {
                message = "Application draft not found."
            });
        }

        if (draft.IsSubmitted)
        {
            return BadRequest(new
            {
                message = "This application has already been submitted."
            });
        }

        if (!string.IsNullOrWhiteSpace(draft.Email) &&
            !string.Equals(
                draft.Email,
                email,
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Email does not match this application draft."
            });
        }

        // FEATURE: Retrieve OTP for this draft only
        var otpRecord = await _context.AccountOpeningOtps
            .FirstOrDefaultAsync(x =>
                x.Email == email &&
                x.ApplicationDraftId == request.ApplicationDraftId);

        if (otpRecord == null || otpRecord.IsUsed)
        {
            return BadRequest(new
            {
                message = "OTP not found. Please request a new OTP."
            });
        }

        if (otpRecord.IsVerified)
        {
            return BadRequest(new
            {
                message = "OTP has already been verified."
            });
        }

        if (otpRecord.ExpiresAt <= DateTime.UtcNow)
        {
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return BadRequest(new
            {
                message = "OTP expired. Please request a new OTP."
            });
        }

        if (otpRecord.FailedAttempts >= 5)
        {
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return BadRequest(new
            {
                message = "Maximum attempts exceeded. Request a new OTP."
            });
        }

        // FEATURE: Verify OTP hash using constant-time comparison
        var suppliedHash = HashOtp(email, otp);

        var storedHashBytes = Encoding.UTF8.GetBytes(otpRecord.OtpHash);
        var suppliedHashBytes = Encoding.UTF8.GetBytes(suppliedHash);

        if (!CryptographicOperations.FixedTimeEquals(
                storedHashBytes,
                suppliedHashBytes))
        {
            otpRecord.FailedAttempts++;

            if (otpRecord.FailedAttempts >= 5)
            {
                otpRecord.IsUsed = true;
            }

            await _context.SaveChangesAsync();

            return BadRequest(new
            {
                message = otpRecord.IsUsed
                    ? "Maximum attempts exceeded. Request a new OTP."
                    : "Invalid OTP."
            });
        }

        // FEATURE: Mark OTP and draft as verified
        otpRecord.IsVerified = true;

        draft.Email = email;
        draft.EmailVerified = true;
        draft.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Email OTP verified successfully.",
            emailVerified = true,
            applicationDraftId = request.ApplicationDraftId
        });
    }

    // FEATURE: Hash OTP
    private static string HashOtp(string email, string otp)
    {
        var bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes($"{email}:{otp}"));

        return Convert.ToHexString(bytes);
    }
}

// FEATURE: Send OTP DTO
public class SendAccountOpeningOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public Guid ApplicationDraftId { get; set; }
}

// FEATURE: Verify OTP DTO
public class VerifyAccountOpeningOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Otp { get; set; } = string.Empty;

    [Required]
    public Guid ApplicationDraftId { get; set; }
}
