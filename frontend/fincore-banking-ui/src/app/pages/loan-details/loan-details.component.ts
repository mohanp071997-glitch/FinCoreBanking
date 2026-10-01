import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Loan } from '../../interfaces/loan.interface';
import { LoanService } from '../../services/loan.service';
import { LoanPayment } from '../../interfaces/loan-payment.interface';
import { LoanPaymentService } from '../../services/loan-payment.service';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-details.component.html',
  styleUrl: './loan-details.component.css'
})
export class LoanDetailsComponent implements OnInit {

  loan: Loan | null = null;
  payments: LoanPayment[] = [];
  loanLoading = true;
  paymentLoading = false;

  constructor(
    private loanService: LoanService,
    private loanPaymentService: LoanPaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Loads the selected loan.
  ngOnInit(): void {
    const loanId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (loanId) {
      this.loadLoan(loanId);
    }
  }

  // Gets the selected loan from the backend.
  loadLoan(loanId: number): void {
    this.loanLoading = true;
    this.loanService.getLoanById(loanId).subscribe({
      next: (response) => {
        this.loan = response;
        this.loanLoading = false;
        this.loadPayments(response.loanId);
      },
      error: (error) => {
        console.error(
          'Failed to load loan details:',
          error
        );
        this.loanLoading = false;
        this.loan = null;
      }
    });
  }

  // Navigates back to the loans page.
  goBack(): void {
    this.router.navigate(['/loans']);
  }

  // Gets the number of days until the next payment.
  getDaysUntilPayment(paymentDate?: string): number | null {
    if (!paymentDate) {
      return null;
    }

    const today = new Date();
    const payment = new Date(paymentDate);

    today.setHours(0, 0, 0, 0);
    payment.setHours(0, 0, 0, 0);

    const difference = payment.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }

  // Loads the payment schedule for the selected loan.

  loadPayments(loanId: number): void {

    this.paymentLoading = true;

    this.loanPaymentService.getLoanPayments(loanId).subscribe({
      next: (data) => {

        this.payments = data;
        this.paymentLoading = false;
      },

      error: (error) => {

        console.error(
          'Failed to load payment schedule.',
          error
        );

        this.payments = [];
        this.paymentLoading = false;
      }
    });
  }

  // Gets the display status for a payment.
  getPaymentDisplayStatus(payment: LoanPayment): string {
    if (payment.paymentStatus === 'Paid') {
      return 'Paid';
    }

    if (
      payment.paymentStatus !== 'Paid' &&
      new Date(payment.dueDate) < new Date()
    ) {
      return 'Overdue';
    }

    return 'Upcoming';
  }

  // Gets the CSS class for a payment status.
  getPaymentStatusClass(payment: LoanPayment): string {
    return this.getPaymentDisplayStatus(payment).toLowerCase();
  }

  // Gets the amount already repaid.
  getRepaidAmount(): number {
    if (!this.loan) {
      return 0;
    }

    return this.loan.principalAmount -
          this.loan.outstandingAmount;
  }

  // Gets the repayment percentage.
  getRepaymentPercentage(): number {
    if (!this.loan || this.loan.principalAmount === 0) {
      return 0;
    }

    return (
      (this.getRepaidAmount() /
        this.loan.principalAmount) * 100
    );
  }

  // Gets the remaining loan balance after the selected payment.
  getRemainingAmount(payment: LoanPayment): number {
    if (!this.loan) {
      return 0;
    }

    const paidBeforePayment = this.payments
      .filter(x => x.paymentNumber <= payment.paymentNumber)
      .reduce(
        (total, x) => total + (x.paidAmount ?? 0),
        0
      );

    return Math.max(
      this.loan.principalAmount - paidBeforePayment,
      0
    );
  }

}