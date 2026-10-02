import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent {
  otpCode = '';
  email = '';
  userId = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Gets the temporary user ID.
    const userId = localStorage.getItem('twoFactorUserId');

    // Gets the registered email address.
    const email = localStorage.getItem('twoFactorEmail');

    if (!userId || !email) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = Number(userId);
    this.email = email;
  }

  // Verifies the entered OTP.
  verifyOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      return;
    }

    this.authService.verifyOtp({
      userId: this.userId,
      otpCode: this.otpCode
    }).subscribe({
      next: (response) => {

        // Stores the JWT token after successful OTP verification.
        localStorage.setItem('token', response.token);

        // Stores the logged-in user details.
        localStorage.setItem('authUser', JSON.stringify({
          userId: response.userId,
          userName: response.userName,
          email: response.email,
          lastLoginDate: response.lastLoginDate,
          role: response.role
        }));

        // Removes temporary two-factor data.
        localStorage.removeItem('twoFactorUserId');
        localStorage.removeItem('twoFactorEmail');

        // Navigates to the dashboard.
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('OTP verification failed:', error);
      }
    });
  }
}