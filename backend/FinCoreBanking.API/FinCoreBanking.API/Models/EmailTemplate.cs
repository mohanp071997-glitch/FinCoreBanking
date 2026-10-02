namespace FinCoreBanking.API.Models;

public class EmailTemplate
{
    public int EmailTemplateId { get; set; }

    public string TemplateName { get; set; } = string.Empty;

    public string EmailSubject { get; set; } = string.Empty;

    public string EmailBody { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }
}