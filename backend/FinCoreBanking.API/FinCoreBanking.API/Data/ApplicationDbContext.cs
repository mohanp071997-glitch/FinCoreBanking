using FinCoreBanking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FinCoreBanking.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options){}

        // Represents the Users table.
        public DbSet<User> Users { get; set; }

        // Represents the Roles table.
        public DbSet<Role> Roles { get; set; }

        // Represents the UserRoles table.
        public DbSet<UserRole> UserRoles { get; set; }

        // Represents the Customers table.
        public DbSet<Customer> Customers { get; set; }

        // Represents the Accounts table.
        public DbSet<Account> Accounts { get; set; }

        // Represents the AccountTypes table.
        public DbSet<AccountType> AccountTypes { get; set; }

        // Represents the Transactions table.
        public DbSet<Transaction> Transactions { get; set; }

        // Represents the beneficiary records.
        public DbSet<Beneficiary> Beneficiaries { get; set; }

        // Represents the fund transfer records.
        public DbSet<FundTransfer> FundTransfers { get; set; }

        // Configures table relationships and constraints.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configures the Users table.
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(x => x.UserId);

                entity.Property(x => x.UserName)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(x => x.Email)
                      .HasMaxLength(150)
                      .IsRequired();

                entity.HasIndex(x => x.Email)
                      .IsUnique();
            });

            // Configures the Roles table.
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(x => x.RoleId);

                entity.Property(x => x.RoleName)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.HasIndex(x => x.RoleName)
                      .IsUnique();
            });

            // Configures the UserRoles table.
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(x => x.UserRoleId);

                // Configures the relationship between UserRoles and Users.
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId);

                // Configures the relationship between UserRoles and Roles.
                entity.HasOne<Role>()
                      .WithMany()
                      .HasForeignKey(x => x.RoleId);

                // Prevents assigning the same role to the same user twice.
                entity.HasIndex(x => new { x.UserId, x.RoleId })
                      .IsUnique();
            });

            // Configures the Customers table.
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(x => x.CustomerId);

                entity.Property(x => x.CustomerNumber)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.HasIndex(x => x.CustomerNumber)
                      .IsUnique();

                entity.Property(x => x.FirstName)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(x => x.LastName)
                      .HasMaxLength(100);

                entity.Property(x => x.PhoneNumber)
                      .HasMaxLength(20);

                entity.Property(x => x.PostalCode)
                      .HasMaxLength(10);

                // Configures the relationship between Customers and Users.
                entity.HasOne<User>()
                      .WithOne()
                      .HasForeignKey<Customer>(x => x.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Prevents multiple customers for the same user.
                entity.HasIndex(x => x.UserId)
                      .IsUnique();
            });

            // Configures the Accounts table.
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(x => x.AccountId);

                entity.Property(x => x.AccountNumber)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.HasIndex(x => x.AccountNumber)
                      .IsUnique();

                entity.Property(x => x.IFSCCode)
                      .HasMaxLength(20);

                entity.Property(x => x.CurrentBalance)
                      .HasPrecision(18, 2);

                entity.Property(x => x.AccountStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                // Configures the relationship between Accounts and Customers.
                entity.HasOne<Customer>()
                      .WithOne()
                      .HasForeignKey<Account>(x => x.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Prevents multiple accounts for the same customer.
                entity.HasIndex(x => x.CustomerId)
                      .IsUnique();
            });

            // Configures the AccountTypes table.
            modelBuilder.Entity<AccountType>(entity =>
            {
                entity.HasKey(x => x.AccountTypeId);

                entity.Property(x => x.AccountTypeName)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.HasIndex(x => x.AccountTypeName)
                      .IsUnique();

                entity.Property(x => x.Description)
                      .HasMaxLength(250);
            });

            // Configures the Transactions table.
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(x => x.TransactionId);

                entity.Property(x => x.TransactionReference)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.HasIndex(x => x.TransactionReference)
                      .IsUnique();

                entity.Property(x => x.TransactionType)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(x => x.Amount)
                      .HasPrecision(18, 2);

                entity.Property(x => x.BalanceAfterTransaction)
                      .HasPrecision(18, 2);

                entity.Property(x => x.Description)
                      .HasMaxLength(250);

                entity.Property(x => x.TransactionStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                // Configures the relationship between Transactions and Accounts.
                entity.HasOne<Account>()
                      .WithMany()
                      .HasForeignKey(x => x.AccountId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configures the beneficiary entity.
            modelBuilder.Entity<Beneficiary>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.BeneficiaryId);

                // Configures the beneficiary name.
                entity.Property(x => x.BeneficiaryName)
                    .HasMaxLength(150)
                    .IsRequired();

                // Configures the beneficiary account number.
                entity.Property(x => x.BeneficiaryAccountNumber)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the bank name.
                entity.Property(x => x.BankName)
                    .HasMaxLength(150)
                    .IsRequired();

                // Configures the IFSC code.
                entity.Property(x => x.IFSCCode)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the beneficiary status.
                entity.Property(x => x.BeneficiaryStatus)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the customer relationship.
                entity.HasOne<Customer>()
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configures the fund transfer entity.
            modelBuilder.Entity<FundTransfer>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.FundTransferId);

                // Configures the transfer reference.
                entity.Property(x => x.TransferReference)
                    .HasMaxLength(50)
                    .IsRequired();

                // Configures the unique transfer reference.
                entity.HasIndex(x => x.TransferReference)
                    .IsUnique();

                // Configures the transfer amount.
                entity.Property(x => x.Amount)
                    .HasPrecision(18, 2);

                // Configures the transfer description.
                entity.Property(x => x.TransferDescription)
                    .HasMaxLength(250);

                // Configures the transfer status.
                entity.Property(x => x.TransferStatus)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the source account relationship.
                entity.HasOne<Account>()
                    .WithMany()
                    .HasForeignKey(x => x.FromAccountId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Configures the beneficiary relationship.
                entity.HasOne<Beneficiary>()
                    .WithMany()
                    .HasForeignKey(x => x.BeneficiaryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}