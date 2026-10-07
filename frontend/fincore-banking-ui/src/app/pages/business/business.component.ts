import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business.component.html',
  styleUrl: './business.component.css'
})
export class BusinessComponent implements OnInit, OnDestroy {

  currentSlide = 0;

  private sliderInterval?: ReturnType<typeof setInterval>;

  isPaused = false;


  // ================= BUSINESS SLIDES =================

    slides = [
      {
      title: 'Present Collect Reconcile',
      description: 'One platform for smarter invoice collections.',
      buttonText: 'Explore IMS Now',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85'
    },

      {
        title: 'Let Your Funds Earn More For You!',
        description: 'Flexible terms, assured growth for your business.',
        buttonText: 'Open FD',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=85'
      },

   {
  title: 'Emergency Credit Line',
  description: 'Additional credit support when your business needs it.',
  buttonText: 'Know More',
  image:
    'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1600&q=85'
},

      {
        title: 'Get Your Forex Card On The Go!',
        description: 'Now global payments simpler than ever.',
        buttonText: 'Know More',
        image:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85'
      }
    ];


  // ================= CURRENT SLIDE =================

  get currentBusinessSlide() {
    return this.slides[this.currentSlide];
  }


  // ================= INITIALIZE =================

  ngOnInit(): void {
    this.startSlider();
  }


  // ================= NEXT SLIDE =================

  nextSlide(): void {

    this.currentSlide =
      (this.currentSlide + 1) % this.slides.length;

  }


  // ================= PREVIOUS SLIDE =================

  previousSlide(): void {

    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) %
      this.slides.length;

  }


  // ================= AUTO SLIDER =================

  startSlider(): void {

    this.sliderInterval = setInterval(() => {

      if (!this.isPaused) {
        this.nextSlide();
      }

    }, 5000);

  }


  // ================= PAUSE / PLAY =================

  toggleSlider(): void {

    this.isPaused = !this.isPaused;

  }


  // ================= DOT CLICK =================

  goToSlide(index: number): void {

    this.currentSlide = index;

  }


  // ================= DESTROY =================

  ngOnDestroy(): void {

    if (this.sliderInterval) {

      clearInterval(this.sliderInterval);

    }

  }

}