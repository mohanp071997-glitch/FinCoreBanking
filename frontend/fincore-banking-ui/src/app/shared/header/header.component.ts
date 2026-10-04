import { Component, HostListener, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

type DesktopMenu = 'personal' | 'nri' | null;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnDestroy {

  desktopMenuOpen: DesktopMenu = null;

  mobileMenuOpen = false;
  mobilePersonalMenuOpen = false;
  mobileNriMenuOpen = false;

  private desktopCloseTimer: ReturnType<typeof setTimeout> | null = null;

  // Opens the selected desktop menu.
  openDesktopMenu(menu: 'personal' | 'nri'): void {
    this.cancelDesktopClose();
    this.desktopMenuOpen = menu;
  }

  // Cancels the desktop menu close timer.
  cancelDesktopClose(): void {
    if (this.desktopCloseTimer) {
      clearTimeout(this.desktopCloseTimer);
      this.desktopCloseTimer = null;
    }
  }

  // Delays closing to allow the mouse to reach the dropdown.
  scheduleDesktopClose(): void {
    this.cancelDesktopClose();

    this.desktopCloseTimer = setTimeout(() => {
      this.desktopMenuOpen = null;
      this.desktopCloseTimer = null;
    }, 300);
  }

  // Closes the desktop dropdown.
  closeDesktopMenu(): void {
    this.cancelDesktopClose();
    this.desktopMenuOpen = null;
  }

  // Toggles the mobile navigation menu.
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      this.restoreBodyScroll();
    }
  }

  // Toggles the Personal submenu on mobile.
  toggleMobilePersonalMenu(): void {
    this.mobilePersonalMenuOpen = !this.mobilePersonalMenuOpen;
    this.mobileNriMenuOpen = false;
  }

  // Toggles the NRI submenu on mobile.
  toggleMobileNriMenu(): void {
    this.mobileNriMenuOpen = !this.mobileNriMenuOpen;
    this.mobilePersonalMenuOpen = false;
  }

  // Closes the mobile menu.
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobilePersonalMenuOpen = false;
    this.mobileNriMenuOpen = false;

    this.restoreBodyScroll();
  }

  // Restores normal page scrolling.
  private restoreBodyScroll(): void {
    document.body.style.overflow = '';
  }

  // Resets mobile state when switching to desktop.
  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 1000) {
      this.closeMobileMenu();
      this.closeDesktopMenu();
    }
  }

  // Cleans up the timer and body state.
  ngOnDestroy(): void {
    this.cancelDesktopClose();
    this.restoreBodyScroll();
  }
}