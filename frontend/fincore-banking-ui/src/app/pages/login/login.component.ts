import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MobileLoginResponse } from '../../interfaces/mobile-login-response.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  mobileNumber = '';

  loginMode: 'username' | 'mobile' = 'username';

  currentYear = new Date().getFullYear();

  // Controls whether the mobile OTP section is displayed.
  showMobileOtp = false;

  // Stores the mobile login user ID.
  mobileLoginUserId = 0;

  // Stores the OTP entered by the user.
  mobileOtp = '';

  // Stores mobile OTP error messages.
  mobileOtpError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Changes the login method.
  selectLoginMode(mode: 'username' | 'mobile'): void {
    this.loginMode = mode;
  }

  // Handles username and password login.
  login(): void {

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (response) => {

        // Checks whether two-factor authentication is required.
        if (response.requiresTwoFactor) {

          // Stores the user ID for OTP verification.
          sessionStorage.setItem(
            'twoFactorUserId',
            response.userId.toString()
          );

          // Stores the email for the OTP screen.
          sessionStorage.setItem(
            'twoFactorEmail',
            response.email
          );

          console.log(
            'Two-factor authentication required:',
            response
          );

          // FEATURE: Inspect login API response
          console.log('Login response:', JSON.stringify(response, null, 2));
          console.log('Response role:', response.roles);

          // Navigates to the OTP verification page.
          this.router.navigate(['/verify-otp']);

          return;
        }

        // Stores the JWT token for normal login.
        sessionStorage.setItem(
          'token',
          response.token
        );

        // Stores the logged-in user details.
        sessionStorage.setItem(
          'authUser',
          JSON.stringify({
            userId: response.userId,
            userName: response.userName,
            email: response.email,
            lastLoginDate: response.lastLoginDate,
            roles: response.roles
          })
        );

        console.log(
          'Login successful:',
          response
        );

        this.authService.notifyLoginSuccess();

        // FEATURE: Navigate according to the authenticated user's role
        this.redirectByRole(response.roles);
      },

      error: (error) => {
        console.error(
          'Login failed:',
          error
        );
      }
    });
  }

  // Handles mobile login.
  // Starts mobile number login and requests an OTP.
  mobileLogin(): void {
    // Validates the mobile number.
    if (!/^\d{10}$/.test(this.mobileNumber)) {
      console.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Calls the mobile login API.
    this.authService.mobileLogin(this.mobileNumber).subscribe({
      next: (response) => {
        // Stores the user ID for OTP verification.
        this.mobileLoginUserId = response.userId;

        // Shows the OTP section on the same page.
        this.showMobileOtp = true;

        // Clears any previous OTP error.
        this.mobileOtpError = '';

        console.log('Mobile OTP generated:', response);
      },

      error: (error) => {
        console.error('Mobile login failed:', error);
      }
    });
  }

  // Verifies the mobile OTP and completes login.
  verifyMobileOtp(): void {
    // Clears the previous error.
    this.mobileOtpError = '';

    // Validates the OTP format.
    if (!/^\d{6}$/.test(this.mobileOtp)) {
      this.mobileOtpError = 'Please enter a valid 6-digit OTP.';
      return;
    }

    // Calls the mobile OTP verification API.
    this.authService.verifyMobileOtp(
      this.mobileLoginUserId,
      this.mobileOtp
    ).subscribe({
      next: (response) => {

        // Stores the JWT token.
        sessionStorage.setItem('token', response.token);

       
      // FEATURE: Store the logged-in user details
      sessionStorage.setItem(
        'authUser',
        JSON.stringify({
          userId: response.userId,
          userName: response.userName,
          email: response.email,
          lastLoginDate: response.lastLoginDate,
          roles: [response.role]
        })
      );

      // Notify HeaderComponent about successful login.
      this.authService.notifyLoginSuccess();

      // FEATURE: Clear mobile OTP data
      this.mobileOtp = '';
      this.showMobileOtp = false;

      // FEATURE: Redirect based on the mobile login role
      this.redirectByRole(response.role);

      },

      error: (error) => {
        this.mobileOtpError =
          error?.error?.message ||
          'Invalid or expired OTP.';
      }
    });
  }



  // FEATURE: Redirect user based on assigned roles
  private redirectByRole(
    roles: string[] | string | null | undefined
  ): void {
    const userRoles = Array.isArray(roles)
      ? roles.map(role => role.trim().toLowerCase())
      : typeof roles === 'string'
        ? [roles.trim().toLowerCase()]
        : [];

    if (userRoles.length === 0) {
      this.authService.logout();
      this.router.navigate(['/login']);
      console.error('No roles found in login response.');
      return;
    }

    // FEATURE: Prioritize Reviewer dashboard
    if (userRoles.includes('reviewer')) {
      this.router.navigate(['/reviewer/dashboard']);
    } else if (userRoles.includes('approver')) {
      this.router.navigate(['/approver-dashboard']);
    } else if (userRoles.includes('admin')) {
      this.router.navigate(['/admin-dashboard']);
    } else if (userRoles.includes('customer')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
      console.error('Unknown user roles:', userRoles);
    }
  }

  // Navigates to the forgot password page.
  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

}