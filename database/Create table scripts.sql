
--CREATE DATABASE
CREATE DATABASE FinCoreBankingDB;

--CHECK DATABASE
SELECT DB_NAME() AS CurrentDatabase;

-- =========================================================
-- Authentication & Authorization Tables
-- =========================================================

-- Users:
-- Stores login and basic user information.

CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL
);
GO

-- Roles:
-- Stores application roles such as Customer, BankStaff and Admin.

CREATE TABLE Roles
(
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- UserRoles:
-- Maps users to their assigned roles.
-- A user can have one or multiple roles.

CREATE TABLE UserRoles
(
    UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,

    CONSTRAINT FK_UserRoles_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId),

    CONSTRAINT FK_UserRoles_Roles
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),

    CONSTRAINT UQ_UserRoles
        UNIQUE (UserId, RoleId)
);
GO


INSERT INTO Roles (RoleName)
VALUES
('Customer'),
('BankStaff'),
('Admin');
GO


SELECT * FROM Roles;



-- =========================================================
-- Customer Management
-- =========================================================

-- Customers:
-- Stores basic information of bank customers.
-- Each customer is linked to an application user.
CREATE TABLE Customers
(
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    CustomerNumber VARCHAR(20) NOT NULL UNIQUE,

    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NULL,

    DateOfBirth DATE NULL,

    PhoneNumber VARCHAR(20) NULL,
    AddressLine1 NVARCHAR(200) NULL,
    AddressLine2 NVARCHAR(200) NULL,
    City NVARCHAR(100) NULL,
    State NVARCHAR(100) NULL,
    PostalCode VARCHAR(10) NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME2 NULL,

    CONSTRAINT FK_Customers_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId),

    CONSTRAINT UQ_Customers_UserId
        UNIQUE (UserId)
);
GO


-- =========================================================
-- Account Management
-- =========================================================

-- AccountTypes:
-- Stores the different types of bank accounts supported
-- by the application.
CREATE TABLE AccountTypes
(
    AccountTypeId INT IDENTITY(1,1) PRIMARY KEY,

    AccountTypeName VARCHAR(50) NOT NULL UNIQUE,

    Description NVARCHAR(250) NULL,

    IsActive BIT NOT NULL DEFAULT 1
);
GO



-- Accounts:
-- Stores bank account information for customers.
-- A customer can have multiple accounts.
CREATE TABLE Accounts
(
    AccountId INT IDENTITY(1,1) PRIMARY KEY,

    CustomerId INT NOT NULL UNIQUE,

    AccountTypeId INT NOT NULL,

    AccountNumber VARCHAR(20) NOT NULL UNIQUE,

    IFSCCode VARCHAR(20) NULL,

    CurrentBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00,

    AccountStatus VARCHAR(20) NOT NULL DEFAULT 'Active',

    OpenedDate DATETIME2 NOT NULL DEFAULT GETDATE(),

    ClosedDate DATETIME2 NULL,

    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME2 NULL,

    CONSTRAINT FK_Accounts_Customers
        FOREIGN KEY (CustomerId)
        REFERENCES Customers(CustomerId),

    CONSTRAINT FK_Accounts_AccountTypes
        FOREIGN KEY (AccountTypeId)
        REFERENCES AccountTypes(AccountTypeId),

    CONSTRAINT CK_Accounts_CurrentBalance
        CHECK (CurrentBalance >= 0),

    CONSTRAINT CK_Accounts_AccountStatus
        CHECK (AccountStatus IN
        (
            'Active',
            'Blocked',
            'Closed'
        ))
);
GO




-- =========================================================
-- Transaction Management
-- =========================================================

