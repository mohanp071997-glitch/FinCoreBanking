import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { NotificationSettingsService } from '../../services/notification-settings.service';

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

    // Stores whether the MPIN has been configured.
  isMpinConfigured = false;

  constructor(private router: Router, private authService: AuthService,private notificationSettingsService: NotificationSettingsService) {}

  ngOnInit(): void {

    // Loads notification settings from database.
    this.loadNotificationSettings();

    const userPreferences =
      localStorage.getItem('userPreferences');

    if (userPreferences) {
      const preferences =
        JSON.parse(userPreferences);

      this.language =
        preferences.language ?? 'English';

      this.theme =
        preferences.theme ?? 'Light';
    }

    // Loads MPIN status.
    this.loadMpinStatus();

    // Loads two-factor authentication status.
    this.loadTwoFactorStatus();
  }
//   ngOnInit(): void {

//   // Loads the saved notification settings.
//   const notificationSettings =
//     localStorage.getItem('notificationSettings');

//   if (notificationSettings) {
//     const settings = JSON.parse(notificationSettings);

//     this.transactionAlerts =
//       settings.transactionAlerts ?? true;

//     this.loginAlerts =
//       settings.loginAlerts ?? true;

//     this.promotionalNotifications =
//       settings.promotionalNotifications ?? false;
//   }

//   // Loads the saved user preferences.
//   const userPreferences =
//     localStorage.getItem('userPreferences');

//   if (userPreferences) {
//     const preferences = JSON.parse(userPreferences);

//     this.language =
//       preferences.language ?? 'English';

//     this.theme =
//       preferences.theme ?? 'Light';
//   }

//   // Loads the MPIN status.
//   this.loadMpinStatus();

