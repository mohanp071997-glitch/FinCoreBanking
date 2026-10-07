import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nri',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nri.component.html',
  styleUrl: './nri.component.css'
})
export class NriComponent implements OnInit, OnDestroy {

  // =========================================================
  // SLIDER
  // =========================================================

  currentSlide = 0;

  private sliderInterval?: ReturnType<typeof setInterval>;

  isSliderPaused = false;

  isPlaying = true;


  // =========================================================
  // LOAN TYPE
  // =========================================================

  selectedLoanType: 'home' | 'education' = 'home';


  // =========================================================
  // LOAN VALUES
  // =========================================================

  loanAmount: number = 500000;

  interestRate: number = 9;

  loanTenure: number = 5;


  // =========================================================
  // TENURE OPTIONS
  // =========================================================

  tenureOptions: number[] = [5, 10, 15];

  showCustomTenure: boolean = false;


  // =========================================================
  // CALCULATED VALUES
  // =========================================================

  monthlyEMI: number = 0;

  totalInterest: number = 0;

  totalPayment: number = 0;


  // =========================================================
  // NRI SLIDES
  // =========================================================

  slides = [
    {
      title: 'Simplify your banking operations',
      description: "With FinCore's fully digital NRI Bank Account",
      buttonText: 'Apply now',
      imageUrl:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'NRI Home Loans',
      description: 'For those who dream big',
      buttonText: 'Know more',
      imageUrl:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'NRE and NRO Deposits',
      description: 'Grow your savings, wherever you are',
      buttonText: 'Know more',
      imageUrl:
        'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'You really can have more',
      description: 'With NRI 3-in-1 Savings Account',
      buttonText: 'Know more',
      imageUrl:
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80'
    }
  ];


  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {

    this.startSlider();

    this.calculateEMI();

  }


  ngOnDestroy(): void {

    if (this.sliderInterval) {

      clearInterval(this.sliderInterval);

    }

  }


  // =========================================================
  // SLIDER
  // =========================================================

  nextSlide(): void {

    this.currentSlide =
      (this.currentSlide + 1) %
      this.slides.length;

  }


  previousSlide(): void {

    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) %
      this.slides.length;

  }


  startSlider(): void {

    this.sliderInterval = setInterval(() => {

      if (!this.isSliderPaused) {

        this.nextSlide();

      }

    }, 5000);

  }


  toggleSlider(): void {

    this.isSliderPaused =
      !this.isSliderPaused;

  }


  // =========================================================
  // LOAN TYPE
  // =========================================================

  selectLoanType(
    type: 'home' | 'education'
  ): void {

    this.selectedLoanType = type;

    if (type === 'home') {

      this.interestRate = 9;

    } else {

      this.interestRate = 8;

    }

    this.calculateEMI();

  }


  // =========================================================
  // TENURE
  // =========================================================

  selectTenure(years: number): void {

    this.loanTenure = years;

    this.showCustomTenure = false;

    this.calculateEMI();

  }


  enableCustomTenure(): void {

    this.showCustomTenure = true;

  }


  // =========================================================
  // AMOUNT SLIDER %
  // =========================================================

  get amountSliderPercentage(): number {

  const min = 500000;

  const max = 5000000;

  const value = Number(this.loanAmount);

  const percentage =
    ((value - min) / (max - min)) * 100;

  return Math.max(
    0,
    Math.min(100, percentage)
  );
}


  // =========================================================
  // AMOUNT SLIDER BACKGROUND
  // =========================================================

  get amountSliderBackground(): string {

    const percentage =
      this.amountSliderPercentage;

    return `
      linear-gradient(
        to right,
        #f36b21 0%,
        #f36b21 ${percentage}%,
        #3d3d3d ${percentage}%,
        #3d3d3d 100%
      )
    `;

  }


  // =========================================================
  // EMI CALCULATION
  // =========================================================

  calculateEMI(): void {

    const principal =
      Number(this.loanAmount);

    const annualRate =
      Number(this.interestRate);

    const years =
      Number(this.loanTenure);


    if (
      principal <= 0 ||
      annualRate <= 0 ||
      years <= 0
    ) {

      this.monthlyEMI = 0;

      this.totalInterest = 0;

      this.totalPayment = 0;

      return;

    }


    // Monthly interest rate

    const monthlyRate =
      annualRate / 12 / 100;


    // Total number of months

    const numberOfMonths =
      years * 12;


    // EMI calculation

    const power =
      Math.pow(
        1 + monthlyRate,
        numberOfMonths
      );


    this.monthlyEMI =
      (
        principal *
        monthlyRate *
        power
      ) /
      (
        power - 1
      );


    // Total payment

    this.totalPayment =
      this.monthlyEMI *
      numberOfMonths;


    // Total interest

    this.totalInterest =
      this.totalPayment -
      principal;

  }

}