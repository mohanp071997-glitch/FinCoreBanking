namespace FinCoreBanking.API.DTOs
{
    // Represents the data required for user login.
    public class LoginRequest
    {
        // User's registered email address.
        public string Email { get; set; } = string.Empty;

        // User's login password.
        public string Password { get; set; } = string.Empty;
    }
}