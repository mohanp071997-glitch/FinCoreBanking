import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-nri',
  imports: [NgFor],
  templateUrl: './nri.component.html',
  styleUrl: './nri.component.css'
})
export class NriComponent implements OnInit, OnDestroy{

  // Stores the currently displayed promotional slide.
  currentSlide = 0;

  // Controls automatic slider movement.
  private sliderInterval?: ReturnType<typeof setInterval>;

  // Controls whether the slider is paused.
  isSliderPaused = false;

  isPlaying = true;

  private slideInterval: any; 

  // Stores NRI promotional slides.
  slides = [
    {
      title: 'Simplify your banking operations',
      description: "With FinCore's fully digital NRI Bank Account",
      buttonText: 'Apply now',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'NRI Home Loans',
      description: 'For those who dream big',
      buttonText: 'Know more',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'NRE and NRO Deposits',
      description: 'Grow your savings, wherever you are',
      buttonText: 'Know more',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'You really can have more',
      description: 'With NRI 3-in-1 Savings Account',
      buttonText: 'Know more',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  // Starts the promotional slider.
  ngOnInit(): void {
    this.startSlider();
    
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

  // Starts automatic slide movement.
  startSlider(): void {
    this.sliderInterval = setInterval(() => {
      if (!this.isSliderPaused) {
        this.nextSlide();
      }
    }, 5000);
  }

  // Pauses or resumes the slider.
  toggleSlider(): void {
    this.isSliderPaused = !this.isSliderPaused;
  }

  // Clears the slider timer.
    ngOnDestroy(): void {
      if (this.sliderInterval) {
        clearInterval(this.sliderInterval);
      }
      
  }
}
