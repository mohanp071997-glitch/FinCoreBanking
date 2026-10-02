import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Handles the login form submission.
  login(): void {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {

        // Checks whether two-factor authentication is required.
        if (response.requiresTwoFactor) {

          // Stores the user ID for OTP verification.
          localStorage.setItem(
            'twoFactorUserId',
            response.userId.toString()
          );

          // Stores the email for the OTP screen.
          localStorage.setItem(
            'twoFactorEmail',
            response.email
          );

          console.log('Two-factor authentication required:', response);

          // Navigates to the OTP verification page.
          this.router.navigate(['/verify-otp']);

          return;
        }

        // Stores the JWT token for normal login.
        localStorage.setItem('token', response.token);

        // Stores the logged-in user details.
        localStorage.setItem('authUser', JSON.stringify({
          userId: response.userId,
          userName: response.userName,
          email: response.email,
          lastLoginDate: response.lastLoginDate,
          role: response.role
        }));

        console.log('Login successful:', response);

        // Navigates to the dashboard.
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}