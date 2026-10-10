
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

// FEATURE: Tracks every account application status change.
[Table("ApplicationStatusHistory")]
public class ApplicationStatusHistory
{
    [Key]
    public long ApplicationStatusHistoryId { get; set; }

    public long AccountOpeningApplicationId { get; set; }

    [Required, MaxLength(30)]
    public string PreviousStatus { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string NewStatus { get; set; } = string.Empty;

    public int ChangedByUserId { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; }

    public DateTime ChangedAtUtc { get; set; }
}
