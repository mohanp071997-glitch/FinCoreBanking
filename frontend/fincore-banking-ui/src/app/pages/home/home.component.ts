import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    FormsModule,
    CurrencyPipe,
    RouterLink
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  // Sets the default loan amount.
  loanAmount: number = 50000;

  // Sets the default interest rate.
  interestRate: number = 9.99;

  // Stores the selected loan type.
  selectedLoanType: string = 'Personal';

  // Stores the available loan types and interest rates.
  loanTypes = [
    {
      name: 'Personal',
      rate: 9.99
    },
    {
      name: 'Home',
      rate: 8.50
    },
    {
      name: 'Vehicle',
      rate: 10.50
    },
    {
      name: 'Education Loan',
      rate: 7.50
    },
    {
      name: 'Gold',
      rate: 8.99
    }
  ];

  // Sets the default loan duration to 6 months.
  loanYears: number = 0.5;

  // Stores the calculated monthly EMI.
  monthlyEmi: number = 0;

  // Stores the calculated total interest.
  totalInterest: number = 0;

  // Stores the calculated total payment.
  totalPayment: number = 0;

  // Stores the current slide index.
  currentSlide = 0;

  // Stores the automatic slide timer.
  private slideTimer: any;

  // Stores the banking promotional slides.
  slides = [
    {
      title: 'Personal Loan',
      description: 'Get instant disbursement with no foreclosure charges after 24 EMIs',
      badge: 'Ongoing offer',
      button1: 'Apply',
      button2: 'Details'
    },
    {
      title: 'Car Loan',
      description: 'Drive your new car with 100% on-road funding',
      badge: 'Ongoing offer',
      button1: 'Apply',
      button2: 'Details'
    },
    {
      title: 'Personal Loan',
      description: 'Complete your application now',
      badge: 'Welcome back',
      button1: 'APPLY NOW',
      button2: 'KNOW MORE'
    },
    {
      title: 'Credit Card',
      description: 'Complete your journey now!',
      badge: 'Get your card now',
      button1: 'APPLY NOW',
      button2: 'KNOW MORE'
    }
  ];

    ngOnInit(): void {

    // Calculates the default loan values.
    this.calculateLoan();
    this.startAutoSlide();

  }

  // Changes the selected loan type and interest rate.
  selectLoanType(
    loanType: string,
    rate: number
  ): void {

    // Updates the selected loan type.
    this.selectedLoanType = loanType;

    // Updates the interest rate.
    this.interestRate = rate;

    // Recalculates the EMI.
    this.calculateLoan();
  }

  // Calculates the loan EMI and total payable amount.
    calculateLoan(): void {

    // Converts annual interest rate to monthly rate.
    const monthlyRate = this.interestRate / 12 / 100;

    // Converts years to months.
    const numberOfMonths = this.loanYears * 12;

    // Stops calculation when values are invalid.
    if (
      this.loanAmount <= 0 ||
      this.interestRate < 0 ||
      numberOfMonths <= 0
    ) {
      this.monthlyEmi = 0;
      this.totalInterest = 0;
      this.totalPayment = 0;
      return;
    }

    // Calculates EMI for zero interest.
    if (monthlyRate === 0) {

      this.monthlyEmi =
        this.loanAmount / numberOfMonths;

    } else {

      // Calculates EMI using standard formula.
      this.monthlyEmi =
        this.loanAmount *
        monthlyRate *
        Math.pow(
          1 + monthlyRate,
          numberOfMonths
        ) /
        (
          Math.pow(
            1 + monthlyRate,
            numberOfMonths
          ) - 1
        );
    }

    // Calculates total payment.
    this.totalPayment =
      this.monthlyEmi * numberOfMonths;

    // Calculates total interest.
    this.totalInterest =
      this.totalPayment - this.loanAmount;
  }

  // Starts the automatic slide movement.
  startAutoSlide(): void {
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  // Moves to the next slide.
  nextSlide(): void {
    this.currentSlide =
      (this.currentSlide + 1) % this.slides.length;
  }

  // Moves to the previous slide.
  previousSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) %
      this.slides.length;
  }
 
}