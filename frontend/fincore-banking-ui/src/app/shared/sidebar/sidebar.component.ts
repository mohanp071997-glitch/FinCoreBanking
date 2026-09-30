import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  isCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Logs out the current user.
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Toggles the sidebar state.
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}