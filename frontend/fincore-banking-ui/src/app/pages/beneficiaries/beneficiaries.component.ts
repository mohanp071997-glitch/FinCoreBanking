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

  currentPage = 1;

  pageSize = 5;

  searchTerm = '';

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

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
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

    // ================= PAGINATION =================


  // Total number of pages
  get totalPages(): number {

    return Math.ceil(
      this.filteredBeneficiaries.length / this.pageSize
    );

  }


  // Records displayed on current page
  get paginatedBeneficiaries(): Beneficiary[] {

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    return this.filteredBeneficiaries.slice(
      startIndex,
      endIndex
    );

  }


  // Starting record number
    get startResult(): number {

    if (this.filteredBeneficiaries.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
        this.pageSize
      + 1
    );

  }


  // Ending record number
  get endResult(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredBeneficiaries.length
    );

  }


  // Page numbers
  get paginationPages(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );

  }


  // Change page
  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

  }


  // Change page size
  onPageSizeChange(): void {

    this.currentPage = 1;

  }

  // Global search across all beneficiary fields.
  get filteredBeneficiaries(): Beneficiary[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return this.beneficiaries;
    }

    return this.beneficiaries.filter(beneficiary => {

      return (
        beneficiary.beneficiaryName?.toLowerCase().includes(search) ||
        beneficiary.beneficiaryAccountNumber?.toLowerCase().includes(search) ||
        beneficiary.bankName?.toLowerCase().includes(search) ||
        beneficiary.ifscCode?.toLowerCase().includes(search) ||
        beneficiary.beneficiaryStatus?.toLowerCase().includes(search)
      );

    });
  }

    onSearchChange(): void {

    this.currentPage = 1;

  }

  
}