-- Transactions:
-- Stores all financial transactions performed on an account.
-- Example:
--   Credit  : Money received
--   Debit   : Money spent/transferred
--
-- One Account can have many Transactions.
CREATE TABLE Transactions
(
    TransactionId INT IDENTITY(1,1) PRIMARY KEY,

    AccountId INT NOT NULL,

    -- Unique reference number for identifying a transaction.
    TransactionReference VARCHAR(50) NOT NULL UNIQUE,

    -- Credit = Money added to account
    -- Debit  = Money deducted from account
    TransactionType VARCHAR(20) NOT NULL,

    -- Transaction amount.
    Amount DECIMAL(18,2) NOT NULL,

    -- Balance available immediately after this transaction.
    BalanceAfterTransaction DECIMAL(18,2) NOT NULL,

    -- Short description of the transaction.
    Description NVARCHAR(250) NULL,

    -- Current state of the transaction.
    -- Pending / Completed / Failed / Reversed
    TransactionStatus VARCHAR(20) NOT NULL DEFAULT 'Completed',

    -- Date and time when transaction occurred.
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),

    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Transactions_Accounts
        FOREIGN KEY (AccountId)
        REFERENCES Accounts(AccountId),

    CONSTRAINT CK_Transactions_TransactionType
        CHECK (TransactionType IN ('Credit', 'Debit')),

    CONSTRAINT CK_Transactions_Amount
        CHECK (Amount > 0),

    CONSTRAINT CK_Transactions_Balance
        CHECK (BalanceAfterTransaction >= 0),

    CONSTRAINT CK_Transactions_Status
        CHECK (
            TransactionStatus IN
            ('Pending', 'Completed', 'Failed', 'Reversed')
        )
);
GO




-- =========================================================
-- Beneficiary Management
-- =========================================================

-- Beneficiaries:
-- Stores the bank accounts added by a customer
-- as recipients for future fund transfers.
--
-- Example:
-- Customer Mohan adds Ravi's account as a beneficiary.
--
-- One Customer can have many Beneficiaries.
CREATE TABLE Beneficiaries
(
    BeneficiaryId INT IDENTITY(1,1) PRIMARY KEY,

    -- Customer who added this beneficiary.
    CustomerId INT NOT NULL,

    -- Name given/displayed for the beneficiary.
    BeneficiaryName NVARCHAR(150) NOT NULL,

    -- Beneficiary's bank account number.
    BeneficiaryAccountNumber VARCHAR(20) NOT NULL,

    -- Beneficiary bank name.
    BankName NVARCHAR(150) NOT NULL,

    -- Beneficiary bank IFSC code.
    IFSCCode VARCHAR(20) NOT NULL,

    -- Approval status of the beneficiary.
    -- Pending   = Waiting for approval
    -- Approved  = Can be used for transfer
    -- Rejected  = Beneficiary was rejected
    -- Blocked   = Temporarily blocked
    BeneficiaryStatus VARCHAR(20) NOT NULL DEFAULT 'Pending',

    -- Date and time when beneficiary was added.
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Date and time when beneficiary was last modified.
    ModifiedDate DATETIME NULL,

    CONSTRAINT FK_Beneficiaries_Customers
        FOREIGN KEY (CustomerId)
        REFERENCES Customers(CustomerId),

    CONSTRAINT CK_Beneficiaries_Status
        CHECK (
            BeneficiaryStatus IN
            ('Pending', 'Approved', 'Rejected', 'Blocked')
        )
);
GO



-- =========================================================
-- Fund Transfer Management
-- =========================================================

