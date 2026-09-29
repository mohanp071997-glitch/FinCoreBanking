namespace FinCoreBanking.API.Models
{
    // Represents a role in the application.
    public class Role
    {
        public int RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}