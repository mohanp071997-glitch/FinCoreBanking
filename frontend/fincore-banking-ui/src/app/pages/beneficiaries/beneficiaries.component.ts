import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Beneficiary } from '../../interfaces/beneficiary.interface';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { CustomerService } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../interfaces/customer.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './beneficiaries.component.html',
  styleUrl: './beneficiaries.component.css'
})
export class BeneficiariesComponent implements OnInit {

  beneficiaries: Beneficiary[] = [];

  customer: Customer | null = null;

  showAddForm = false;

  // Controls the add beneficiary popup.
  showAddBeneficiary = false;



  beneficiaryName = '';
  beneficiaryAccountNumber = '';
  bankName = '';
  ifscCode = '';


  validationMessage = '';
  successMessage = '';

  constructor(
    private beneficiaryService: BeneficiaryService,
    private customerService: CustomerService,private route: ActivatedRoute
  ) {}

  // Loads beneficiaries for the logged-in customer.
  ngOnInit(): void {
    this.loadBeneficiaries();

      this.route.queryParams.subscribe(params => {
      if (params['openAdd'] === 'true') {
        this.openAddBeneficiary();
      }
    });
  }

  // Loads beneficiaries using the logged-in customer.
  loadBeneficiaries(): void {

    this.customerService.getCurrentCustomer().subscribe({
      next: (customer) => {

          this.customer = customer;

        this.beneficiaryService
          .getBeneficiariesByCustomer(customer.customerId)
          .subscribe({
            next: (response) => {
              this.beneficiaries = response;

              console.log(
                'Beneficiaries loaded:',
                response
              );
            },
            error: (error) => {
              console.error(
                'Failed to load beneficiaries:',
                error
              );
            }
          });
      },

      error: (error) => {
        console.error(
          'Failed to load customer:',
          error
        );
      }
    });
  }

  // Saves a new beneficiary.
  saveBeneficiary(): void {

    this.validationMessage = '';
    this.successMessage = '';

    /// Validates beneficiary name.
    if (!this.beneficiaryName.trim()) {
      this.validationMessage = 'beneficiaryName';
      return;
    }

    // Validates account number.
    if (!this.beneficiaryAccountNumber.trim()) {
      this.validationMessage = 'beneficiaryAccountNumber';
      return;
    }

    // Validates bank name.
    if (!this.bankName.trim()) {
      this.validationMessage = 'bankName';
      return;
    }

    // Validates IFSC code.
    if (!this.ifscCode.trim()) {
      this.validationMessage = 'ifscCode';
      return;
    }

    // Checks customer information.
    if (!this.customer) {
      this.validationMessage = 'Customer information not found.';
      return;
    }

    // Creates the beneficiary request.
    const request = {
      customerId: this.customer.customerId,
      beneficiaryName: this.beneficiaryName.trim(),
      beneficiaryAccountNumber:
        this.beneficiaryAccountNumber.trim(),
      bankName: this.bankName.trim(),
      ifscCode: this.ifscCode.trim()
    };

    // Sends the beneficiary request to the API.
    this.beneficiaryService
      .createBeneficiary(request)
      .subscribe({

        next: (response) => {

          console.log(
            'Beneficiary created successfully:',
            response
          );

          this.successMessage =
            'Beneficiary added successfully.';

          this.clearForm();

          this.showAddForm = false;

          // Refreshes the beneficiary list.
          this.loadBeneficiaries();
        },

        error: (error) => {

          console.error(
            'Failed to create beneficiary:',
            error
          );

          this.validationMessage =
            error?.error?.message ||
            error?.error ||
            'Failed to add beneficiary.';
        }
      });
  }

  // Closes the add beneficiary form.
  closeAddForm(): void {
    this.validationMessage = '';
    this.clearForm();
    this.showAddForm = false;
  }

  // Clears the beneficiary form.
  clearForm(): void {

    this.beneficiaryName = '';
    this.beneficiaryAccountNumber = '';
    this.bankName = '';
    this.ifscCode = '';
  }

    // Opens the add beneficiary form.
  openAddForm(): void {
    this.validationMessage = '';
    this.successMessage = '';
    this.showAddForm = true;
  }

    openAddBeneficiary(): void {
    this.showAddBeneficiary = true;
  }

}