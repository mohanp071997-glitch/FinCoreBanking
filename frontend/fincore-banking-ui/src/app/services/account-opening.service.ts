
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// FEATURE: Draft API response
export interface CreateDraftResponse {
  applicationDraftId: string;
  message: string;
}

// FEATURE: Application submission response
export interface SubmitApplicationResponse {
  applicationRequestId: string;
  status: string;
  message: string;
}

// FEATURE: Account Opening API Service
@Injectable({
  providedIn: 'root'
})
export class AccountOpeningService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7208/api/AccountOpening';

  // FEATURE: Create application draft
  createDraft(): Observable<CreateDraftResponse> {
    return this.http.post<CreateDraftResponse>(
      `${this.apiUrl}/draft`,
      {}
    );
  }

  // FEATURE: Submit application
  submitApplication(payload: {
    applicationDraftId: string;
    personalDetails: Record<string, unknown>;
    additionalDetails: Record<string, unknown>;
    documents: Record<string, string | undefined>;
  }): Observable<SubmitApplicationResponse> {
    return this.http.post<SubmitApplicationResponse>(
      `${this.apiUrl}/submit`,
      payload
    );
  }

    sendOtp(payload: {
    email: string;
    applicationDraftId: string;
    }) {
    return this.http.post(
        `${this.apiUrl}/send-otp`,
        payload
    );
    }

    verifyOtp(payload: {
    email: string;
    otp: string;
    applicationDraftId: string;
    }) {
    return this.http.post<{
        emailVerified: boolean;
        applicationDraftId: string;
        message: string;
    }>(
        `${this.apiUrl}/verify-otp`,
        payload
    );
    }
    
}
