namespace FinCoreBanking.API.DTOs
{
    // Represents the data required to create a transaction.
    public class CreateTransactionRequest
    {
        public int AccountId { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }
}