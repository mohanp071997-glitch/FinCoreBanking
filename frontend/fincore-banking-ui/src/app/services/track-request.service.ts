import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// FEATURE: Generic request tracking models
export interface TrackRequestOtpResponse {
  message: string;
  maskedEmail?: string;
}

export interface TrackRequestDetails {
  requestId: string;
  requestType: string;
  status: string;
  submittedAt: string;
  lastUpdatedAt: string;
  message?: string;
}

// FEATURE: Generic request tracking service
@Injectable({
  providedIn: 'root'
})
export class TrackRequestService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7208/api/RequestTracking';

  // FEATURE: Send OTP to registered email
  sendOtp(payload: {
    requestId: string;
    email: string;
  }): Observable<TrackRequestOtpResponse> {
    return this.http.post<TrackRequestOtpResponse>(
      `${this.apiUrl}/send-otp`,
      payload
    );
  }

  // FEATURE: Verify OTP and retrieve request status
  verifyOtp(payload: {
    requestId: string;
    email: string;
    otp: string;
  }): Observable<TrackRequestDetails> {
    return this.http.post<TrackRequestDetails>(
      `${this.apiUrl}/verify-otp`,
      payload
    );
  }
}