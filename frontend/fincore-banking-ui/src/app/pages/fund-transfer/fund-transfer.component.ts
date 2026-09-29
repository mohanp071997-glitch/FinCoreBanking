import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Beneficiary } from '../../interfaces/beneficiary.interface';
import { Customer } from '../../interfaces/customer.interface';
import { Account } from '../../interfaces/account.interface';

import { BeneficiaryService } from '../../services/beneficiary.service';
import { CustomerService } from '../../services/customer.service';
import { AccountService } from '../../services/account.service';
import { FundTransferService } from '../../services/fund-transfer.service';

@Component({
  selector: 'app-fund-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './fund-transfer.component.html',
  styleUrl: './fund-transfer.component.css'
})
export class FundTransferComponent implements OnInit {

  customer: Customer | null = null;
  accounts: Account[] = [];
  beneficiaries: Beneficiary[] = [];

  selectedAccountType = 'Savings';
  selectedBeneficiaryId: number | null = null;

  beneficiaryAccountNumber = '';
  confirmBeneficiaryAccountNumber = '';
  amount: number | null = null;
  transferDescription = '';
  validationMessage = '';

  showSuccessPopup = false;

  successBeneficiaryName = '';
  successAccountNumber = '';
  successAmount = 0;
  successDate = new Date();

  savingsBalance = 0;
  currentBalance = 0;

  constructor(
    private beneficiaryService: BeneficiaryService,
    private customerService: CustomerService,
    private accountService: AccountService,
    private fundTransferService: FundTransferService,
    private router: Router
  ) {}

  // Loads customer, accounts and beneficiaries.
  ngOnInit(): void {
    this.loadCustomer();
    this.loadAccounts();
  }

  // Loads the logged-in customer.
  loadCustomer(): void {
    this.customerService.getCurrentCustomer().subscribe({
      next: (response) => {
        this.customer = response;

        console.log('Current customer:', response);

        this.loadBeneficiaries(response.customerId);
      },
      error: (error) => {
        console.error('Failed to load customer:', error);
      }
    });
  }

  // Loads accounts for the logged-in customer.
  loadAccounts(): void {
    this.accountService.getCurrentAccounts().subscribe({
      next: (response) => {
        this.accounts = response;

        console.log('Accounts loaded:', response);

        this.setAccountBalances();
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
      }
    });
  }

  // Sets savings and current account balances.
  setAccountBalances(): void {
    const savingsAccount = this.accounts.find(
      account => account.accountTypeName === 'Savings'
    );

    const currentAccount = this.accounts.find(
      account => account.accountTypeName === 'Current'
    );

    this.savingsBalance = savingsAccount?.currentBalance ?? 0;
    this.currentBalance = currentAccount?.currentBalance ?? 0;
  }

  // Loads beneficiaries for the customer.
  loadBeneficiaries(customerId: number): void {
    this.beneficiaryService
      .getBeneficiariesByCustomer(customerId)
      .subscribe({
        next: (response) => {
          this.beneficiaries = response;

          console.log('Beneficiaries loaded:', response);
        },
        error: (error) => {
          console.error('Failed to load beneficiaries:', error);
        }
      });
  }

    // Selects the source account type.
    selectAccount(accountType: string): void {
      this.selectedAccountType = accountType;
      this.validationMessage = '';
    }

  // Navigates back to the dashboard.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Navigates to the home page.
  goHome(): void {
    this.showSuccessPopup = false;
    this.router.navigate(['/dashboard']);
  }

  // Handles the fund transfer.

  transferMoney(): void {

    // Clears the previous validation message.
    this.validationMessage = '';

    // Validates beneficiary account number.
    if (!this.beneficiaryAccountNumber.trim()) {
      this.validationMessage = 'Please enter beneficiary account number.';
      return;
    }

    // Validates beneficiary account number confirmation.
    if (
      this.beneficiaryAccountNumber.trim() !==
      this.confirmBeneficiaryAccountNumber.trim()
    ) {
      this.validationMessage =
        'Beneficiary account numbers do not match.';
      return;
    }

    // Validates transfer amount.
    if (!this.amount || this.amount <= 0) {
      this.validationMessage =
        'Please enter a valid transfer amount.';
      return;
    }

    // Finds the selected source account.
    const sourceAccount = this.accounts.find(
      account => account.accountTypeName === this.selectedAccountType
    );

    if (!sourceAccount) {
      this.validationMessage =
        `${this.selectedAccountType} account not found.`;
      return;
    }

    // Finds the beneficiary using the account number.
    const beneficiary = this.beneficiaries.find(
      item =>
        item.beneficiaryAccountNumber ===
        this.beneficiaryAccountNumber.trim()
    );

    if (!beneficiary) {
      this.validationMessage = 'Beneficiary not found.';
      return;
    }

    // Checks beneficiary approval status.
    if (beneficiary.beneficiaryStatus !== 'Approved') {
      this.validationMessage =
        'Selected beneficiary is not approved.';
      return;
    }

    // Checks available account balance.
    if (this.amount > sourceAccount.currentBalance) {
      this.validationMessage =
        'Insufficient account balance.';
      return;
    }

    // Creates the transfer request.
    const request = {
      fromAccountId: sourceAccount.accountId,
      beneficiaryId: beneficiary.beneficiaryId,
      amount: this.amount,
      transferDescription: this.transferDescription || undefined
    };

    console.log('Fund transfer request:', request);

    // Sends the transfer request to the API.
    this.fundTransferService.createTransfer(request).subscribe({
      next: (response) => {
        console.log('Fund transfer successful:', response);

        this.successBeneficiaryName =
          beneficiary.beneficiaryName;

        this.successAccountNumber =
          sourceAccount.accountNumber;

        this.successAmount =
          this.amount ?? 0;

        this.successDate = new Date();

         // Refreshes account balances after transfer.
        this.loadAccounts();

        this.showSuccessPopup = true;
      },

      error: (error) => {
        console.error('Fund transfer failed:', error);

        this.validationMessage =
          error?.error?.message ||
          error?.error ||
          'Fund transfer failed.';
      }
    });
  }

  // Closes the success popup.
  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }

  // Starts another fund transfer.
  sendMore(): void {
    this.showSuccessPopup = false;

    this.beneficiaryAccountNumber = '';
    this.confirmBeneficiaryAccountNumber = '';
    this.amount = null;
    this.transferDescription = '';
  }


}