//   // Loads the two-factor authentication status.
//   this.loadTwoFactorStatus();
// }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

    // Saves notification and user preferences.
    saveSettings(): void {

      const notificationSettings = {
        transactionAlerts: this.transactionAlerts,
        loginAlerts: this.loginAlerts,
        promotionalNotifications:
          this.promotionalNotifications
      };

      this.notificationSettingsService
        .updateSettings(notificationSettings)
        .subscribe({
          next: () => {

            // Stores only UI preferences locally.
            localStorage.setItem(
              'userPreferences',
              JSON.stringify({
                language: this.language,
                theme: this.theme
              })
            );

            // Shows success toast.
            this.successMessage =
              'Settings saved successfully.';

            this.showSuccessToast = true;

            setTimeout(() => {
              this.showSuccessToast = false;
            }, 3000);
          },

          error: (error) => {
            console.error(
              'Failed to save settings:',
              error
            );

            this.successMessage =
              'Failed to save settings.';

            this.showSuccessToast = true;

            setTimeout(() => {
              this.showSuccessToast = false;
            }, 3000);
          }
        });
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

  // Opens the MPIN modal.
  openMpinModal(): void {
    this.showMpinModal = true;
    this.mpinErrorMessage = '';
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

    // Creates or changes the transaction MPIN.
  updateMpin(): void {

  // Clears the previous error message.
  this.mpinErrorMessage = '';

  // Validates the new MPIN.
  if (!this.newMpin || !this.confirmMpin) {
    this.mpinErrorMessage = 'Please complete all MPIN fields.';
    return;
  }

  // Validates the MPIN format.
  if (!/^\d{4}$/.test(this.newMpin)) {
    this.mpinErrorMessage = 'MPIN must contain exactly 4 digits.';
    return;
  }

  // Checks whether both MPIN values match.
  if (this.newMpin !== this.confirmMpin) {
    this.mpinErrorMessage =
      'New MPIN and confirm MPIN do not match.';
    return;
  }

  // Checks the current MPIN when changing an existing MPIN.
    if (this.isMpinConfigured && !this.currentMpin) {
      this.mpinErrorMessage = 'Please enter your current MPIN.';
      return;
    }

    // Creates the MPIN for first-time users.
    if (!this.isMpinConfigured) {

      this.authService.setMpin({
        newMpin: this.newMpin,
        confirmMpin: this.confirmMpin
      }).subscribe({
        next: (response) => {

          console.log(
            'MPIN created successfully:',
            response
          );

          this.closeChangeMpin();

          this.isMpinConfigured = true;

          this.successMessage =
            'Transaction MPIN created successfully.';

          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);
        },

        error: (error) => {

          console.error(
            'Failed to create MPIN:',
            error
          );

          this.mpinErrorMessage =
            error?.error?.message ||
            error?.error ||
            'Unable to create MPIN.';
        }
      });

      return;
    }

    // Changes the existing MPIN.
    this.authService.changeMpin({
      currentMpin: this.currentMpin,
      newMpin: this.newMpin,
      confirmMpin: this.confirmMpin
    }).subscribe({
      next: (response) => {

        console.log(
          'MPIN changed successfully:',
          response
        );

        // Closes the MPIN modal.
        this.closeChangeMpin();

        // Shows the success message.
        this.successMessage =
          'Transaction MPIN changed successfully.';

        this.showSuccessToast = true;

        // Hides the toast after 3 seconds.
        setTimeout(() => {
          this.showSuccessToast = false;
        }, 3000);
      },

      error: (error) => {

        console.error(
          'Failed to change MPIN:',
          error
        );

        // Displays the API error.
        this.mpinErrorMessage =
          error?.error?.message ||
          error?.error ||
          'Unable to change MPIN.';
      }
    });
  }

  // Loads the MPIN configuration status.
    loadMpinStatus(): void {

      this.authService.getMpinStatus().subscribe({
        next: (response) => {
          this.isMpinConfigured = response.isMpinConfigured;
        },

        error: (error) => {
          console.error(
            'Failed to load MPIN status:',
            error
          );

          this.isMpinConfigured = false;
        }
      });
    }

    // Updates the two-factor authentication setting.
    toggleTwoFactor(): void {

      // Sends the updated setting to the backend.
      this.authService
        .updateTwoFactor(this.twoFactorAuthentication)
        .subscribe({
          next: (response) => {

            console.log(
              'Two-factor authentication updated:',
              response
            );

            // Shows the success message.
            this.successMessage =
              this.twoFactorAuthentication
                ? 'Two-factor authentication enabled successfully.'
                : 'Two-factor authentication disabled successfully.';

            this.showSuccessToast = true;

            // Hides the toast after 3 seconds.
            setTimeout(() => {
              this.showSuccessToast = false;
            }, 3000);
          },

          error: (error) => {

            console.error(
              'Failed to update two-factor authentication:',
              error
            );

            // Reverts the toggle when the API fails.
            this.twoFactorAuthentication =
              !this.twoFactorAuthentication;

            this.successMessage =
              'Unable to update two-factor authentication.';

            this.showSuccessToast = true;

            setTimeout(() => {
              this.showSuccessToast = false;
            }, 3000);
          }
        });
    }

    // Loads the current two-factor authentication status.
    loadTwoFactorStatus(): void {

      this.authService.getTwoFactorStatus().subscribe({
        next: (response) => {

          // Updates the toggle with the database value.
          this.twoFactorAuthentication =
            response.isTwoFactorEnabled;
        },

        error: (error) => {

          console.error(
            'Failed to load two-factor status:',
            error
          );
        }
      });
    }

    // Loads the current user's notification settings.
    loadNotificationSettings(): void {
      this.notificationSettingsService.getSettings().subscribe({
        next: (settings) => {
          this.transactionAlerts =
            settings.transactionAlerts;

          this.loginAlerts =
            settings.loginAlerts;

          this.promotionalNotifications =
            settings.promotionalNotifications;
        },
        error: (error) => {
          console.error(
            'Failed to load notification settings:',
            error
          );
        }
      });
    }

    // Saves notification settings to the database.
  saveNotificationSettings(): void {
    const settings = {
      transactionAlerts: this.transactionAlerts,
      loginAlerts: this.loginAlerts,
      promotionalNotifications:
        this.promotionalNotifications
    };

    this.notificationSettingsService
      .updateSettings(settings)
      .subscribe({
        next: () => {
          console.log(
            'Notification settings updated successfully.'
          );
        },
        error: (error) => {
          console.error(
            'Failed to update notification settings:',
            error
          );
        }
      });
  }


 
}