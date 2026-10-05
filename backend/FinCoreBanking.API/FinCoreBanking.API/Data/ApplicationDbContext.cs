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

        // Represents the Cards table.
        public DbSet<Card> Cards { get; set; }

        // Represents the fund transfer records.
        public DbSet<FundTransfer> FundTransfers { get; set; }

        // Represents the available loan types.
        public DbSet<LoanType> LoanTypes { get; set; }

        // Represents customer loans.
        public DbSet<Loan> Loans { get; set; }

        public DbSet<LoanPayment> LoanPayments { get; set; }

        // Stores two-factor authentication OTP records.
        public DbSet<TwoFactorOtp> TwoFactorOtps { get; set; }

        // Stores user notification settings.
        public DbSet<UserNotificationSetting> UserNotificationSettings { get; set; }

        // Stores user notifications.
        public DbSet<Notification> Notifications { get; set; }

        // Stores email templates used for security and notification emails.
        public DbSet<EmailTemplate> EmailTemplates { get; set; }

        // Stores mobile login OTP records.
        public DbSet<MobileLoginOtp> MobileLoginOtps { get; set; }

        // Stores password reset OTP records.
        public DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }

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

            // Configures the Cards table.
            modelBuilder.Entity<Card>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.CardId);

                // Configures the card number.
                entity.Property(x => x.CardNumber)
                    .HasMaxLength(20)
                    .IsRequired();

                // Prevents duplicate card numbers.
                entity.HasIndex(x => x.CardNumber)
                    .IsUnique();

                // Configures the card type.
                entity.Property(x => x.CardType)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the card brand.
                entity.Property(x => x.CardBrand)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the card holder name.
                entity.Property(x => x.CardHolderName)
                    .HasMaxLength(100)
                    .IsRequired();

                // Configures the card status.
                entity.Property(x => x.CardStatus)
                    .HasMaxLength(20)
                    .IsRequired();

                // Configures the available limit.
                entity.Property(x => x.AvailableLimit)
                    .HasPrecision(18, 2);

                // Configures the used amount.
                entity.Property(x => x.UsedAmount)
                    .HasPrecision(18, 2);

                // Configures the relationship between Cards and Customers.
                entity.HasOne<Customer>()
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configures the LoanTypes table.
            modelBuilder.Entity<LoanType>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.LoanTypeId);

                // Configures the loan type name.
                entity.Property(x => x.LoanTypeName)
                    .HasMaxLength(50)
                    .IsRequired();

                // Configures the interest rate.
                entity.Property(x => x.InterestRate)
                    .HasPrecision(5, 2);

                // Prevents duplicate loan type names.
                entity.HasIndex(x => x.LoanTypeName)
                    .IsUnique();
            });

            // Configures the Loans table.
            modelBuilder.Entity<Loan>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.LoanId);

                // Configures the loan number.
                entity.Property(x => x.LoanNumber)
                    .HasMaxLength(30)
                    .IsRequired();

                // Prevents duplicate loan numbers.
                entity.HasIndex(x => x.LoanNumber)
                    .IsUnique();

                // Configures the principal amount.
                entity.Property(x => x.PrincipalAmount)
                    .HasPrecision(18, 2);

                // Configures the outstanding amount.
                entity.Property(x => x.OutstandingAmount)
                    .HasPrecision(18, 2);

                // Configures the interest rate.
                entity.Property(x => x.InterestRate)
                    .HasPrecision(5, 2);

                // Configures the EMI amount.
                entity.Property(x => x.EMIAmount)
                    .HasPrecision(18, 2);

                // Configures the loan status.
                entity.Property(x => x.LoanStatus)
                    .HasMaxLength(30)
                    .IsRequired();

                // Configures the customer relationship.
                entity.HasOne<Customer>()
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Configures the loan type relationship.
                entity.HasOne<LoanType>()
                    .WithMany()
                    .HasForeignKey(x => x.LoanTypeId)
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

            // Configures the two-factor authentication OTP entity.
            modelBuilder.Entity<TwoFactorOtp>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.TwoFactorOtpId);

                // Configures the OTP code.
                entity.Property(x => x.OtpCode)
                      .HasMaxLength(6)
                      .IsRequired();

                // Configures the OTP expiry date.
                entity.Property(x => x.ExpiresAt)
                      .IsRequired();

                // Configures whether the OTP has been used.
                entity.Property(x => x.IsUsed)
                      .IsRequired();

                // Configures the created date.
                entity.Property(x => x.CreatedDate)
                      .IsRequired();

                // Configures the relationship between OTPs and Users.
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });



            // Configures the LoanPayments table.
            modelBuilder.Entity<LoanPayment>(entity =>
            {
                entity.HasKey(x => x.LoanPaymentId);

                entity.Property(x => x.EMIAmount)
                      .HasPrecision(18, 2);

                entity.Property(x => x.PaymentStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(x => x.PaidAmount)
                      .HasPrecision(18, 2);

                entity.HasOne<Loan>()
                      .WithMany()
                      .HasForeignKey(x => x.LoanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configures the user notification settings entity.
            modelBuilder.Entity<UserNotificationSetting>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.NotificationSettingId);

                // Configures the user ID.
                entity.Property(x => x.UserId)
                      .IsRequired();

                // Configures transaction alerts.
                entity.Property(x => x.TransactionAlerts)
                      .IsRequired();

                // Configures login alerts.
                entity.Property(x => x.LoginAlerts)
                      .IsRequired();

                // Configures promotional notifications.
                entity.Property(x => x.PromotionalNotifications)
                      .IsRequired();

                // Configures the created date.
                entity.Property(x => x.CreatedDate)
                      .IsRequired();

                // Configures the relationship with Users.
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Ensures one notification setting per user.
                entity.HasIndex(x => x.UserId)
                      .IsUnique();
            });

            // Configures the notification entity.
            modelBuilder.Entity<Notification>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.NotificationId);

                // Configures the title.
                entity.Property(x => x.Title)
                      .HasMaxLength(200)
                      .IsRequired();

                // Configures the message.
                entity.Property(x => x.Message)
                      .HasMaxLength(500)
                      .IsRequired();

                // Configures the notification type.
                entity.Property(x => x.NotificationType)
                      .HasMaxLength(50)
                      .IsRequired();

                // Configures the read status.
                entity.Property(x => x.IsRead)
                      .IsRequired();

                // Configures the created date.
                entity.Property(x => x.CreatedDate)
                      .IsRequired();

                // Configures the relationship between notifications and users.
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configures the EmailTemplates table.
            modelBuilder.Entity<EmailTemplate>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.EmailTemplateId);

                // Configures the template name.
                entity.Property(x => x.TemplateName)
                      .HasMaxLength(100)
                      .IsRequired();

                // Configures the email subject.
                entity.Property(x => x.EmailSubject)
                      .HasMaxLength(200)
                      .IsRequired();

                // Configures the email body.
                entity.Property(x => x.EmailBody)
                      .IsRequired();

                // Configures the active status.
                entity.Property(x => x.IsActive)
                      .IsRequired();

                // Configures the created date.
                entity.Property(x => x.CreatedDate)
                      .IsRequired();
            });

            // Configures the mobile login OTP entity.
            modelBuilder.Entity<MobileLoginOtp>(entity =>
            {
                // Configures the primary key.
                entity.HasKey(x => x.OtpId);

                // Configures the user ID.
                entity.Property(x => x.UserId)
                      .IsRequired();

                // Configures the mobile number.
                entity.Property(x => x.MobileNumber)
                      .HasMaxLength(15)
                      .IsRequired();

                // Configures the six-digit OTP.
                entity.Property(x => x.OtpCode)
                      .HasMaxLength(6)
                      .IsRequired();

                // Configures the OTP expiry date.
                entity.Property(x => x.ExpiresAt)
                      .IsRequired();

                // Configures whether the OTP has been used.
                entity.Property(x => x.IsUsed)
                      .IsRequired();

                // Configures the created date.
                entity.Property(x => x.CreatedDate)
                      .IsRequired();

                // Configures the used date.
                entity.Property(x => x.UsedDate);

                // Configures the relationship between OTPs and Users.
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configures the password reset OTP entity.
            modelBuilder.Entity<PasswordResetOtp>(entity =>
            {
                entity.HasKey(x => x.PasswordResetOtpId);

                entity.Property(x => x.UserId)
                    .IsRequired();

                entity.Property(x => x.Email)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.OtpCode)
                    .HasMaxLength(6)
                    .IsRequired();

                entity.Property(x => x.ExpiresAt)
                    .IsRequired();

                entity.Property(x => x.IsUsed)
                    .IsRequired();

                entity.Property(x => x.CreatedDate)
                    .IsRequired();

                entity.Property(x => x.UsedDate);

                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}