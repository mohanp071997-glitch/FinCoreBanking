
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace FinCoreBanking.API.Models;

public class SubmitAccountOpeningRequest
{
    [Required]
    public Guid ApplicationDraftId { get; set; }

    [Required]
    public string PersonalDetails { get; set; } = string.Empty;

    [Required]
    public string AdditionalDetails { get; set; } = string.Empty;

    [Required]
    public IFormFile PanDocument { get; set; } = null!;

    [Required]
    public IFormFile IdentityDocument { get; set; } = null!;

    [Required]
    public IFormFile AddressDocument { get; set; } = null!;

    [Required]
    public IFormFile ApplicantPhoto { get; set; } = null!;
}
