namespace FinCoreBanking.API.Models
{
    // Represents a user in the application.
    public class User
    {
        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;
        // Stores the hashed transaction MPIN.
        public string? MpinHash { get; set; }

        // Stores whether two-factor authentication is enabled.
        public bool IsTwoFactorEnabled { get; set; }


        public bool IsActive { get; set; } = true;
        // Stores the user's last successful login time.
        public DateTime? LastLoginDate { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? ModifiedDate { get; set; }
    }
}