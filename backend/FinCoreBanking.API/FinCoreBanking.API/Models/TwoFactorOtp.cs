namespace FinCoreBanking.API.Models;

public class TwoFactorOtp
{
    public int TwoFactorOtpId { get; set; }

    public int UserId { get; set; }

    public string OtpCode { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedDate { get; set; }
}