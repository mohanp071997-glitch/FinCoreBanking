namespace FinCoreBanking.API.DTOs
{
    // Represents account details for display.
    public class AccountResponse
    {
        public int AccountId { get; set; }
        public int CustomerId { get; set; }
        public int AccountTypeId { get; set; }
        public string AccountTypeName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public string AccountStatus { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        // Stores the company name for a Salary Account.
        public string? SalaryCompanyName { get; set; }

        // Stores the monthly salary amount.
        public decimal? MonthlySalary { get; set; }

        // Stores the date when the account was converted to Salary Account.
        public DateTime? SalaryConvertedDate { get; set; }
    }
}