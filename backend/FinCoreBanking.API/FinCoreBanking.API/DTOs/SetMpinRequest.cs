namespace FinCoreBanking.API.DTOs;

public class SetMpinRequest
{
    public string NewMpin { get; set; } = string.Empty;

    public string ConfirmMpin { get; set; } = string.Empty;
}