-- FundTransfers:
-- Stores fund transfer requests initiated by customers.
--
-- Example:
-- Mohan transfers ₹5,000
-- from his account
-- to Ravi's beneficiary account.
--
-- One Account can have many FundTransfers.
-- One Beneficiary can receive many FundTransfers.
CREATE TABLE FundTransfers
(
    FundTransferId INT IDENTITY(1,1) PRIMARY KEY,

    -- Account from which money is transferred.
    FromAccountId INT NOT NULL,

    -- Beneficiary to whom money is transferred.
    BeneficiaryId INT NOT NULL,

    -- Unique reference number for this transfer.
    TransferReference VARCHAR(50) NOT NULL UNIQUE,

    -- Amount being transferred.
    Amount DECIMAL(18,2) NOT NULL,

    -- Optional message entered by the customer.
    TransferDescription NVARCHAR(250) NULL,

    -- Current state of the transfer.
    -- Pending   = Transfer initiated
    -- Processing = Transfer is being processed
    -- Completed = Transfer successful
    -- Failed    = Transfer failed
    -- Reversed  = Transfer was reversed
    TransferStatus VARCHAR(20) NOT NULL DEFAULT 'Pending',

    -- Date and time when transfer was initiated.
    TransferDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Date and time when transfer was completed.
    CompletedDate DATETIME NULL,

    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),

    ModifiedDate DATETIME NULL,

    CONSTRAINT FK_FundTransfers_FromAccount
        FOREIGN KEY (FromAccountId)
        REFERENCES Accounts(AccountId),

    CONSTRAINT FK_FundTransfers_Beneficiary
        FOREIGN KEY (BeneficiaryId)
        REFERENCES Beneficiaries(BeneficiaryId),

    CONSTRAINT CK_FundTransfers_Amount
        CHECK (Amount > 0),

    CONSTRAINT CK_FundTransfers_Status
        CHECK
        (
            TransferStatus IN
            (
                'Pending',
                'Processing',
                'Completed',
                'Failed',
                'Reversed'
            )
        )
);
GO




-- =========================================================
-- Audit Log Management
-- =========================================================

-- AuditLogs:
-- Stores important actions performed by users in the system.
--
-- Examples:
-- Customer updated profile
-- Beneficiary approved
-- Account blocked
-- Fund transfer processed
-- Customer account status changed
CREATE TABLE AuditLogs
(
    AuditLogId INT IDENTITY(1,1) PRIMARY KEY,

    -- User who performed the action.
    UserId INT NOT NULL,

    -- Name of the action performed.
    -- Example: CreateBeneficiary, ApproveBeneficiary,
    --          UpdateCustomer, BlockAccount
    ActionName VARCHAR(100) NOT NULL,

    -- Type of entity affected by the action.
    -- Example: Customer, Account, Beneficiary, FundTransfer
    EntityName VARCHAR(100) NULL,

    -- ID of the affected record.
    EntityId VARCHAR(100) NULL,

    -- Additional information about the action.
    Description NVARCHAR(500) NULL,

    -- IP address from which the action was performed.
    IPAddress VARCHAR(50) NULL,

    -- Browser/device information.
    UserAgent NVARCHAR(500) NULL,

    -- Date and time when the action occurred.
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_AuditLogs_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
);
GO



-- =========================================================
-- OTP Verification Management
-- =========================================================

-- OTPVerifications:
-- Stores OTPs generated for important actions.
--
-- Examples:
-- 1. Login verification
-- 2. Fund transfer confirmation
-- 3. Beneficiary verification
--
-- OTP value should be stored securely in a real application.
-- For this demo project, we will initially keep the design simple.
CREATE TABLE OTPVerifications
(
    OTPVerificationId INT IDENTITY(1,1) PRIMARY KEY,

    -- User for whom the OTP was generated.
    UserId INT NOT NULL,

    -- Purpose of the OTP.
    -- Example: Login, FundTransfer, Beneficiary
    OTPPurpose VARCHAR(50) NOT NULL,

    -- OTP value.
    OTPCode VARCHAR(10) NOT NULL,

    -- Reference to the related operation.
    -- Example:
    -- FundTransferId for a fund transfer OTP.
    ReferenceId VARCHAR(100) NULL,

    -- OTP expiration date and time.
    ExpiresAt DATETIME NOT NULL,

    -- Whether the OTP has already been used.
    IsUsed BIT NOT NULL DEFAULT 0,

    -- Number of verification attempts.
    VerificationAttempts INT NOT NULL DEFAULT 0,

    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),

    VerifiedDate DATETIME NULL,

    CONSTRAINT FK_OTPVerifications_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT CK_OTPVerifications_Purpose
        CHECK
        (
            OTPPurpose IN
            (
                'Login',
                'FundTransfer',
                'Beneficiary'
            )
        ),

    CONSTRAINT CK_OTPVerifications_Attempts
        CHECK (VerificationAttempts >= 0)
);
GO