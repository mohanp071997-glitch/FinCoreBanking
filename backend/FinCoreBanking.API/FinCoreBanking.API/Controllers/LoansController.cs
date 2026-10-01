using FinCoreBanking.API.Data;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinCoreBanking.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LoansController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LoansController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Gets loans belonging to the logged-in customer.
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentLoans()
    {
        // Gets the logged-in user ID from the JWT token.
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the customer linked to the logged-in user.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");

        var loans = await (
            from loan in _context.Loans
            join loanType in _context.LoanTypes
                on loan.LoanTypeId equals loanType.LoanTypeId
            where loan.CustomerId == customer.CustomerId
            orderby loan.AppliedDate descending
            select new Loan
            {
                LoanId = loan.LoanId,
                CustomerId = loan.CustomerId,
                LoanTypeId = loan.LoanTypeId,
                LoanTypeName = loanType.LoanTypeName,
                LoanNumber = loan.LoanNumber,
                PrincipalAmount = loan.PrincipalAmount,
                OutstandingAmount = loan.OutstandingAmount,
                InterestRate = loan.InterestRate,
                TenureMonths = loan.TenureMonths,
                EMIAmount = loan.EMIAmount,
                NextPaymentDate = loan.NextPaymentDate,
                LoanStatus = loan.LoanStatus,
                AppliedDate = loan.AppliedDate,
                ApprovedDate = loan.ApprovedDate,
                ClosedDate = loan.ClosedDate,
                CreatedDate = loan.CreatedDate,
                ModifiedDate = loan.ModifiedDate
            }
        ).ToListAsync();

        return Ok(loans);
    }

    // Gets the available loan types.
    [HttpGet("types")]
    public async Task<IActionResult> GetLoanTypes()
    {
        // Gets active loan types.
        var loanTypes = await _context.LoanTypes
            .Where(x => x.IsActive)
            .OrderBy(x => x.LoanTypeName)
            .ToListAsync();

        return Ok(loanTypes);
    }

    // Gets a specific loan belonging to the logged-in customer.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLoanById(int id)
    {
        // Gets the logged-in user ID from the JWT token.
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the customer linked to the logged-in user.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");


        // Gets the requested loan belonging to the customer.
        var loan = await (
            from l in _context.Loans
            join lt in _context.LoanTypes
                on l.LoanTypeId equals lt.LoanTypeId
            where l.LoanId == id &&
                  l.CustomerId == customer.CustomerId
            select new Loan
            {
                LoanId = l.LoanId,
                CustomerId = l.CustomerId,
                LoanTypeId = l.LoanTypeId,
                LoanTypeName = lt.LoanTypeName,
                LoanNumber = l.LoanNumber,
                PrincipalAmount = l.PrincipalAmount,
                OutstandingAmount = l.OutstandingAmount,
                InterestRate = l.InterestRate,
                TenureMonths = l.TenureMonths,
                EMIAmount = l.EMIAmount,
                NextPaymentDate = l.NextPaymentDate,
                LoanStatus = l.LoanStatus,
                AppliedDate = l.AppliedDate,
                ApprovedDate = l.ApprovedDate,
                ClosedDate = l.ClosedDate,
                CreatedDate = l.CreatedDate,
                ModifiedDate = l.ModifiedDate
            }
        ).FirstOrDefaultAsync();

        if (loan == null)
            return NotFound("Loan not found.");

        return Ok(loan);
    }
}