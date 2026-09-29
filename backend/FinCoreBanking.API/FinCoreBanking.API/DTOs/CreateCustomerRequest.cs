namespace FinCoreBanking.API.DTOs
{
    // Represents the data required to create a customer.
    public class CreateCustomerRequest
    {
        public int UserId { get; set; }
        public string CustomerNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
    }
}