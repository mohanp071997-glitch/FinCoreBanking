namespace FinCoreBanking.API.Models
{
    // Represents a fund transfer between accounts.
    public class FundTransfer
    {
        public int FundTransferId { get; set; }
        public int FromAccountId { get; set; }
        public int BeneficiaryId { get; set; }
        public string TransferReference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TransferDescription { get; set; }
        public string TransferStatus { get; set; } = "Pending";
        public DateTime TransferDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}