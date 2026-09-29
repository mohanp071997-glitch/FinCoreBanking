namespace FinCoreBanking.API.DTOs
{
    // Represents fund transfer details for display.
    public class FundTransferResponse
    {
        public int FundTransferId { get; set; }
        public int FromAccountId { get; set; }
        public int BeneficiaryId { get; set; }
        public string BeneficiaryName { get; set; } = string.Empty;
        public string BeneficiaryAccountNumber { get; set; } = string.Empty;
        public string TransferReference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TransferDescription { get; set; }
        public string TransferStatus { get; set; } = string.Empty;
        public DateTime TransferDate { get; set; }
    }
}