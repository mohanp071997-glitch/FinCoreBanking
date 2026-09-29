namespace FinCoreBanking.API.DTOs
{
    // Represents the data required to create a beneficiary.
    public class CreateBeneficiaryRequest
    {
        public int CustomerId { get; set; }
        public string BeneficiaryName { get; set; } = string.Empty;
        public string BeneficiaryAccountNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
    }
}