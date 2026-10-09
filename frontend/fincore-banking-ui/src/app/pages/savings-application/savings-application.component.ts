
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountOpeningService } from '../../services/account-opening.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-savings-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './savings-application.component.html',
  styleUrl: './savings-application.component.css'
})
export class SavingsApplicationComponent {

  // FEATURE: Track the current step in the application wizard.
  currentStep = 0;

  // FEATURE: Initialize FormBuilder before creating the form.
  private readonly fb = inject(FormBuilder);

  // FEATURE: Account Opening API integration
  private readonly accountOpeningService =
  inject(AccountOpeningService);

// FEATURE: Store the application draft ID
applicationDraftId: string | null = null;

  // FEATURE: Submission state
  isSubmitting = false;
  applicationRequestId: string | null = null;

  otp = '';
  otpSent = false;
  emailVerified = false;
  isOtpSending = false;
  isOtpVerifying = false;
  otpMessage = '';
  otpError = '';

  // FEATURE: Store the personal details form and validation rules.
  personalForm = this.fb.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]
    ],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    panNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[1-9][0-9]{5}$/)
      ]
    ]
  });

  // FEATURE: Provide the Indian states for the dropdown.
  readonly states = [
    'Andhra Pradesh',
    'Assam',
    'Bihar',
    'Delhi',
    'Gujarat',
    'Karnataka',
    'Kerala',
    'Maharashtra',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'West Bengal',
    'Other'
  ];


  // FEATURE: Check whether a field is invalid after user interaction.
  isInvalid(fieldName: string): boolean {
    const field = this.personalForm.get(fieldName);

    return !!field &&
      field.invalid &&
      (field.touched || field.dirty);
  }

  // FEATURE: Convert PAN input to uppercase automatically.
  onPanInput(): void {
    const control = this.personalForm.get('panNumber');

    control?.setValue(
      (control.value ?? '').toUpperCase(),
      { emitEvent: false }
    );
  }


  // FEATURE: Move to Additional Details
  continueToNextStep(): void {
    this.personalForm.markAllAsTouched();

    if (this.personalForm.invalid) {
      return;
    }

    if (!this.emailVerified) {
    this.otpError = 'Please verify your email before continuing.';
    return;
  }

    this.currentStep = 1;
  }

  
  // FEATURE: Additional Details and Nominee Form
  additionalForm = this.fb.group({
    occupation: ['', Validators.required],
    annualIncome: ['', Validators.required],
    maritalStatus: ['', Validators.required],
    accountType: ['Savings', Validators.required],
    communicationPreference: ['Email', Validators.required],

    nomineeName: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]],
    nomineeRelationship: ['', Validators.required],
    nomineeDateOfBirth: ['', Validators.required]
  });

  // FEATURE: Validate Additional Details
  continueFromAdditionalDetails(): void {
    this.additionalForm.markAllAsTouched();

    if (this.additionalForm.invalid) {
      return;
    }

    // Step 3 (Documents) will be implemented next.
    this.currentStep = 2;
  }

  // FEATURE: Return to Personal Details
  goToPreviousStep(): void {
    this.currentStep = 0;
  }

  // FEATURE: Additional Form Field Validation
  isAdditionalInvalid(fieldName: string): boolean {
    const field = this.additionalForm.get(fieldName);

    return !!field &&
      field.invalid &&
      (field.touched || field.dirty);
  }

  // FEATURE: Document Upload Form
documentsForm = this.fb.group({
  panDocument: [null as File | null, Validators.required],
  identityDocument: [null as File | null, Validators.required],
  addressDocument: [null as File | null, Validators.required],
  applicantPhoto: [null as File | null, Validators.required]
});

// FEATURE: Store selected document names
selectedDocuments: { [key: string]: string } = {};

// FEATURE: Handle document selection
onDocumentSelected(event: Event, fieldName: string): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];

  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    alert('PDF, JPG or PNG files only are allowed.');
    input.value = '';
    return;
  }

  if (file.size > maxSize) {
    alert('File size must not exceed 5 MB.');
    input.value = '';
    return;
  }

  this.documentsForm.get(fieldName)?.setValue(file);
  this.documentsForm.get(fieldName)?.markAsTouched();
  this.selectedDocuments[fieldName] = file.name;
}

// FEATURE: Validate documents and continue
continueFromDocuments(): void {
  this.documentsForm.markAllAsTouched();

  if (this.documentsForm.invalid) {
    return;
  }

  this.currentStep = 3;
}

// FEATURE: Return to Additional Details
goToAdditionalDetails(): void {
  this.currentStep = 1;
}

// FEATURE: Validate document fields
isDocumentInvalid(fieldName: string): boolean {
  const field = this.documentsForm.get(fieldName);
  return !!field && field.invalid &&
    (field.touched || field.dirty);
}

