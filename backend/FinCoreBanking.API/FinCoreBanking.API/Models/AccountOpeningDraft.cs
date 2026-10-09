
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

[Table("AccountOpeningDrafts")]
public class AccountOpeningDraft
{
    [Key]
    public Guid ApplicationDraftId { get; set; }

    [MaxLength(256)]
    public string? Email { get; set; }

    public string? DraftData { get; set; }

    public bool EmailVerified { get; set; }

    public bool IsSubmitted { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
