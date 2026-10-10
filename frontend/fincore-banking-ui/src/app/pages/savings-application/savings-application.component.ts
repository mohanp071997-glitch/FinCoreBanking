
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


  // FEATURE: Application success popup
  showSuccessPopup = false;

  // FEATURE: OTP modal and resend countdown
  showOtpModal = false;
  resendSeconds = 0;

  // FEATURE: Toast notification
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // FEATURE: Track resend operation
  private isResendingOtp = false;

  private resendTimer: ReturnType<typeof setInterval> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

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
    // FEATURE: Validate all application forms
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

    // FEATURE: Ensure application draft exists
    if (!this.applicationDraftId) {
      alert('Application draft is missing. Please start again.');
      return;
    }

    // FEATURE: Ensure email OTP is verified
    if (!this.emailVerified) {
      alert('Please verify your email before submitting the application.');
      return;
    }

    // FEATURE: Prevent duplicate submissions
    if (this.isSubmitting || this.applicationRequestId) {
      return;
    }

    // FEATURE: Get actual uploaded files
    const panDocument =
      this.documentsForm.get('panDocument')?.value;

    const identityDocument =
      this.documentsForm.get('identityDocument')?.value;

    const addressDocument =
      this.documentsForm.get('addressDocument')?.value;

    const applicantPhoto =
      this.documentsForm.get('applicantPhoto')?.value;

    // FEATURE: Validate required documents
    if (
      !panDocument ||
      !identityDocument ||
      !addressDocument ||
      !applicantPhoto
    ) {
      alert('Please upload all required documents.');
      return;
    }

    // FEATURE: Prepare application submission payload
    const payload = {
      applicationDraftId: this.applicationDraftId,
      personalDetails: this.personalForm.getRawValue(),
      additionalDetails: this.additionalForm.getRawValue(),
      panDocument,
      identityDocument,
      addressDocument,
      applicantPhoto
    };

    // FEATURE: Start submission
    this.isSubmitting = true;

    this.accountOpeningService
      .submitApplication(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        // FEATURE: Handle successful submission
        next: (response) => {
          this.applicationRequestId =
            response.applicationRequestId;
             this.showSuccessPopup = true;
        },

        // FEATURE: Handle submission failure
        error: (error) => {
          console.error(
            'Application submission failed:',
            error
          );

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


  // FEATURE: Send initial OTP or resend OTP
  sendEmailOtp(): void {
    const emailControl = this.personalForm.get('email');

    if (!emailControl || emailControl.invalid) {
      emailControl?.markAsTouched();
      this.otpError = 'Please enter a valid email address.';
      return;
    }

    if (
      this.isOtpSending ||
      this.emailVerified ||
      this.resendSeconds > 0
    ) {
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
      next: response => {
        this.applicationDraftId = response.applicationDraftId;
        this.sendOtpForDraft(email, response.applicationDraftId);
      },
      error: () => {
        this.isOtpSending = false;
        this.otpError = 'Unable to create application draft. Please try again.';
        this.showToast(this.otpError, 'error');
      }
    });
  }


  // FEATURE: Send OTP and start the 2-minute resend timer
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
        this.otp = '';
        this.otpError = '';
        this.otpMessage = '';

        this.showOtpModal = true;

        // FEATURE: Start/restart countdown only after successful API response
        this.startResendCountdown();

        // FEATURE: Toast only for resend, not initial send
        if (this.isResendingOtp) {
          this.showToast('OTP resent successfully to your email.', 'success');
        }
        this.isResendingOtp = false;
      },
      error: error => {
        this.isResendingOtp = false;

        this.otpError =
          error?.error?.message ?? 'Unable to send OTP. Please try again.';

        this.showToast(this.otpError, 'error');
      }
    });
  }


