
using FinCoreBanking.API.Data;
using FinCoreBanking.API.Models;
using FinCoreBanking.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;

namespace FinCoreBanking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestTrackingController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;
    private readonly ILogger<RequestTrackingController> _logger;

    public RequestTrackingController(
        ApplicationDbContext context,
        EmailService emailService,
        ILogger<RequestTrackingController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    // FEATURE: Send OTP for request tracking
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(
        [FromBody] SendRequestTrackingOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RequestId) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Request ID and registered email are required."
            });
        }

        var requestId = request.RequestId.Trim();
        var email = request.Email.Trim();

        if (requestId.Length != 12 ||
            !requestId.All(char.IsDigit))
        {
            return BadRequest(new
            {
                message = "Please enter a valid 12-digit Request ID."
            });
        }

        // FEATURE: Validate request ID and registered email
        var application = await _context.AccountOpeningApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.ApplicationRequestId == requestId &&
                x.Email == email);

        if (application == null)
        {
            return NotFound(new
            {
                message = "Request ID or registered email is incorrect."
            });
        }

        // FEATURE: Invalidate previous unused OTPs
        var previousOtps = await _context.RequestTrackingOtps
            .Where(x =>
                x.RequestId == requestId &&
                x.Email == email &&
                !x.IsUsed)
            .ToListAsync();

        foreach (var previousOtp in previousOtps)
        {
            previousOtp.IsUsed = true;
        }

        // FEATURE: Generate a secure six-digit OTP
        var otp = RandomNumberGenerator
            .GetInt32(0, 1_000_000)
            .ToString("D6");

        var otpRecord = new RequestTrackingOtp
        {
            RequestId = requestId,
            Email = email,
            OtpHash = HashOtp(otp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            FailedAttempts = 0,
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RequestTrackingOtps.Add(otpRecord);
        await _context.SaveChangesAsync();

        
        try
        {
            // FEATURE: Send Track Application OTP using Email Template
            await _emailService.SendTemplateEmailAsync(
                email,
                "TrackApplicationEmailVerification",
                new Dictionary<string, string>
                {
                    ["{{OTP}}"] = otp,
                    ["{{ExpiryMinutes}}"] = "5",
                    ["{{CurrentYear}}"] = DateTime.UtcNow.Year.ToString()
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send request tracking OTP.");

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return StatusCode(500, new
            {
                message = "Unable to send OTP. Please try again later."
            });
        }


        // FEATURE: Mask email address in API response
        var atIndex = email.IndexOf('@');
        var localPart = email[..atIndex];
        var domain = email[atIndex..];

        var maskedEmail = localPart.Length <= 2
            ? $"{localPart[0]}***{domain}"
            : $"{localPart[..2]}***{domain}";

        return Ok(new
        {
            message = "OTP sent successfully to your registered email.",
            maskedEmail
        });
    }

    // FEATURE: Verify OTP and return request status
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(
        [FromBody] VerifyRequestTrackingOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RequestId) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new
            {
                message = "Request ID, email and OTP are required."
            });
        }

        var requestId = request.RequestId.Trim();
        var email = request.Email.Trim();
        var otp = request.Otp.Trim();

        if (requestId.Length != 12 ||
            !requestId.All(char.IsDigit) ||
            otp.Length != 6 ||
            !otp.All(char.IsDigit))
        {
            return BadRequest(new
            {
                message = "Please enter a valid Request ID and six-digit OTP."
            });
        }

        // FEATURE: Find the latest unused OTP
        var otpRecord = await _context.RequestTrackingOtps
            .Where(x =>
                x.RequestId == requestId &&
                x.Email == email &&
                !x.IsUsed)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null)
        {
            return BadRequest(new
            {
                message = "OTP is invalid or has already been used. Please request a new OTP."
            });
        }

        // FEATURE: Check OTP expiry
        if (otpRecord.ExpiresAt <= DateTime.UtcNow)
        {
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return BadRequest(new
            {
                message = "OTP has expired. Please request a new OTP."
            });
        }

        // FEATURE: Limit incorrect OTP attempts
        if (otpRecord.FailedAttempts >= 5)
        {
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return BadRequest(new
            {
                message = "Maximum OTP attempts reached. Please request a new OTP."
            });
        }

        // FEATURE: Compare hashed OTP values
        var suppliedHash = HashOtp(otp);

        var expectedBytes = Encoding.UTF8.GetBytes(otpRecord.OtpHash);
        var suppliedBytes = Encoding.UTF8.GetBytes(suppliedHash);

        if (!CryptographicOperations.FixedTimeEquals(
                expectedBytes, suppliedBytes))
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
                    ? "Maximum OTP attempts reached. Please request a new OTP."
                    : "Incorrect OTP. Please try again."
            });
        }

        // FEATURE: Mark OTP as verified and used
        otpRecord.IsUsed = true;
        otpRecord.VerifiedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // FEATURE: Return application status after verification
        var application = await _context.AccountOpeningApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.ApplicationRequestId == requestId &&
                x.Email == email);

        if (application == null)
        {
            return NotFound(new
            {
                message = "Application request was not found."
            });
        }

        return Ok(new
        {
            requestId = application.ApplicationRequestId,
            requestType = "Account Opening",
            status = application.Status,
            submittedAt = application.SubmittedAt,
            lastUpdatedAt = application.SubmittedAt,
            message = $"Your account opening request status is: {application.Status}."
        });
    }

    // FEATURE: Hash OTP before storing it in the database
    private static string HashOtp(string otp)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(otp));
        return Convert.ToHexString(hash);
    }
}

// FEATURE: Request tracking API DTOs
public class SendRequestTrackingOtpRequest
{
    public string RequestId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class VerifyRequestTrackingOtpRequest
{
    public string RequestId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}
