namespace FinCoreBanking.API.Models
{
    // Represents a beneficiary added by a customer.
    public class Beneficiary
    {
        public int BeneficiaryId { get; set; }
        public int CustomerId { get; set; }
        public string BeneficiaryName { get; set; } = string.Empty;
        public string BeneficiaryAccountNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string BeneficiaryStatus { get; set; } = "Pending";
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}