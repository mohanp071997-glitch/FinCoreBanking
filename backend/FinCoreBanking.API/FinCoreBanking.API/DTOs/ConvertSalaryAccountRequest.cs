namespace FinCoreBanking.API.DTOs;

public class ConvertSalaryAccountRequest
{
    public string CompanyName { get; set; } = string.Empty;

    public decimal MonthlySalary { get; set; }

    public bool Confirmation { get; set; }
}