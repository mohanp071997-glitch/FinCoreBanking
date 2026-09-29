namespace FinCoreBanking.API.Models
{
    // Represents the relationship between a user and a role.
    public class UserRole
    {
        public int UserRoleId { get; set; }

        public int UserId { get; set; }

        public int RoleId { get; set; }
    }
}