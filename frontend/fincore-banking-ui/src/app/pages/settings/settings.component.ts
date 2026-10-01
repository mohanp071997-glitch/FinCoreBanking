import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  transactionAlerts = true;
  loginAlerts = true;
  promotionalNotifications = false;

  language = 'English';
  theme = 'Light';

  showPasswordModal = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  passwordErrorMessage = '';

  showMpinModal = false;

  currentMpin = '';
  newMpin = '';
  confirmMpin = '';

  mpinErrorMessage = '';

  twoFactorAuthentication = true;
  showSuccessToast = false;
  successMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {

    const notificationSettings =
      localStorage.getItem('notificationSettings');

    if (notificationSettings) {

      const settings = JSON.parse(notificationSettings);

      this.transactionAlerts =
        settings.transactionAlerts ?? true;

      this.loginAlerts =
        settings.loginAlerts ?? true;

      this.promotionalNotifications =
        settings.promotionalNotifications ?? false;

      this.twoFactorAuthentication =
        settings.twoFactorAuthentication ?? true;
    }

    const userPreferences =
      localStorage.getItem('userPreferences');

    if (userPreferences) {

      const preferences = JSON.parse(userPreferences);

      this.language =
        preferences.language ?? 'English';

      this.theme =
        preferences.theme ?? 'Light';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  saveSettings(): void {
    localStorage.setItem(
      'notificationSettings',
      JSON.stringify({
        transactionAlerts: this.transactionAlerts,
        loginAlerts: this.loginAlerts,
        promotionalNotifications: this.promotionalNotifications,
        twoFactorAuthentication: this.twoFactorAuthentication
      })
    );

    localStorage.setItem(
      'userPreferences',
      JSON.stringify({
        language: this.language,
        theme: this.theme
      })
    );

    alert('Settings saved successfully.');
  }

    openChangePassword(): void {
    this.showPasswordModal = true;
    this.passwordErrorMessage = '';
  }

  closeChangePassword(): void {
    this.showPasswordModal = false;

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordErrorMessage = '';
  }

  updatePassword(): void {

    this.passwordErrorMessage = '';

    if (
      !this.currentPassword ||
      !this.newPassword ||
      !this.confirmPassword
    ) {
      this.passwordErrorMessage =
        'Please complete all password fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage =
        'New password and confirm password do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordErrorMessage =
        'Password must contain at least 8 characters.';
      return;
    }

    const request = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.authService.changePassword(request).subscribe({
      next: (response) => {

        console.log('Password changed:', response);

        this.closeChangePassword();

        this.successMessage = 'Password changed successfully.';
        this.showSuccessToast = true;

        setTimeout(() => {
          this.showSuccessToast = false;
        }, 3000);
      },

      error: (error) => {

        console.error(
          'Password change failed:',
          error
        );

        this.passwordErrorMessage =
          error?.error ||
          'Unable to change password.';
      }
    });
  }
    openChangeMpin(): void {
    this.showMpinModal = true;
    this.mpinErrorMessage = '';
  }

  closeChangeMpin(): void {
    this.showMpinModal = false;

    this.currentMpin = '';
    this.newMpin = '';
    this.confirmMpin = '';
    this.mpinErrorMessage = '';
  }

  updateMpin(): void {

    if (!this.currentMpin ||
        !this.newMpin ||
        !this.confirmMpin) {

      this.mpinErrorMessage =
        'Please complete all MPIN fields.';

      return;
    }

    if (!/^\d{4}$/.test(this.newMpin)) {

      this.mpinErrorMessage =
        'MPIN must contain exactly 4 digits.';

      return;
    }

    if (this.newMpin !== this.confirmMpin) {

      this.mpinErrorMessage =
        'New MPIN and confirm MPIN do not match.';

      return;
    }

    console.log('MPIN update requested.');

    this.closeChangeMpin();
  }
}