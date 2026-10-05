namespace FinCoreBanking.API.Models
{
    // Stores password reset OTP details.
    public class PasswordResetOtp
    {
        public int PasswordResetOtpId { get; set; }

        public int UserId { get; set; }

        public string Email { get; set; } = string.Empty;

        public string OtpCode { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UsedDate { get; set; }
    }
}