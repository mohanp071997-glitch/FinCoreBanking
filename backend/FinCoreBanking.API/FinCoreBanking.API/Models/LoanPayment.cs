namespace FinCoreBanking.API.Models;

public class LoanPayment
{
    public int LoanPaymentId { get; set; }

    public int LoanId { get; set; }

    public int PaymentNumber { get; set; }

    public DateTime DueDate { get; set; }

    public decimal EMIAmount { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;

    public DateTime? PaidDate { get; set; }

    public decimal? PaidAmount { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }
}