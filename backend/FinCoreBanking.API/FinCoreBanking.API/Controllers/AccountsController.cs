using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing bank accounts.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public AccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns all active accounts.
        [HttpGet]
        public async Task<IActionResult> GetAccounts()
        {
            var accounts = await _context.Accounts
                .Where(x => x.AccountStatus == "Active")
                .ToListAsync();

            return Ok(accounts);
        }

        // Creates a new bank account.
        [HttpPost]
        public async Task<IActionResult> CreateAccount(CreateAccountRequest request)
        {
            // Checks whether the customer exists.
            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.CustomerId == request.CustomerId && x.IsActive);

            if (customer == null)
            {
                return BadRequest("Active customer not found.");
            }

            // Checks whether the customer already has an account.
            var existingAccount = await _context.Accounts
                .FirstOrDefaultAsync(x => x.CustomerId == request.CustomerId);

            if (existingAccount != null)
            {
                return BadRequest("Account already exists for this customer.");
            }

            // Checks whether the account type exists.
            var accountType = await _context.AccountTypes
                .FirstOrDefaultAsync(x =>
                    x.AccountTypeId == request.AccountTypeId && x.IsActive);

            if (accountType == null)
            {
                return BadRequest("Active account type not found.");
            }

            // Checks whether the account number already exists.
            var existingAccountNumber = await _context.Accounts
                .FirstOrDefaultAsync(x => x.AccountNumber == request.AccountNumber);

            if (existingAccountNumber != null)
            {
                return BadRequest("Account number already exists.");
            }

            // Validates the opening balance.
            if (request.OpeningBalance < 0)
            {
                return BadRequest("Opening balance cannot be negative.");
            }

            // Creates a new account.
            var account = new Account
            {
                CustomerId = request.CustomerId,
                AccountTypeId = request.AccountTypeId,
                AccountNumber = request.AccountNumber,
                IFSCCode = request.IFSCCode,
                CurrentBalance = request.OpeningBalance,
                AccountStatus = "Active",
                OpenedDate = DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow
            };

            // Adds the account to the database.
            _context.Accounts.Add(account);

            // Saves the account.
            await _context.SaveChangesAsync();

            // Returns the created account.
            return Ok(account);
        }

        // Gets the active accounts for the logged-in customer.
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentAccounts()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.UserId == userId && x.IsActive);

            if (customer == null)
            {
                return NotFound("Customer not found.");
            }

            var accounts = await _context.Accounts
                .Where(x => x.CustomerId == customer.CustomerId &&
                            x.AccountStatus == "Active")
                .Join(
                    _context.AccountTypes,
                    account => account.AccountTypeId,
                    accountType => accountType.AccountTypeId,
                    (account, accountType) => new AccountResponse
                    {
                        AccountId = account.AccountId,
                        CustomerId = account.CustomerId,
                        AccountTypeId = account.AccountTypeId,
                        AccountTypeName = accountType.AccountTypeName,
                        AccountNumber = account.AccountNumber,
                        IFSCCode = account.IFSCCode,
                        CurrentBalance = account.CurrentBalance,
                        AccountStatus = account.AccountStatus,
                        CreatedDate = account.CreatedDate,
                        ModifiedDate = account.ModifiedDate,

                        SalaryCompanyName = account.SalaryCompanyName,
                        MonthlySalary = account.MonthlySalary,
                        SalaryConvertedDate = account.SalaryConvertedDate
                    })
                .ToListAsync();

            return Ok(accounts);
        }

        [HttpPut("{id}/convert-to-salary")]
        public async Task<IActionResult> ConvertToSalaryAccount(
            int id,
            [FromBody] ConvertSalaryAccountRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var customer = await _context.Customers
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.IsActive);

            if (customer == null)
                return NotFound("Customer not found.");

            var account = await _context.Accounts
                .FirstOrDefaultAsync(x =>
                    x.AccountId == id &&
                    x.CustomerId == customer.CustomerId &&
                    x.AccountStatus == "Active");

            if (account == null)
                return NotFound("Account not found.");

            var salaryAccountType = await _context.AccountTypes
                .FirstOrDefaultAsync(x =>
                    x.AccountTypeName == "Salary" &&
                    x.IsActive);

            if (salaryAccountType == null)
                return BadRequest("Salary account type is not configured.");

            if (account.AccountTypeId == salaryAccountType.AccountTypeId)
                return BadRequest("Account is already a Salary Account.");

            if (string.IsNullOrWhiteSpace(request.CompanyName))
                return BadRequest("Company name is required.");

            if (request.MonthlySalary <= 0)
                return BadRequest("Monthly salary must be greater than zero.");

            if (!request.Confirmation)
                return BadRequest("Please confirm the Salary Account declaration.");

            account.AccountTypeId = salaryAccountType.AccountTypeId;
            account.SalaryCompanyName = request.CompanyName.Trim();
            account.MonthlySalary = request.MonthlySalary;
            account.SalaryConvertedDate = DateTime.UtcNow;
            account.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Account converted to Salary Account successfully.",
                accountId = account.AccountId,
                accountTypeId = account.AccountTypeId,
                accountTypeName = "Salary"
            });
        }
    }
}