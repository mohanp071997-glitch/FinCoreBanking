namespace FinCoreBanking.API.Models
{
    public class MobileLoginOtp
    {
        public int OtpId { get; set; }

        public int UserId { get; set; }

        public string MobileNumber { get; set; } = string.Empty;

        public string OtpCode { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UsedDate { get; set; }
    }
}