// FEATURE: Verify Email OTP and close popup on success
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
      this.otpMessage =
        response.message || 'Email verified successfully.';
      this.otpError = '';

      // FEATURE: Close modal only when verification succeeds
      if (this.emailVerified) {
        this.showOtpModal = false;
        this.stopResendCountdown();
        this.resendSeconds = 0;
        this.showToast(
          'Email verified successfully.',
          'success'
        );
      }
    },

    error: (error) => {
      this.emailVerified = false;
      this.otpError =
        error?.error?.message ??
        'OTP verification failed. Please try again.';
    }
  });
}



  // FEATURE: Reset OTP state when email changes
  onEmailChanged(): void {
    this.emailVerified = false;
    this.otpSent = false;
    this.otp = '';
    this.otpMessage = '';
    this.otpError = '';
    this.showOtpModal = false;
    this.resendSeconds = 0;
    this.isResendingOtp = false;

    this.stopResendCountdown();
  }

  // FEATURE: OTP Input Validation
  onOtpChanged(value: string): void {
    this.otp = value.replace(/[^0-9]/g, '').slice(0, 6);
  }


 // FEATURE: Open success popup after successful submission
 openSuccessPopup(): void {
   this.showSuccessPopup = true;
 }

 // FEATURE: Close success popup
 closeSuccessPopup(): void {
   this.showSuccessPopup = false;
 }


  // FEATURE: Copy application request ID with toast notification
  async copyRequestId(): Promise<void> {
    if (!this.applicationRequestId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        this.applicationRequestId
      );

      // FEATURE: Show toast instead of browser alert
      this.showToast(
        'Request ID copied successfully!',
        'success'
      );
    } catch {
      this.showToast(
        'Unable to copy Request ID. Please copy it manually.',
        'error'
      );
    }
  }


  // FEATURE: Resend OTP after the countdown ends
  resendEmailOtp(): void {
    if (
      this.resendSeconds > 0 ||
      this.isOtpSending ||
      this.isOtpVerifying ||
      this.emailVerified
    ) {
      return;
    }

    const email = String(
      this.personalForm.get('email')?.value ?? ''
    ).trim();

    if (!this.applicationDraftId || !email) {
      this.otpError = 'Please enter your email and request an OTP first.';
      return;
    }

    this.isResendingOtp = true;
    this.otp = '';
    this.otpError = '';
    this.otpMessage = '';
    this.isOtpSending = true;

    this.sendOtpForDraft(email, this.applicationDraftId);
  }

  // FEATURE: Start the 120-second countdown
  private startResendCountdown(): void {
    this.stopResendCountdown();
    this.resendSeconds = 120;

    this.resendTimer = setInterval(() => {
      if (this.resendSeconds > 0) {
        this.resendSeconds--;
      }

        if (this.resendSeconds === 0) {
          this.stopResendCountdown();
        }
      }, 1000);
    }

  // FEATURE: Format countdown as MM:SS
  formatResendTime(): string {
    const minutes = Math.floor(this.resendSeconds / 60);
    const seconds = this.resendSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // FEATURE: Stop resend countdown
  private stopResendCountdown(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }

  // FEATURE: Display toast notification
  private showToast(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.toastMessage = message;
    this.toastType = type;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.toastTimer = null;
    }, 3500);
  }

// FEATURE: Dismiss toast
clearToast(): void {
  this.toastMessage = '';

  if (this.toastTimer) {
    clearTimeout(this.toastTimer);
    this.toastTimer = null;
  }
}

// FEATURE: Close OTP popup
closeOtpModal(): void {
  if (this.isOtpVerifying) {
    return;
  }

  this.showOtpModal = false;
}

// FEATURE: Cleanup timers
ngOnDestroy(): void {
  this.stopResendCountdown();

  if (this.toastTimer) {
    clearTimeout(this.toastTimer);
    this.toastTimer = null;
  }
}

 // FEATURE: Return to home
 goToHome(): void {
   window.location.href = '/';
 }

 // FEATURE: Go to My Requests
 goToMyRequests(): void {
   // Replace with your actual My Requests route when available.
   this.closeSuccessPopup();
 }


}
