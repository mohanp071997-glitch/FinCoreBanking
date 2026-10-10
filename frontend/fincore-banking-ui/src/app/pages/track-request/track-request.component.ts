
import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { filter, finalize, Subscription } from 'rxjs';

import {
  TrackRequestDetails,
  TrackRequestService
} from '../../services/track-request.service';

// FEATURE: Breadcrumb model
interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-track-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './track-request.component.html',
  styleUrl: './track-request.component.css'
})
export class TrackRequestComponent implements OnInit, OnDestroy {

  // FEATURE: Inject services
  private readonly fb = inject(FormBuilder);
  private readonly trackingService = inject(TrackRequestService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly activatedRoute = inject(ActivatedRoute);

  // FEATURE: Router subscription
  private routerSubscription?: Subscription;

  // FEATURE: Route name mapping
  private readonly breadcrumbLabels: Record<string, string> = {
    personal: 'Personal',
    accounts: 'Accounts',
    'open-savings-account': 'Open Savings Account',
    'track-request': 'Track Request',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    beneficiaries: 'Beneficiaries',
    profile: 'Profile',
    'fund-transfer': 'Fund Transfer'
  };

  // FEATURE: Request tracking form
  trackingForm = this.fb.group({
    requestId: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{12}$/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]]
  });

  // FEATURE: OTP verification form
  otpForm = this.fb.group({
    otp: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{6}$/)
    ]]
  });

  // FEATURE: Tracking state
  otpSent = false;
  otpVerified = false;
  isLoading = false;

  errorMessage = '';
  successMessage = '';
  maskedEmail = '';

  requestDetails: TrackRequestDetails | null = null;

  // FEATURE: Initialize dynamic breadcrumb
  ngOnInit(): void {
    this.updateBreadcrumbs();

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  // FEATURE: Release router subscription
  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // FEATURE: Build breadcrumb from current route
  private updateBreadcrumbs(): void {
    const currentUrl = this.router.url
      .split('?')[0]
      .split('#')[0];

    const segments = currentUrl
      .split('/')
      .filter(Boolean);

    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        url: '/'
      }
    ];

    let accumulatedUrl = '';

    for (const segment of segments) {
      accumulatedUrl += `/${segment}`;

      const decodedSegment = decodeURIComponent(segment);
      const normalizedSegment = decodedSegment.toLowerCase();

      const label =
        this.breadcrumbLabels[normalizedSegment] ??
        this.toTitleCase(decodedSegment);

      items.push({
        label,
        url: accumulatedUrl
      });
    }

  }

  // FEATURE: Format unknown route segments
  private toTitleCase(value: string): string {
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  // FEATURE: Back navigation
  goBack(): void {
    const navigationState = this.location.getState() as {
      navigationId?: number;
    };

    // FEATURE: Use browser history when available
    if (
      window.history.length > 1 &&
      navigationState?.navigationId !== 0
    ) {
      this.location.back();
      return;
    }

    // FEATURE: Fallback to parent route or home
    const parentRoute = this.activatedRoute.snapshot.parent;

    if (parentRoute) {
      void this.router.navigate(['../'], {
        relativeTo: this.activatedRoute
      });
      return;
    }

    void this.router.navigate(['/']);
  }

  // FEATURE: Send tracking OTP
  sendOtp(): void {
    this.trackingForm.markAllAsTouched();

    if (this.trackingForm.invalid || this.isLoading) {
      return;
    }

    const requestId =
      this.trackingForm.controls.requestId.value!.trim();

    const email =
      this.trackingForm.controls.email.value!.trim();

    this.errorMessage = '';
    this.successMessage = '';
    this.requestDetails = null;
    this.otpVerified = false;
    this.otpSent = false;
    this.otpForm.reset();

    this.isLoading = true;

    this.trackingService
      .sendOtp({ requestId, email })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {
          this.otpSent = true;
          this.maskedEmail = response.maskedEmail ?? email;

          this.successMessage =
            response.message ||
            'OTP sent to your registered email.';
        },

        error: error => {
          this.errorMessage =
            error?.error?.message ??
            'Unable to send OTP. Please check your details and try again.';
        }
      });
  }

  // FEATURE: Verify OTP and retrieve request details
  verifyOtp(): void {
    this.otpForm.markAllAsTouched();

    if (this.otpForm.invalid || this.isLoading) {
      return;
    }

    const requestId =
      this.trackingForm.controls.requestId.value!.trim();

    const email =
      this.trackingForm.controls.email.value!.trim();

    const otp = this.otpForm.controls.otp.value!;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.trackingService
      .verifyOtp({ requestId, email, otp })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {
          this.requestDetails = response;
          this.otpVerified = true;

          this.successMessage =
            'Request details retrieved successfully.';
        },

        error: error => {
          this.errorMessage =
            error?.error?.message ??
            'OTP verification failed. Please try again.';
        }
      });
  }

  // FEATURE: Reset tracking search
  resetTracking(): void {
    this.trackingForm.reset();
    this.otpForm.reset();

    this.otpSent = false;
    this.otpVerified = false;
    this.isLoading = false;

    this.errorMessage = '';
    this.successMessage = '';
    this.maskedEmail = '';

    this.requestDetails = null;
  }

}
