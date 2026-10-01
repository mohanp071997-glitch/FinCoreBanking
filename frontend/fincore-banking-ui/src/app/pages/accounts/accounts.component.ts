import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Account } from '../../interfaces/account.interface';
import { AccountService } from '../../services/account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit {

  accounts: Account[] = [];
  loading = true;
  errorMessage = '';

  // Controls the salary conversion popup.
  showSalaryPopup = false;

  // Stores the selected account for conversion.
  selectedAccount: Account | null = null;

  // Stores the company name entered by the customer.
  companyName = '';

  // Stores the monthly salary entered by the customer.
  monthlySalary: number | null = null;

  // Stores the confirmation checkbox value.
  salaryConfirmation = false;

  // Stores the popup validation message.
  salaryErrorMessage = '';

  // Controls the success toaster.
  showSuccessMessage = false;

  // Stores the success toaster message.
  successMessage = '';

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  // Loads accounts for the logged-in customer.
  ngOnInit(): void {
    this.loadAccounts();
  }

  // Gets accounts from the backend.
  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getCurrentAccounts().subscribe({
      next: (response) => {
        this.accounts = response;
        this.loading = false;

        console.log('Accounts loaded:', response);
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);

        this.accounts = [];
        this.loading = false;
        this.errorMessage = 'Unable to load account details.';
      }
    });
  }

  // Navigates back to the dashboard.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Masks the account number.
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) {
      return '';
    }

    const lastFourDigits = accountNumber.slice(-4);

    return `•••• •••• ${lastFourDigits}`;
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  // Opens the Salary Account conversion popup.
  openSalaryConversion(account: Account): void {
    this.selectedAccount = account;
    this.companyName = '';
    this.monthlySalary = null;
    this.salaryConfirmation = false;
    this.salaryErrorMessage = '';
    this.showSalaryPopup = true;
  }

  // Closes the Salary Account conversion popup.
  closeSalaryPopup(): void {
    this.showSalaryPopup = false;
    this.selectedAccount = null;
    this.salaryErrorMessage = '';
  }

  // Validates the Salary Account conversion form.
  isSalaryFormValid(): boolean {
    return (
      this.companyName.trim().length > 0 &&
      this.monthlySalary !== null &&
      this.monthlySalary > 0 &&
      this.salaryConfirmation
    );
  }

  // Converts the selected account to a Salary Account.
  convertToSalaryAccount(): void {

    if (!this.selectedAccount) {
      return;
    }

    if (!this.isSalaryFormValid()) {
      this.salaryErrorMessage = 'Please complete all required fields.';
      return;
    }

    const request = {
      companyName: this.companyName.trim(),
      monthlySalary: this.monthlySalary,
      confirmation: this.salaryConfirmation
    };

    this.accountService
      .convertToSalaryAccount(this.selectedAccount.accountId, request)
      .subscribe({
        next: (response) => {

          console.log('Salary Account conversion successful:', response);

          this.closeSalaryPopup();

          this.loadAccounts();

          // Show success toaster.
          this.showSuccessToast(
            'Account converted to Salary Account successfully.'
          );
        },

        error: (error) => {

          console.error(
            'Failed to convert account to Salary Account:',
            error
          );

          this.salaryErrorMessage =
            error?.error || 'Unable to convert the account.';
        }
      });
  }

  // Displays a success toaster message.
  showSuccessToast(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

}