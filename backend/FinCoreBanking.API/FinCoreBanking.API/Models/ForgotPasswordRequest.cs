namespace FinCoreBanking.API.Models
{
    // Represents the forgot password request.
    public class ForgotPasswordRequest
    {
        // Stores the registered email address.
        public string Email { get; set; } = string.Empty;
    }
}