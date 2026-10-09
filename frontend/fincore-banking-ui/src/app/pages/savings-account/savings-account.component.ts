
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

// FEATURE: Breadcrumb item model
// Stores the breadcrumb display text and optional navigation URL.
interface Breadcrumb {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-savings-account',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './savings-account.component.html',
  styleUrl: './savings-account.component.css'
})
export class SavingsAccountComponent {

  // FEATURE: Dynamic Breadcrumb Navigation
  // Stores breadcrumb items displayed on the Savings Account page.
  breadcrumbs: Breadcrumb[] = [];

  // FEATURE: Savings Interest Rate
  // Demo interest rate only; replace with the official configured rate.
  readonly interestRate = 2.5;

  // FEATURE: Savings Calculator - User Inputs
  // Default savings amount and selected duration.
  amount = 10000;
  years = 1;
  months = 0;
  days = 0;

  // FEATURE: Open Account Popup
  // Controls the visibility of the Open Savings Account modal.
  showAccountModal = false;

  // FEATURE: Calculator Duration Dropdown Options
  // Generates year, month and day dropdown values.
  readonly yearOptions = Array.from({ length: 31 }, (_, i) => i);
  readonly monthOptions = Array.from({ length: 12 }, (_, i) => i);
  readonly dayOptions = Array.from({ length: 31 }, (_, i) => i);

  // FEATURE: Initialize Breadcrumbs
  // Updates breadcrumb navigation whenever the route changes.
  constructor(private router: Router) {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumbs());
  }

  // FEATURE: Generate Dynamic Breadcrumbs
  // Reads the current URL and converts route segments into display labels.
  // Example: /personal/accounts/savings-account
  // FEATURE: Dynamic Breadcrumb Navigation
  private updateBreadcrumbs(): void {
    const currentRoute = this.router.config.find(route =>
      route.path === this.router.url.split('?')[0].split('#')[0].replace(/^\//, '')
    );

    const configuredBreadcrumbs =
      currentRoute?.data?.['breadcrumb'] as
        { label: string; url?: string }[] | undefined;

    this.breadcrumbs = [
      { label: 'Home', url: '/' },
      ...(configuredBreadcrumbs ?? [
        { label: 'Savings Account' }
      ])
    ];
  }

  // FEATURE: Calculate Duration in Years
  // Converts selected months and days into a year-based value.
  get durationInYears(): number {
    return this.years + this.months / 12 + this.days / 365;
  }

  // FEATURE: Calculate Total Interest
  // Calculates estimated simple interest for the selected duration.
  get totalInterest(): number {
    return Math.round(
      this.amount * (this.interestRate / 100) * this.durationInYears
    );
  }

  // FEATURE: Calculate Maturity Amount
  // Adds the original savings amount and estimated interest.
  get totalAmount(): number {
    return this.amount + this.totalInterest;
  }

  // FEATURE: Format Amount in Indian Numbering
  // Displays the amount in Crore, Lakh or Rupees.
  get amountInWords(): string {
    if (this.amount >= 10000000) {
      return `${Number(
        (this.amount / 10000000).toFixed(2)
      ).toLocaleString('en-IN')} Crore`;
    }

    if (this.amount >= 100000) {
      return `${Number(
        (this.amount / 100000).toFixed(2)
      ).toLocaleString('en-IN')} Lakh`;
    }

    return `${this.amount.toLocaleString('en-IN')} Rupees`;
  }

  // FEATURE: Savings Amount Slider
  // Updates the amount when the user moves the range slider.
  onAmountRange(event: Event): void {
    this.setAmount((event.target as HTMLInputElement).value);
  }

  // FEATURE: Manual Amount Entry
  // Updates the amount when the user types a value.
  onAmountInput(event: Event): void {
    this.setAmount((event.target as HTMLInputElement).value);
  }

  // FEATURE: Validate Savings Amount
  // Restricts the amount between ₹10,000 and ₹10 Crore.
  private setAmount(value: string): void {
    const parsed = Math.round(Number(value));

    if (Number.isFinite(parsed)) {
      this.amount = Math.min(
        100000000,
        Math.max(10000, parsed)
      );
    }
  }

  // FEATURE: Update Selected Years
  onYearsChange(event: Event): void {
    this.years = Number((event.target as HTMLSelectElement).value);
  }

  // FEATURE: Update Selected Months
  onMonthsChange(event: Event): void {
    this.months = Number((event.target as HTMLSelectElement).value);
  }

  // FEATURE: Update Selected Days
  onDaysChange(event: Event): void {
    this.days = Number((event.target as HTMLSelectElement).value);
  }

  // FEATURE: Format Currency
  // Formats calculated amounts using Indian Rupee currency formatting.
  formatCurrency(value: number): string {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  }

  // FEATURE: Navigate to Savings Account Application
  openAccount(): void {
    this.router.navigate(['/open-savings-account']);
  }


  // FEATURE: Close Savings Account Modal
  closeAccountModal(): void {
    this.showAccountModal = false;
  }
}
