namespace FinCoreBanking.API.Models
{
    // Represents a customer in the banking system.
    public class Customer
    {
        public int CustomerId { get; set; }
        public int UserId { get; set; }
        public string CustomerNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        // Stores the customer's email address.
        public string? Email { get; set; }

        // Stores the customer's blood group.
        public string? BloodGroup { get; set; }

        // Stores the customer's emergency contact number.
        public string? EmergencyContactNumber { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}