// FEATURE: Return to Documents Step
goToDocuments(): void {
  this.currentStep = 2;
}


  // FEATURE: Submit savings account application
  submitApplication(): void {
    this.personalForm.markAllAsTouched();
    this.additionalForm.markAllAsTouched();
    this.documentsForm.markAllAsTouched();

    if (
      this.personalForm.invalid ||
      this.additionalForm.invalid ||
      this.documentsForm.invalid
    ) {
      alert('Please complete all required fields and documents.');
      return;
    }

    if (!this.applicationDraftId) {
      alert('Application draft is missing. Please start again.');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const payload = {
      applicationDraftId: this.applicationDraftId,
      personalDetails: this.personalForm.getRawValue(),
      additionalDetails: this.additionalForm.getRawValue(),
      documents: {
        panDocument: this.selectedDocuments['panDocument'],
        identityDocument: this.selectedDocuments['identityDocument'],
        addressDocument: this.selectedDocuments['addressDocument'],
        applicantPhoto: this.selectedDocuments['applicantPhoto']
      }
    };

    this.isSubmitting = true;

    this.accountOpeningService
      .submitApplication(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.applicationRequestId = response.applicationRequestId;

          alert(
            `Application submitted successfully!\n` +
            `Request ID: ${response.applicationRequestId}\n` +
            `Status: ${response.status}`
          );
        },
        error: (error) => {
          console.error('Application submission failed:', error);

          alert(
            error?.error?.message ??
            'Unable to submit application. Please try again.'
          );
        }
      });
  }

// FEATURE: Create application draft through backend
createApplicationDraft(): void {
  this.accountOpeningService.createDraft().subscribe({
    next: (response) => {
      this.applicationDraftId = response.applicationDraftId;
      console.log('Application draft created:', this.applicationDraftId);
    },
    error: (error) => {
      console.error('Draft creation failed:', error);
      alert('Unable to start the application. Please try again.');
    }
  });
}

// FEATURE: Send Email OTP
sendEmailOtp(): void {
  const emailControl = this.personalForm.get('email');

  if (!emailControl || emailControl.invalid) {
    emailControl?.markAsTouched();
    this.otpError = 'Please enter a valid email address.';
    return;
  }

  this.isOtpSending = true;
  this.otpMessage = '';
  this.otpError = '';

  const email = String(emailControl.value).trim();

  if (this.applicationDraftId) {
    this.sendOtpForDraft(email, this.applicationDraftId);
    return;
  }

  this.accountOpeningService.createDraft().subscribe({
    next: (response) => {
      this.applicationDraftId = response.applicationDraftId;
      this.sendOtpForDraft(email, response.applicationDraftId);
    },
    error: () => {
      this.isOtpSending = false;
      this.otpError = 'Unable to create application draft. Please try again.';
    }
  });
}

// FEATURE: Send OTP for Existing Draft
private sendOtpForDraft(email: string, draftId: string): void {
  this.accountOpeningService.sendOtp({
    email,
    applicationDraftId: draftId
  })
  .pipe(finalize(() => this.isOtpSending = false))
  .subscribe({
    next: () => {
      this.otpSent = true;
      this.emailVerified = false;
      this.otpMessage = 'OTP sent successfully to your email.';
      this.otpError = '';
    },
    error: (error) => {
      this.otpError =
        error?.error?.message ?? 'Unable to send OTP. Please try again.';
    }
  });
}


 // FEATURE: Verify Email OTP
  verifyEmailOtp(): void {
    if (!this.applicationDraftId) {
      this.otpError = 'Please request an OTP first.';
      return;
    }

    const email = String(
      this.personalForm.get('email')?.value ?? ''
    ).trim();

    if (!/^\d{6}$/.test(this.otp)) {
      this.otpError = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.isOtpVerifying = true;
    this.otpError = '';
    this.otpMessage = '';

    this.accountOpeningService.verifyOtp({
      email,
      otp: this.otp,
      applicationDraftId: this.applicationDraftId
    })
    .pipe(finalize(() => this.isOtpVerifying = false))
    .subscribe({
      next: (response) => {
        this.emailVerified = response.emailVerified;
        this.otpMessage = response.message ||
          'Email verified successfully.';
        this.otpError = '';
      },
      error: (error) => {
        this.emailVerified = false;
        this.otpError =
          error?.error?.message ??
          'OTP verification failed. Please try again.';
      }
    });
  }

  // FEATURE: Reset OTP Verification When Email Changes
  onEmailChanged(): void {
    this.emailVerified = false;
    this.otpSent = false;
    this.otp = '';
    this.otpMessage = '';
    this.otpError = '';
  }

  // FEATURE: OTP Input Validation
  onOtpChanged(value: string): void {
    this.otp = value.replace(/[^0-9]/g, '').slice(0, 6);
  }

}
