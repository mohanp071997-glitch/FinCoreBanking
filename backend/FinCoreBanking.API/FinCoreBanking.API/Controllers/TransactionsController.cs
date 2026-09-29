using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinCoreBanking.API.Models;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing transactions.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public TransactionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns transactions for an account.
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetAccountTransactions(int accountId)
        {
            //// Adds a temporary delay for loading indicator testing.
            //await Task.Delay(3000);

            var transactions = await _context.Transactions
                .Where(x => x.AccountId == accountId)
                .OrderByDescending(x => x.TransactionDate)
                .ToListAsync();

            return Ok(transactions);
        }

        // Creates a new transaction.
        [HttpPost]
        public async Task<IActionResult> CreateTransaction(CreateTransactionRequest request)
        {
            // Validates the transaction type.
            if (request.TransactionType != "Credit" &&
                request.TransactionType != "Debit")
            {
                return BadRequest("Transaction type must be Credit or Debit.");
            }

            // Validates the transaction amount.
            if (request.Amount <= 0)
            {
                return BadRequest("Transaction amount must be greater than zero.");
            }

            // Gets the account.
            var account = await _context.Accounts
                .FirstOrDefaultAsync(x =>
                    x.AccountId == request.AccountId &&
                    x.AccountStatus == "Active");

            if (account == null)
            {
                return BadRequest("Active account not found.");
            }

            // Calculates the new balance.
            decimal newBalance;

            if (request.TransactionType == "Credit")
            {
                newBalance = account.CurrentBalance + request.Amount;
            }
            else
            {
                if (account.CurrentBalance < request.Amount)
                {
                    return BadRequest("Insufficient account balance.");
                }

                newBalance = account.CurrentBalance - request.Amount;
            }

            // Creates the transaction.
            var transaction = new Transaction
            {
                AccountId = account.AccountId,
                TransactionReference = $"TXN{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                TransactionType = request.TransactionType,
                Amount = request.Amount,
                BalanceAfterTransaction = newBalance,
                Description = request.Description,
                TransactionStatus = "Completed",
                TransactionDate = DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow
            };

            // Updates the account balance.
            account.CurrentBalance = newBalance;
            account.ModifiedDate = DateTime.UtcNow;

            // Adds the transaction.
            _context.Transactions.Add(transaction);

            // Saves the transaction and balance update.
            await _context.SaveChangesAsync();

            // Returns the created transaction.
            return Ok(transaction);
        }
    }
}