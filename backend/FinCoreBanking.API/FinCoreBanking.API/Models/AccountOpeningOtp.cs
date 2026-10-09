namespace FinCoreBanking.API.Models;

// FEATURE: Account Opening OTP Entity
public class AccountOpeningOtp
{
    public long AccountOpeningOtpId { get; set; }

    public string Email { get; set; } = string.Empty;

    public string OtpHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsVerified { get; set; }

    public bool IsUsed { get; set; }

    public int FailedAttempts { get; set; }

    public DateTime CreatedAt { get; set; }

    // FEATURE: Bind OTP to one application draft
    public Guid? ApplicationDraftId { get; set; }
}