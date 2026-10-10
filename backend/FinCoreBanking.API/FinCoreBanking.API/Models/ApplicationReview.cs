
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

// FEATURE: Stores reviewer verification details for an account opening application.
[Table("ApplicationReviews")]
public class ApplicationReview
{
    [Key]
    public long ApplicationReviewId { get; set; }

    public long AccountOpeningApplicationId { get; set; }

    public int ReviewerUserId { get; set; }

    [Required, MaxLength(30)]
    public string ReviewDecision { get; set; } = "Pending";

    public bool PersonalDetailsVerified { get; set; }

    public bool IdentityDocumentVerified { get; set; }

    public bool AddressDocumentVerified { get; set; }

    public bool ApplicantPhotoVerified { get; set; }

    [MaxLength(1000)]
    public string? Comments { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }
}
