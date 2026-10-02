namespace FinCoreBanking.API.DTOs;

public class ChangeMpinRequest
{
    public string CurrentMpin { get; set; } = string.Empty;
    public string NewMpin { get; set; } = string.Empty;
    public string ConfirmMpin { get; set; } = string.Empty;
}