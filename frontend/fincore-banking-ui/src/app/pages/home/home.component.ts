import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    FormsModule,
    CurrencyPipe,
    RouterLink,
    NgIf
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

  // Stores whether custom duration is selected.
  isCustomDuration = false;

  // Stores the custom duration in months.
  customDurationMonths = 12;

  // Stores the custom duration type.
  customDurationType: 'Years' | 'Months' = 'Years';

  // Stores the custom duration value.
  customDurationValue: number | null = null;

  // Stores the banking promotional slides.

  slides = [
    {
      title: 'Personal Loan',
      description: 'Get instant disbursement with no foreclosure charges after 24 EMIs',
      badge: 'Ongoing offer',
      button1: 'Apply',
      button2: 'Details',
      imageUrl: 'https://hfcl-website-cms.s3.ap-south-1.amazonaws.com/image_4fdd8d5f06.png'
    },
    {
      title: 'Car Loan',
      description: 'Drive your new car with 100% on-road funding',
      badge: 'Ongoing offer',
      button1: 'Apply',
      button2: 'Details',
      imageUrl: 'https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/images/blog/small/used-car-loan-differ-from-new-car-loan-d.webp'
    },
    {
      title: 'Credit Card',
      description: 'Complete your journey now!',
      badge: 'Get your card now',
      button1: 'APPLY NOW',
      button2: 'KNOW MORE',
      imageUrl: 'https://www.indusind.bank.in/content/dam/indusind-platform-images/carousal-banner-images/credit-card/new-webp-cc-/b1/Product-Page-Web-Banner_CC_Desktop_1_1920X450_4_11zon.webp'
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


 // Calculates the loan duration in months.
    let numberOfMonths: number;

    if (this.isCustomDuration) {

      // Stops calculation when custom duration is empty.
      if (this.customDurationValue === null) {
        this.monthlyEmi = 0;
        this.totalInterest = 0;
        this.totalPayment = 0;
        return;
      }

      if (this.customDurationType === 'Years') {
        numberOfMonths = this.customDurationValue * 12;
      } else {
        numberOfMonths = this.customDurationValue;
      }

    } else {

      numberOfMonths = this.loanYears * 12;

    }

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

  // Opens the custom duration option.
  selectCustomDuration(): void {
    this.isCustomDuration = true;
    this.customDurationType = 'Years';
    this.customDurationValue = null;

    this.calculateLoan();
  }
  // Closes the custom duration control.
  closeCustomDuration(): void {
    this.isCustomDuration = false;

    this.loanYears = 0.5;

    this.calculateLoan();
  }
 
}