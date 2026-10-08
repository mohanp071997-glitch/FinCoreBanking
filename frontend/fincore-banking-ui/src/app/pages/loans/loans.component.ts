import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Loan } from '../../interfaces/loan.interface';
import { LoanService } from '../../services/loan.service';


interface LoanGroup {

  loanTypeName: string;

  loans: Loan[];

  expanded: boolean;

}


@Component({
  selector: 'app-loans',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './loans.component.html',

  styleUrl: './loans.component.css'
})


export class LoansComponent implements OnInit {


  // =====================================================
  // LOAN DATA
  // =====================================================

  loans: Loan[] = [];

  loanGroups: LoanGroup[] = [];

  isLoading = false;

  errorMessage = '';


  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    this.loadLoans();

  }


  // =====================================================
  // LOAD CUSTOMER LOANS
  // =====================================================

  loadLoans(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.loanService
      .getCurrentLoans()
      .subscribe({

        next: (response: Loan[]) => {

          console.log(
            'Customer loans:',
            response
          );

          this.loans = response || [];

          this.createLoanGroups();

          this.isLoading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load loans:',
            error
          );

          this.loans = [];

          this.loanGroups = [];

          this.errorMessage =
            'Unable to load loan details.';

          this.isLoading = false;

        }

      });

  }


  // =====================================================
  // CREATE LOAN GROUPS
  // =====================================================

  createLoanGroups(): void {

    const groupedLoans =
      new Map<string, Loan[]>();


    this.loans.forEach(
      (loan: Loan) => {

        const loanType =
          loan.loanTypeName || 'Other Loan';


        if (!groupedLoans.has(loanType)) {

          groupedLoans.set(
            loanType,
            []
          );

        }


        groupedLoans
          .get(loanType)!
          .push(loan);

      }
    );


    this.loanGroups =
      Array.from(
        groupedLoans.entries()
      ).map(
        ([loanTypeName, loans]) => ({

          loanTypeName,

          loans,

          expanded: true

        })
      );

  }


  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  get totalLoans(): number {

    return this.loans.length;

  }


  // =====================================================
  // TOTAL BORROWED
  // =====================================================

  get totalBorrowed(): number {

    return this.loans.reduce(
      (total, loan) =>
        total +
        (loan.principalAmount || 0),

      0
    );

  }


  // =====================================================
  // TOTAL OUTSTANDING
  // =====================================================

  get totalOutstanding(): number {

    return this.loans.reduce(
      (total, loan) =>
        total +
        (loan.outstandingAmount || 0),

      0
    );

  }


  // =====================================================
  // TOTAL MONTHLY EMI
  // =====================================================

  get totalMonthlyEmi(): number {

    return this.loans.reduce(
      (total, loan) =>
        total +
        (loan.emiAmount || 0),

      0
    );

  }


  // =====================================================
  // NEXT PAYMENT
  // =====================================================

  get nextPaymentLoan(): Loan | null {

    const loansWithPaymentDate =
      this.loans.filter(
        loan =>
          !!loan.nextPaymentDate
      );


    if (
      loansWithPaymentDate.length === 0
    ) {

      return null;

    }


    return [
      ...loansWithPaymentDate
    ].sort(
      (a, b) => {

        const dateA =
          new Date(
            a.nextPaymentDate!
          ).getTime();


        const dateB =
          new Date(
            b.nextPaymentDate!
          ).getTime();


        return dateA - dateB;

      }
    )[0];

  }


  // =====================================================
  // REPAYMENT PERCENTAGE
  // =====================================================

  getRepaymentPercentage(
    loan: Loan
  ): number {

    if (
      !loan.principalAmount ||
      loan.principalAmount <= 0
    ) {

      return 0;

    }


    const repaidAmount =
      loan.principalAmount -
      loan.outstandingAmount;


    return Math.min(
      100,

      Math.max(
        0,

        (
          repaidAmount /
          loan.principalAmount
        ) * 100

      )
    );

  }


  // =====================================================
  // REPAYMENT AMOUNT
  // =====================================================

  getRepaidAmount(
    loan: Loan
  ): number {

    return Math.max(

      0,

      (
        loan.principalAmount || 0
      ) -

      (
        loan.outstandingAmount || 0
      )

    );

  }


  // =====================================================
  // TOGGLE LOAN GROUP
  // =====================================================

  toggleLoanType(
    group: LoanGroup
  ): void {

    group.expanded =
      !group.expanded;

  }


  // =====================================================
  // VIEW LOAN DETAILS
  // =====================================================

  viewLoan(
    loanId: number
  ): void {

    this.router.navigate([
      '/loans',
      loanId
    ]);

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    window.history.back();

  }

}