namespace FinCoreBanking.API.DTOs
{
    // Represents the data required to create a fund transfer.
    public class CreateFundTransferRequest
    {
        public int FromAccountId { get; set; }
        public int BeneficiaryId { get; set; }
        public decimal Amount { get; set; }
        public string? TransferDescription { get; set; }
    }
}