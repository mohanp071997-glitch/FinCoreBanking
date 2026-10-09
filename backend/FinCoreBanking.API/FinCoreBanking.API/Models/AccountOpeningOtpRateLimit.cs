namespace FinCoreBanking.API.Models;

// FEATURE: Account Opening OTP Rate Limit
public class AccountOpeningOtpRateLimit
{
    public string Email { get; set; } = string.Empty;

    public DateTime WindowStartedAt { get; set; }

    public int RequestCount { get; set; }
}