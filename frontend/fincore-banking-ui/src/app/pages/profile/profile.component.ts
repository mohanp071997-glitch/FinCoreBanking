import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Customer } from '../../interfaces/customer.interface';
import { Account } from '../../interfaces/account.interface';

import { CustomerService } from '../../services/customer.service';
import { AccountService } from '../../services/account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  customer: Customer | null = null;
  selectedAccount: Account | null = null;

  lastLoginDate: string | null = null;

  // Controls whether profile editing is enabled.
  isEditMode = false;

  // Controls address edit mode.
  isAddressEditMode = false;

  // Controls address save confirmation popup.
  showAddressSaveConfirmation = false;

  // Stores the original address before editing.
  originalAddress = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  };

  successMessage = '';
  errorMessage = '';
  // Controls the save confirmation popup.
  showSaveConfirmation = false;

  // Stores the original customer data before editing.
  originalCustomer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private accountService: AccountService,
    private router: Router
  ) {}

  // Loads profile information.
  ngOnInit(): void {
    this.loadCustomer();
    this.loadAccount();
    this.loadLastLogin();
  }

  // Loads the last successful login time.
  loadLastLogin(): void {
    const authUser = localStorage.getItem('authUser');

    console.log('authUser from localStorage:', authUser);

    if (authUser) {
      const user = JSON.parse(authUser);
      this.lastLoginDate = user.lastLoginDate ?? null;
    }
  }

  // Loads the logged-in customer.
  loadCustomer(): void {
    this.customerService.getCurrentCustomer().subscribe({
      next: (response) => {
        this.customer = response;

      // Stores a copy of the original customer data.
      this.originalCustomer = structuredClone(response);
      },
      error: (error) => {
        console.error('Failed to load customer:', error);
      }
    });
  }

  // Loads the primary customer account.
  loadAccount(): void {
    this.accountService.getCurrentAccounts().subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.selectedAccount = response[0];
        }
      },
      error: (error) => {
        console.error('Failed to load account:', error);
      }
    });
  }

  // Navigates back to the dashboard.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Enables profile editing.
  enableEdit(): void {
    if (this.customer) {
      // Creates a fresh copy before editing starts.
      this.originalCustomer = structuredClone(this.customer);
    }

    this.isEditMode = true;
  }

  // Cancels profile editing and restores original values.
  cancelEdit(): void {
    if (this.originalCustomer) {
      this.customer = structuredClone(this.originalCustomer);
    }

    this.isEditMode = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Opens the save confirmation popup.
  confirmSave(): void {
    this.showSaveConfirmation = true;
  }

  // Cancels the save confirmation.
  cancelSaveConfirmation(): void {
    this.showSaveConfirmation = false;
  }

      // Saves the updated customer profile.
      saveChanges(): void {
        if (!this.customer) {
          return;
        }

        this.showSaveConfirmation = false;
        this.successMessage = '';
        this.errorMessage = '';

        this.customerService
          .updateCustomer(this.customer.customerId, this.customer)
          .subscribe({
            next: (response) => {
            this.customer = response;

            // Updates the original copy after a successful save.
            this.originalCustomer = structuredClone(response);

            this.isEditMode = false;
            this.successMessage = 'Profile updated successfully.';

              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            },
            error: (error) => {
              console.error('Failed to update profile:', error);
              this.errorMessage = 'Failed to update profile. Please try again.';
            }
          });
        }

        // Enables address editing.
  enableAddressEdit(): void {
    if (this.customer) {
      this.originalAddress = {
        addressLine1: this.customer.addressLine1,
        addressLine2: this.customer.addressLine2 ?? '',
        city: this.customer.city,
        state: this.customer.state,
        postalCode: this.customer.postalCode
      };
    }

    this.isAddressEditMode = true;
  }

  // Cancels address editing and restores original values.
  cancelAddressEdit(): void {
    if (this.customer) {
      this.customer.addressLine1 = this.originalAddress.addressLine1;
      this.customer.addressLine2 = this.originalAddress.addressLine2;
      this.customer.city = this.originalAddress.city;
      this.customer.state = this.originalAddress.state;
      this.customer.postalCode = this.originalAddress.postalCode;
    }

    this.isAddressEditMode = false;
  }

  // Opens the address save confirmation popup.
  confirmAddressSave(): void {
    this.showAddressSaveConfirmation = true;
  }

  // Closes the address save confirmation popup.
  cancelAddressSaveConfirmation(): void {
    this.showAddressSaveConfirmation = false;
  }

  // Saves the updated address.
  saveAddress(): void {
    if (!this.customer) {
      return;
    }

    this.showAddressSaveConfirmation = false;
    this.successMessage = '';
    this.errorMessage = '';

    this.customerService
      .updateCustomer(this.customer.customerId, this.customer)
      .subscribe({
        next: (response) => {
          this.customer = response;
          this.originalCustomer = structuredClone(response);

          this.originalAddress = {
            addressLine1: response.addressLine1,
            addressLine2: response.addressLine2 ?? '',
            city: response.city,
            state: response.state,
            postalCode: response.postalCode
          };

          this.isAddressEditMode = false;
          this.successMessage = 'Address updated successfully.';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to update address:', error);
          this.errorMessage = 'Failed to update address. Please try again.';
        }
      });
  }
}