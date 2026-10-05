namespace FinCoreBanking.API.Models
{
    // Represents the mobile OTP verification request.
    public class MobileVerifyOtpRequest
    {
        // Stores the user ID.
        public int UserId { get; set; }

        // Stores the OTP entered by the user.
        public string OtpCode { get; set; } = string.Empty;
    }
}