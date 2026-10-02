namespace FinCoreBanking.API.DTOs;

public class VerifyOtpRequest
{
    // Stores the user ID for OTP verification.
    public int UserId { get; set; }

    // Stores the OTP entered by the user.
    public string OtpCode { get; set; } = string.Empty;
}