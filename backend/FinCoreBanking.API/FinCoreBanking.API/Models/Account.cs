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
        // Stores the company name for a Salary Account.
        public string? SalaryCompanyName { get; set; }

        // Stores the monthly salary amount.
        public decimal? MonthlySalary { get; set; }

        // Stores the date when the account was converted to Salary Account.
        public DateTime? SalaryConvertedDate { get; set; }
        public DateTime OpenedDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}