
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


  // FEATURE: Submit application with actual documents
  submitApplication(payload: {
    applicationDraftId: string;
    personalDetails: Record<string, unknown>;
    additionalDetails: Record<string, unknown>;
    panDocument: File;
    identityDocument: File;
    addressDocument: File;
    applicantPhoto: File;
  }): Observable<SubmitApplicationResponse> {
    const formData = new FormData();

    formData.append('ApplicationDraftId', payload.applicationDraftId);
    formData.append(
      'PersonalDetails',
      JSON.stringify(payload.personalDetails)
    );
    formData.append(
      'AdditionalDetails',
      JSON.stringify(payload.additionalDetails)
    );

    formData.append('PanDocument', payload.panDocument);
    formData.append('IdentityDocument', payload.identityDocument);
    formData.append('AddressDocument', payload.addressDocument);
    formData.append('ApplicantPhoto', payload.applicantPhoto);

    return this.http.post<SubmitApplicationResponse>(
      `${this.apiUrl}/submit`,
      formData
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
