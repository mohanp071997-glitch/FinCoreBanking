namespace FinCoreBanking.API.Models;

public class Card
{
    public int CardId { get; set; }

    public int CustomerId { get; set; }

    public string CardNumber { get; set; } = string.Empty;

    public string CardType { get; set; } = string.Empty;

    public string CardBrand { get; set; } = string.Empty;

    public string CardHolderName { get; set; } = string.Empty;

    public DateTime ExpiryDate { get; set; }

    public string CardStatus { get; set; } = string.Empty;

    public decimal AvailableLimit { get; set; }

    public decimal UsedAmount { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }
}