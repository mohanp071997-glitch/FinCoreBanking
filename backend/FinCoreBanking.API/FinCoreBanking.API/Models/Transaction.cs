namespace FinCoreBanking.API.Models
{
    // Represents a bank transaction.
    public class Transaction
    {
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal BalanceAfterTransaction { get; set; }
        public string? Description { get; set; }
        public string TransactionStatus { get; set; } = "Completed";
        public DateTime TransactionDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}