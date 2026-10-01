using System.Security.Claims;
using FinCoreBanking.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LoanPaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LoanPaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Gets payment schedule for the logged-in customer's loan.
    [HttpGet("loan/{loanId}")]
    public async Task<IActionResult> GetLoanPayments(int loanId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the logged-in customer.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x => x.UserId == userId && x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");

        // Verifies that the loan belongs to the logged-in customer.
        var loanExists = await _context.Loans
            .AnyAsync(x =>
                x.LoanId == loanId &&
                x.CustomerId == customer.CustomerId);

        if (!loanExists)
            return NotFound("Loan not found.");

        // Gets the loan payment schedule.
        var payments = await _context.LoanPayments
            .Where(x => x.LoanId == loanId)
            .OrderBy(x => x.PaymentNumber)
            .ToListAsync();

        return Ok(payments);
    }

    // Pays a loan EMI for the logged-in customer.
    [HttpPost("{paymentId}/pay")]
    public async Task<IActionResult> PayLoanPayment(int paymentId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Gets the logged-in customer.
        var customer = await _context.Customers
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

        if (customer == null)
            return NotFound("Customer not found.");

        // Gets the payment record.
        var payment = await _context.LoanPayments
            .FirstOrDefaultAsync(x =>
                x.LoanPaymentId == paymentId);

        if (payment == null)
            return NotFound("Payment not found.");

        // Verifies that the payment belongs to the logged-in customer.
        var loan = await _context.Loans
            .FirstOrDefaultAsync(x =>
                x.LoanId == payment.LoanId &&
                x.CustomerId == customer.CustomerId);

        if (loan == null)
            return NotFound("Loan not found.");

        // Prevents duplicate payment.
        if (payment.PaymentStatus == "Paid")
            return BadRequest("This payment has already been paid.");

        // Updates the payment record.
        payment.PaymentStatus = "Paid";
        payment.PaidDate = DateTime.UtcNow.Date;
        payment.PaidAmount = payment.EMIAmount;
        payment.ModifiedDate = DateTime.UtcNow;

        // Updates the loan outstanding amount.
        loan.OutstandingAmount -= payment.PaidAmount.Value;
        loan.ModifiedDate = DateTime.UtcNow;

        // Prevents negative outstanding amount.
        if (loan.OutstandingAmount < 0)
            loan.OutstandingAmount = 0;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Loan payment completed successfully.",
            paymentId = payment.LoanPaymentId,
            paidAmount = payment.PaidAmount,
            outstandingAmount = loan.OutstandingAmount
        });
    }
}