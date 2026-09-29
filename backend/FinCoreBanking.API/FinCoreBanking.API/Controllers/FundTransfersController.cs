using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing fund transfers.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FundTransfersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public FundTransfersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Creates a new fund transfer.
        [HttpPost]
        public async Task<IActionResult> CreateFundTransfer(
            CreateFundTransferRequest request)
        {
            // Validates the transfer amount.
            if (request.Amount <= 0)
            {
                return BadRequest("Transfer amount must be greater than zero.");
            }

            // Gets the source account.
            var account = await _context.Accounts
                .FirstOrDefaultAsync(x =>
                    x.AccountId == request.FromAccountId &&
                    x.AccountStatus == "Active");

            if (account == null)
            {
                return BadRequest("Active source account not found.");
            }

            // Gets the approved beneficiary.
            var beneficiary = await _context.Beneficiaries
                .FirstOrDefaultAsync(x =>
                    x.BeneficiaryId == request.BeneficiaryId &&
                    x.BeneficiaryStatus == "Approved");

            if (beneficiary == null)
            {
                return BadRequest("Approved beneficiary not found.");
            }

            // Validates beneficiary ownership.
            if (beneficiary.CustomerId != account.CustomerId)
            {
                return BadRequest("Beneficiary does not belong to the account customer.");
            }

            // Validates the account balance.
            if (account.CurrentBalance < request.Amount)
            {
                return BadRequest("Insufficient account balance.");
            }

            // Starts a database transaction.
            await using var dbTransaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Calculates the new account balance.
                var newBalance = account.CurrentBalance - request.Amount;

                // Creates the fund transfer.
                var fundTransfer = new FundTransfer
                {
                    FromAccountId = account.AccountId,
                    BeneficiaryId = beneficiary.BeneficiaryId,
                    TransferReference = $"TRF-{Guid.NewGuid():N}",
                    Amount = request.Amount,
                    TransferDescription = request.TransferDescription,
                    TransferStatus = "Completed",
                    TransferDate = DateTime.UtcNow,
                    CompletedDate = DateTime.UtcNow,
                    CreatedDate = DateTime.UtcNow
                };

                // Creates the debit transaction.
                var transaction = new Transaction
                {
                    AccountId = account.AccountId,
                    TransactionReference = $"TXN-{Guid.NewGuid():N}",
                    TransactionType = "Debit",
                    Amount = request.Amount,
                    BalanceAfterTransaction = newBalance,
                    Description = request.TransferDescription,
                    TransactionStatus = "Completed",
                    TransactionDate = DateTime.UtcNow,
                    CreatedDate = DateTime.UtcNow
                };

                // Updates the account balance.
                account.CurrentBalance = newBalance;
                account.ModifiedDate = DateTime.UtcNow;

                // Adds the fund transfer.
                _context.FundTransfers.Add(fundTransfer);

                // Adds the debit transaction.
                _context.Transactions.Add(transaction);

                // Saves all changes.
                await _context.SaveChangesAsync();

                // Commits the database transaction.
                await dbTransaction.CommitAsync();

                // Returns the completed transfer.
                return Ok(fundTransfer);
            }
            catch
            {
                // Rolls back the database transaction.
                await dbTransaction.RollbackAsync();

                throw;
            }
        }

        // Returns fund transfers for an account.
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetAccountFundTransfers(int accountId)
        {
            // Gets fund transfers with beneficiary details.
            var transfers = await _context.FundTransfers
                .Where(x => x.FromAccountId == accountId)
                .Join(
                    _context.Beneficiaries,
                    transfer => transfer.BeneficiaryId,
                    beneficiary => beneficiary.BeneficiaryId,
                    (transfer, beneficiary) => new FundTransferResponse
                    {
                        FundTransferId = transfer.FundTransferId,
                        FromAccountId = transfer.FromAccountId,
                        BeneficiaryId = transfer.BeneficiaryId,
                        BeneficiaryName = beneficiary.BeneficiaryName,
                        BeneficiaryAccountNumber =
                            beneficiary.BeneficiaryAccountNumber,
                        TransferReference = transfer.TransferReference,
                        Amount = transfer.Amount,
                        TransferDescription = transfer.TransferDescription,
                        TransferStatus = transfer.TransferStatus,
                        TransferDate = transfer.TransferDate
                    })
                .OrderByDescending(x => x.TransferDate)
                .ToListAsync();

            // Returns the fund transfer history.
            return Ok(transfers);
        }
    }
}