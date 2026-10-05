namespace FinCoreBanking.API.DTOs;

public class VerifyPasswordResetOtpRequest
{
    public string Email { get; set; } = string.Empty;

    public string OtpCode { get; set; } = string.Empty;
}