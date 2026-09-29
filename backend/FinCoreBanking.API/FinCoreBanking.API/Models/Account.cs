namespace FinCoreBanking.API.Models
{
    // Represents a bank account.
    public class Account
    {
        public int AccountId { get; set; }
        public int CustomerId { get; set; }
        public int AccountTypeId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string? IFSCCode { get; set; }
        public decimal CurrentBalance { get; set; }
        public string AccountStatus { get; set; } = "Active";
        public DateTime OpenedDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}