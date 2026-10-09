
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

[Table("AccountOpeningApplications")]
public class AccountOpeningApplication
{
    [Key]
    public long AccountOpeningApplicationId { get; set; }

    public Guid ApplicationDraftId { get; set; }

    [Required]
    [StringLength(12, MinimumLength = 12)]
    [RegularExpression(@"^[0-9]{12}$")]
    public string ApplicationRequestId { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string ApplicationData { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending Approval";

    public DateTime SubmittedAt { get; set; }
}
