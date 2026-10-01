import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Loan } from '../../interfaces/loan.interface';
import { LoanService } from '../../services/loan.service';
import { Router } from '@angular/router';

interface LoanGroup {
  loanTypeName: string;
  loans: Loan[];
  expanded: boolean;
}

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css'
})
export class LoansComponent implements OnInit {

  loans: Loan[] = [];
  loanGroups: LoanGroup[] = [];

  constructor(private loanService: LoanService,private router: Router) {}

  // Loads loans for the logged-in customer.
  ngOnInit(): void {
    this.loadLoans();
  }

  // Gets customer loans from the backend API.
  loadLoans(): void {
    this.loanService.getCurrentLoans().subscribe({
      next: (response) => {
        this.loans = response;
        this.groupLoansByType();
        console.log('Loans loaded:', response);
      },
      error: (error) => {
        console.error('Failed to load loans:', error);
      }
    });
  }

  // Groups loans by loan type.
  groupLoansByType(): void {
    const groups = new Map<string, Loan[]>();

    this.loans.forEach((loan) => {
      const loanType = loan.loanTypeName;

      if (!groups.has(loanType)) {
        groups.set(loanType, []);
      }

      groups.get(loanType)!.push(loan);
    });

    this.loanGroups = Array.from(groups.entries()).map(
      ([loanTypeName, loans]) => ({
        loanTypeName,
        loans,
        expanded: false
      })
    );
  }

  // Expands or collapses a loan type.
  toggleLoanType(group: LoanGroup): void {
    group.expanded = !group.expanded;
  }

  // Opens the selected loan details.
  viewLoan(loanId: number): void {
    this.router.navigate(['/loans', loanId]);
  }

  // Navigates back to the previous page.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
  
}