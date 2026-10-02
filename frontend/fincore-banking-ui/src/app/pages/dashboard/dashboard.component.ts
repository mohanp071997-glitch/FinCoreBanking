import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { AppNotification, NotificationService } from '../../services/notification.service';


Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  customer: Customer | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  beneficiaries: Beneficiary[] = [];
  lastLoginDate: string | null = null;
  showAvailableBalance = false;
  showSavingsBalance = false;
  // Controls account number visibility.
  showAccountNumber = false;

  creditTransactionCount = 0;
  debitTransactionCount = 0;

  totalCreditAmount = 0;
  totalDebitAmount = 0;

  // Stores the account statistics chart.
  accountStatisticsChart: Chart | null = null;

  selectedSpendingMonth = new Date().getMonth();
  selectedSpendingYear = new Date().getFullYear();

  spendingMonths = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];

  // Stores the spending analysis chart.
  spendingAnalysisChart: Chart | null = null;

  // Stores the notification list.
  notifications: AppNotification[] = [];

  // Stores the unread notification count.
  unreadNotificationCount = 0;

  // Controls the notification dropdown.
  showNotifications = false;

 


  constructor(private customerService: CustomerService, private accountService: AccountService,
     private transactionService: TransactionService, private authService: AuthService,
     private beneficiaryService: BeneficiaryService,
     private notificationService: NotificationService,
      private router: Router) {}

  // Loads the logged-in customer.
  ngOnInit(): void {
    this.loadCustomer();
    this.loadAccounts();
    this.loadLastLogin();
    this.loadNotificationCount();
  }

  // Initializes the account statistics chart.
  ngAfterViewInit(): void {
    this.createAccountStatisticsChart();
    this.updateSpendingChart();
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
        } else {
          this.transactions = [];
          this.totalCreditAmount = 0;
          this.totalDebitAmount = 0;
          this.createAccountStatisticsChart();
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

        // Calculates credit transaction count.
        this.creditTransactionCount = this.transactions.filter(
          transaction => transaction.transactionType === 'Credit'
        ).length;

        // Calculates debit transaction count.
        this.debitTransactionCount = this.transactions.filter(
          transaction => transaction.transactionType === 'Debit'
        ).length;

        // Calculates total credit amount.
        this.totalCreditAmount = this.transactions
          .filter(transaction => transaction.transactionType === 'Credit')
          .reduce((total, transaction) => total + transaction.amount, 0);

        // Calculates total debit amount.
        this.totalDebitAmount = this.transactions
          .filter(transaction => transaction.transactionType === 'Debit')
          .reduce((total, transaction) => total + transaction.amount, 0);

          // Calculates total debit amount.
        this.totalDebitAmount = this.transactions
          .filter(transaction => transaction.transactionType === 'Debit')
          .reduce((total, transaction) => total + transaction.amount, 0);

          // Updates the account statistics chart.
          this.createAccountStatisticsChart();

          // Updates the spending analysis chart.
          this.updateSpendingChart();

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

  // Opens the beneficiary page with the add popup.
  goToBeneficiaries(): void {
    this.router.navigate(['/beneficiaries'], {
      queryParams: { openAdd: 'true' }
    });
  }

  // Loads the last successful login time.
  loadLastLogin(): void {
    const authUser = localStorage.getItem('authUser');

    if (authUser) {
      const user = JSON.parse(authUser);
      this.lastLoginDate = user.lastLoginDate ?? null;
    }
  }

  // Navigates to the transaction history page.
  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

    // Toggles available balance visibility.
    toggleAvailableBalance(): void {
      this.showAvailableBalance = !this.showAvailableBalance;
    }

    // Toggles savings balance visibility.
    toggleSavingsBalance(): void {
      this.showSavingsBalance = !this.showSavingsBalance;
    }

    // Toggles account number visibility.
    toggleAccountNumber(): void {
      this.showAccountNumber = !this.showAccountNumber;
    }

    // Gets the transaction count for the current month.
    get currentMonthTransactionCount(): number {
      const now = new Date();

      return this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);

        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      }).length;
    }

    // Gets the approved beneficiary count.
      get approvedBeneficiaryCount(): number {
        return this.beneficiaries.filter(
          beneficiary => beneficiary.beneficiaryStatus === 'Approved'
        ).length;
      }

      // Gets the pending beneficiary count.
      get pendingBeneficiaryCount(): number {
        return this.beneficiaries.filter(
          beneficiary => beneficiary.beneficiaryStatus === 'Pending'
        ).length;
      }

      // Gets the rejected beneficiary count.
      get rejectedBeneficiaryCount(): number {
        return this.beneficiaries.filter(
          beneficiary => beneficiary.beneficiaryStatus === 'Rejected'
        ).length;
      }

      // Creates the account statistics chart.
      createAccountStatisticsChart(): void {

        const canvas = document.getElementById(
          'accountStatisticsChart'
        ) as HTMLCanvasElement | null;

        if (!canvas) {
          return;
        }

        // Destroys the existing chart before creating a new one.
        if (this.accountStatisticsChart) {
          this.accountStatisticsChart.destroy();
        }

        this.accountStatisticsChart = new Chart(canvas, {
          type: 'bar',

          data: {
            labels: ['Credits', 'Debits'],

            datasets: [
              {
                label: 'Transaction Amount',
                data: [
                  this.totalCreditAmount,
                  this.totalDebitAmount
                ],
                backgroundColor: [
                  '#4CAF50',
                  '#E57373'
                ],
                borderColor: [
                  '#388E3C',
                  '#D32F2F'
                ],
                borderWidth: 1,
                borderRadius: 6
              }
            ]
          },

          options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false
              }
            },

            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }


      // Creates the monthly spending analysis chart.
      updateSpendingChart(): void {

        const canvas = document.getElementById(
          'spendingAnalysisChart'
        ) as HTMLCanvasElement | null;

        if (!canvas) {
          return;
        }

        // Destroys the existing chart before creating a new one.
        if (this.spendingAnalysisChart) {
          this.spendingAnalysisChart.destroy();
        }

        const weeklySpending = [0, 0, 0, 0, 0];

        this.transactions
          .filter(transaction => transaction.transactionType === 'Debit')
          .forEach(transaction => {

            const transactionDate = new Date(transaction.transactionDate);

            if (
              transactionDate.getMonth() === this.selectedSpendingMonth &&
              transactionDate.getFullYear() === this.selectedSpendingYear
            ) {

              const day = transactionDate.getDate();

              let weekIndex = Math.floor((day - 1) / 7);

              if (weekIndex > 4) {
                weekIndex = 4;
              }

              weeklySpending[weekIndex] += transaction.amount;
            }
          });

        this.spendingAnalysisChart = new Chart(canvas, {
          type: 'line',

          data: {
            labels: [
              'Week 1',
              'Week 2',
              'Week 3',
              'Week 4',
              'Week 5'
            ],

            datasets: [
              {
                label: 'Spending',
                data: weeklySpending,
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.08)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
              }
            ]
          },

          options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false
              }
            },

            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

      // Loads notifications for the current user.
    loadNotifications(): void {
      this.notificationService.getNotifications().subscribe({
        next: (response) => {
          this.notifications = response;
        },
        error: (error) => {
          console.error(
            'Failed to load notifications:',
            error
          );
        }
      });
    }

    // Loads the unread notification count.
    loadNotificationCount(): void {
      this.notificationService.getUnreadCount().subscribe({
        next: (response) => {
          this.unreadNotificationCount =
            response.unreadCount;
        },
        error: (error) => {
          console.error(
            'Failed to load notification count:',
            error
          );
        }
      });
    }

    // Opens or closes the notification dropdown.
    toggleNotifications(): void {
      this.showNotifications =
        !this.showNotifications;

      if (this.showNotifications) {
        this.loadNotifications();
      }
    }

    // Marks a notification as read.
    openNotification(notification: AppNotification): void {

      if (!notification.isRead) {

        this.notificationService
          .markAsRead(notification.notificationId)
          .subscribe({
            next: () => {

              this.notifications = this.notifications.filter(
                x => x.notificationId !== notification.notificationId
              );

              this.unreadNotificationCount =
                Math.max(
                  0,
                  this.unreadNotificationCount - 1
                );
            },
            error: (error) => {
              console.error(
                'Failed to mark notification as read:',
                error
              );
            }
          });
      }
    }

    // Marks all notifications as read.
    markAllNotificationsAsRead(): void {

      this.notificationService
        .markAllAsRead()
        .subscribe({
          next: () => {

            this.notifications.forEach(
              notification => {
                notification.isRead = true;
              }
            );

            this.unreadNotificationCount = 0;
          },
          error: (error) => {
            console.error(
              'Failed to mark all notifications as read:',
              error
            );
          }
        });
    }

    // Logs out the current user.
    logout(): void {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

}