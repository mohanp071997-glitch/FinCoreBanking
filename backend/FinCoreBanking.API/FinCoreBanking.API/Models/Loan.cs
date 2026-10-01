using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

public class Loan
{
    public int LoanId { get; set; }

    public int CustomerId { get; set; }

    public int LoanTypeId { get; set; }

    [NotMapped]
    public string LoanTypeName { get; set; } = string.Empty;

    public string LoanNumber { get; set; } = string.Empty;

    public decimal PrincipalAmount { get; set; }

    public decimal OutstandingAmount { get; set; }

    public decimal InterestRate { get; set; }

    public int TenureMonths { get; set; }

    public decimal EMIAmount { get; set; }

    public DateTime? NextPaymentDate { get; set; }

    public string LoanStatus { get; set; } = string.Empty;

    public DateTime AppliedDate { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public DateTime? ClosedDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }
}