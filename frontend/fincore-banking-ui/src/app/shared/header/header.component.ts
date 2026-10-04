import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  hideNriMenu = false;
  hidePersonalMenu = false;

  // Hides the Personal dropdown after clicking Personal.
  closePersonalMenu(): void {
    this.hidePersonalMenu = true;
  }

  // Allows the Personal dropdown to open again on hover.
  enablePersonalMenu(): void {
    this.hidePersonalMenu = false;
  }

  // Hides the NRI dropdown after clicking NRI.
  closeNriMenu(): void {
    this.hideNriMenu = true;
  }

  // Allows the NRI dropdown to open again on hover.
  enableNriMenu(): void {
    this.hideNriMenu = false;
  }

  

}