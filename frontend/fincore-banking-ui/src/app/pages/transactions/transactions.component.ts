import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Account } from '../../interfaces/account.interface';
import { Transaction } from '../../interfaces/transaction.interface';

import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {

  accounts: Account[] = [];

  transactions: Transaction[] = [];

  selectedAccount: Account | null = null;

  searchText = '';

  selectedTransactionType = '';

  currentPage = 1;

  pageSize = 5;

  Math = Math;

  isLoading = false;

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  // Loads the accounts for the logged-in customer.
  ngOnInit(): void {
    this.loadAccounts();
  }

  // Loads accounts for the logged-in customer.
  loadAccounts(): void {

    this.accountService.getCurrentAccounts().subscribe({

      next: (response) => {

        this.accounts = response;

        if (this.accounts.length > 0) {

          this.selectedAccount = this.accounts[0];

          this.loadTransactions(
            this.selectedAccount.accountId
          );
        }
      },

      error: (error) => {
        console.error(
          'Failed to load accounts:',
          error
        );
      }

    });
  }

  
    // Loads transactions for the selected account.
    loadTransactions(accountId: number): void {

      this.isLoading = true;

      console.log('Loading started:', this.isLoading);

      this.transactionService
        .getTransactionsByAccount(accountId)
        .subscribe({
          next: (response) => {

            this.transactions = response;

            this.isLoading = false;

            console.log('Loading completed:', this.isLoading);
          },
          error: (error) => {

            console.error('Failed to load transactions:', error);

            this.isLoading = false;

            console.log('Loading failed:', this.isLoading);
          }
        });
    }

    // Normalizes text for global search.
  private normalizeSearchValue(value: string): string {
    return value
      .toLowerCase()
      .replace(/[₹,\s]/g, '');
  }

  // Filters transactions using global search and transaction type.
  get filteredTransactions(): Transaction[] {

    const search = this.normalizeSearchValue(
      this.searchText.trim()
    );

    return this.transactions.filter(transaction => {

      // Formats the transaction amount.
      const amountValue =
        transaction.amount.toFixed(2);

      // Adds the displayed sign based on transaction type.
      const signedAmount =
        transaction.transactionType === 'Credit'
          ? `+${amountValue}`
          : `-${amountValue}`;

      const description =
        this.normalizeSearchValue(
          transaction.description ?? ''
        );

      const reference =
        this.normalizeSearchValue(
          transaction.transactionReference
        );

      const type =
        this.normalizeSearchValue(
          transaction.transactionType
        );

      const status =
        this.normalizeSearchValue(
          transaction.transactionStatus
        );

      const amount =
        this.normalizeSearchValue(
          amountValue
        );

      const signedAmountValue =
        this.normalizeSearchValue(
          signedAmount
        );

        // Formats the transaction date for global search.
        const transactionDate = new Date(
          transaction.transactionDate
        );

        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const formattedDate =
          `${transactionDate.getDate()} ` +
          `${monthNames[transactionDate.getMonth()]} ` +
          `${transactionDate.getFullYear()}`;

        const formattedDateNumeric =
          `${String(transactionDate.getDate()).padStart(2, '0')}/` +
          `${String(transactionDate.getMonth() + 1).padStart(2, '0')}/` +
          `${transactionDate.getFullYear()}`;

      const balance =
        this.normalizeSearchValue(
          transaction.balanceAfterTransaction.toFixed(2)
        );

      // Searches across all transaction fields.
      const matchesGlobalSearch =
        !search ||
        description.includes(search) ||
        reference.includes(search) ||
        type.includes(search) ||
        status.includes(search) ||
        amount.includes(search) ||
        signedAmountValue.includes(search) ||
        balance.includes(search) ||
        this.normalizeSearchValue(formattedDate).includes(search) ||
        this.normalizeSearchValue(formattedDateNumeric).includes(search);

      // Applies the transaction type filter.
      const matchesType =
        !this.selectedTransactionType ||
        transaction.transactionType ===
          this.selectedTransactionType;

      return matchesGlobalSearch && matchesType;
    });
  }

  // Gets transactions for the current page.
  get paginatedTransactions(): Transaction[] {

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredTransactions.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Gets the total number of pages.
  get totalPages(): number {

    return Math.ceil(
      this.filteredTransactions.length /
      this.pageSize
    );
  }

  // Changes the current page.
  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }

  // Changes the page size.
  changePageSize(): void {
    this.currentPage = 1;
  }

  // Resets pagination when search changes.
  onSearchChange(): void {
    this.currentPage = 1;
  }

  // Resets pagination when transaction type changes.
  onTransactionTypeChange(): void {
    this.currentPage = 1;
  }

  // Navigates back to the dashboard.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  
}