namespace FinCoreBanking.API.Models;

public class LoanType
{
    public int LoanTypeId { get; set; }

    public string LoanTypeName { get; set; } = string.Empty;

    public decimal InterestRate { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }
}