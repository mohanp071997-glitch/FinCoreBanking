import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink,NgIf,NgClass],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  // Controls the password recovery step.
  currentStep: 'email' | 'otp' | 'password' = 'email';

  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;

  errorMessage = '';
  successMessage = '';
 

  currentYear = new Date().getFullYear();

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Injects AuthService.
  constructor(private authService: AuthService) {}

  // Sends the OTP request.
  sendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage =
        'Please enter your registered email address.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        console.log(
          'Forgot password API response:',
          response
        );

        // Move to OTP step only after API succeeds.
        this.currentStep = 'otp';

        this.successMessage =
          'OTP has been sent to your registered email address.';
      },

      error: (error: any) => {
        console.error(
          'Forgot password API failed:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to process your request. Please try again.';
      }
    });
  }

  // Verifies the entered OTP.
  verifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!/^\d{6}$/.test(this.otpCode)) {
      this.showToast(
        'Please enter a valid 6-digit OTP.',
        'error'
      );
      return;
    }

    this.authService.verifyPasswordResetOtp(
      this.email,
      this.otpCode
    ).subscribe({
      next: (response: any) => {

        console.log(
          'Password reset OTP verified:',
          response
        );

        this.currentStep = 'password';

        this.showToast(
          'OTP verified successfully.',
          'success'
        );
      },

      error: (error: any) => {

        console.error(
          'Password reset OTP verification failed:',
          error
        );

        this.currentStep = 'otp';

        this.showToast(
          error?.error?.message ||
          'Invalid OTP. Please try again.',
          'error'
        );
      }
    });
  }

  // Resends the OTP.
  resendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        console.log('OTP resent:', response);

        this.successMessage =
          'A new OTP has been sent to your registered email address.';
      },

      error: (error: any) => {
        console.error('Resend OTP failed:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to resend OTP. Please try again.';
      }
    });
  }

  // Changes the password.
  resetPassword(): void {

    // New password empty
    if (!this.newPassword) {
      this.showToast(
        'Please enter a new password.',
        'error'
      );
      return;
    }

    // Check password requirements individually
    if (!this.hasMinLength()) {
      this.showToast(
        'Password must contain at least 8 characters.',
        'error'
      );
      return;
    }

    if (!this.hasUppercase()) {
      this.showToast(
        'Password must contain at least one uppercase letter.',
        'error'
      );
      return;
    }

    if (!this.hasLowercase()) {
      this.showToast(
        'Password must contain at least one lowercase letter.',
        'error'
      );
      return;
    }

    if (!this.hasNumber()) {
      this.showToast(
        'Password must contain at least one number.',
        'error'
      );
      return;
    }

    if (!this.hasSpecialCharacter()) {
      this.showToast(
        'Password must contain at least one special character.',
        'error'
      );
      return;
    }

    // Confirm password empty
    if (!this.confirmPassword) {
      this.showToast(
        'Please confirm your password.',
        'error'
      );
      return;
    }

    // Password mismatch
    if (this.newPassword !== this.confirmPassword) {
      this.showToast(
        'Passwords do not match.',
        'error'
      );
      return;
    }

    // All validations passed
    this.authService.resetPassword(
      this.email,
      this.otpCode,
      this.newPassword
    ).subscribe({

      next: (response: any) => {

        console.log(
          'Password reset response:',
          response
        );

        // ✅ Clear input fields
        this.newPassword = '';
        this.confirmPassword = '';

        // ✅ Reset eye icon/password visibility
        this.showNewPassword = false;

        // ✅ Success message
        this.showToast(
          'Your password has been reset successfully.',
          'success'
        );
      },

      error: (error: any) => {

        console.error(
          'Password reset failed:',
          error
        );

        this.showToast(
          error?.error?.message ||
          'Unable to reset password. Please try again.',
          'error'
        );
      }
    });
  }

  // Returns to the previous recovery step.
  goBack(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.currentStep === 'otp') {
      this.currentStep = 'email';
      return;
    }

    if (this.currentStep === 'password') {
      this.currentStep = 'otp';
    }
  }

  // Allows the user to change the entered email address.
  changeEmail(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Clear email
    this.email = '';

    // Clear OTP
    this.otpCode = '';

    // Go back to email step
    this.currentStep = 'email';
  }

    showToast(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.closeToast();
    }, 4000);
  }

  closeToast(): void {
    this.toastMessage = '';
  }

hasMinLength(): boolean {
  return this.newPassword.length >= 8;
}

hasUppercase(): boolean {
  return /[A-Z]/.test(this.newPassword);
}

hasLowercase(): boolean {
  return /[a-z]/.test(this.newPassword);
}

hasNumber(): boolean {
  return /\d/.test(this.newPassword);
}

hasSpecialCharacter(): boolean {
  return /[@$!%*?&]/.test(this.newPassword);
}
}