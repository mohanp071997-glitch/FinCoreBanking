
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinCoreBanking.API.Models;

[Table("RequestTrackingOtps")]
public class RequestTrackingOtp
{
    [Key]
    public long RequestTrackingOtpId { get; set; }

    [Required]
    [StringLength(12, MinimumLength = 12)]
    public string RequestId { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(64)]
    public string OtpHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public int FailedAttempts { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? VerifiedAt { get; set; }
}
