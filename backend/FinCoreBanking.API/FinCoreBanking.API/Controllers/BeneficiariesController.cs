using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing beneficiaries.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BeneficiariesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public BeneficiariesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns beneficiaries for a customer.
        [Authorize(Roles = "Customer")]
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerBeneficiaries(int customerId)
        {
            var beneficiaries = await _context.Beneficiaries
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return Ok(beneficiaries);
        }

        // Creates a new beneficiary.
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> CreateBeneficiary(
            CreateBeneficiaryRequest request)
        {
            // Validates the customer.
            var customer = await _context.Customers
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == request.CustomerId &&
                    x.IsActive);

            if (customer == null)
            {
                return BadRequest("Active customer not found.");
            }

            // Checks for an existing beneficiary.
            var existingBeneficiary = await _context.Beneficiaries
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == request.CustomerId &&
                    x.BeneficiaryAccountNumber ==
                    request.BeneficiaryAccountNumber);

            if (existingBeneficiary != null)
            {
                return BadRequest("Beneficiary already exists.");
            }

            // Creates the beneficiary.
            var beneficiary = new Beneficiary
            {
                CustomerId = request.CustomerId,
                BeneficiaryName = request.BeneficiaryName,
                BeneficiaryAccountNumber =
                    request.BeneficiaryAccountNumber,
                BankName = request.BankName,
                IFSCCode = request.IFSCCode,
                BeneficiaryStatus = "Pending",
                CreatedDate = DateTime.UtcNow
            };

            // Adds the beneficiary.
            _context.Beneficiaries.Add(beneficiary);

            // Saves the beneficiary.
            await _context.SaveChangesAsync();

            // Returns the created beneficiary.
            return Ok(beneficiary);
        }

        // Approves a beneficiary.
        [Authorize(Roles = "BankStaff,Admin")]
        [HttpPut("{beneficiaryId}/approve")]
        public async Task<IActionResult> ApproveBeneficiary(int beneficiaryId)
        {
            // Gets the beneficiary.
            var beneficiary = await _context.Beneficiaries
                .FirstOrDefaultAsync(x => x.BeneficiaryId == beneficiaryId);

            if (beneficiary == null)
            {
                return NotFound("Beneficiary not found.");
            }

            // Checks the current beneficiary status.
            if (beneficiary.BeneficiaryStatus != "Pending")
            {
                return BadRequest("Only pending beneficiaries can be approved.");
            }

            // Approves the beneficiary.
            beneficiary.BeneficiaryStatus = "Approved";
            beneficiary.ModifiedDate = DateTime.UtcNow;

            // Saves the beneficiary status.
            await _context.SaveChangesAsync();

            // Returns the updated beneficiary.
            return Ok(beneficiary);
        }

        // Rejects a beneficiary.
        [Authorize(Roles = "BankStaff,Admin")]
        [HttpPut("{beneficiaryId}/reject")]
        public async Task<IActionResult> RejectBeneficiary(int beneficiaryId)
        {
            // Gets the beneficiary.
            var beneficiary = await _context.Beneficiaries
                .FirstOrDefaultAsync(x => x.BeneficiaryId == beneficiaryId);

            if (beneficiary == null)
            {
                return NotFound("Beneficiary not found.");
            }

            // Checks the current beneficiary status.
            if (beneficiary.BeneficiaryStatus != "Pending")
            {
                return BadRequest("Only pending beneficiaries can be rejected.");
            }

            // Rejects the beneficiary.
            beneficiary.BeneficiaryStatus = "Rejected";
            beneficiary.ModifiedDate = DateTime.UtcNow;

            // Saves the beneficiary status.
            await _context.SaveChangesAsync();

            // Returns the updated beneficiary.
            return Ok(beneficiary);
        }


    }
}