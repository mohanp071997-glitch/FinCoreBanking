namespace FinCoreBanking.API.DTOs
{
    // Represents the data required to create a bank account.
    public class CreateAccountRequest
    {
        public int CustomerId { get; set; }
        public int AccountTypeId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string? IFSCCode { get; set; }
        public decimal OpeningBalance { get; set; }
    }
}