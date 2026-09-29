import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../interfaces/customer.interface';
import { AccountService } from '../../services/account.service';
import { Account } from '../../interfaces/account.interface';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../interfaces/transaction.interface';
import { TransactionService } from '../../services/transaction.service';
import { Beneficiary } from '../../interfaces/beneficiary.interface';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  customer: Customer | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  beneficiaries: Beneficiary[] = [];

  constructor(private customerService: CustomerService, private accountService: AccountService,
     private transactionService: TransactionService, private authService: AuthService,private beneficiaryService: BeneficiaryService, private router: Router) {}

  // Loads the logged-in customer.
  ngOnInit(): void {
    this.loadCustomer();
    this.loadAccounts();
  }

  // Gets the current customer from the API.
  loadCustomer(): void {
    this.customerService.getCurrentCustomer().subscribe({
      next: (response) => {
        this.customer = response;

        console.log('Customer loaded:', response);

        this.loadBeneficiaries(response.customerId);
      },
      error: (error) => {
        console.error('Failed to load customer:', error);
      }
    });
  }

  // Gets beneficiaries for the current customer.
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

   // Gets the current customer's accounts.
  loadAccounts(): void {
    this.accountService.getCurrentAccounts().subscribe({
      next: (response) => {
        this.accounts = response;

        console.log('Accounts loaded:', response);

        if (this.accounts.length > 0) {
        this.loadTransactions(this.accounts[0].accountId);
      }
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
      }
    });
  }

  // Gets transactions for the selected account.
  loadTransactions(accountId: number): void {
    this.transactionService.getTransactionsByAccount(accountId).subscribe({
      next: (response) => {
        this.transactions = response;

        console.log('Transactions loaded:', response);
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);
      }
    });
  }

  // Navigates to the fund transfer page.
  goToFundTransfer(): void {
    this.router.navigate(['/fund-transfer']);
  }

  // Logs out the current user.
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}