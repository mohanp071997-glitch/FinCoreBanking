import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReviewDashboardStatistics } from '../interfaces/ReviewDashboardStatistics.interface';

// FEATURE: Pending application response
export interface PendingApplication {
  accountOpeningApplicationId: number;
  applicationRequestId: string;
  email: string;
  status: string;
  submittedAt: string;
}

// FEATURE: Application details response
export interface ApplicationDetails extends PendingApplication {
  applicationData: Record<string, any>;
}

// FEATURE: Reviewer decision request
export interface SubmitReviewRequest {
  reviewDecision: 'Verified' | 'Rejected';
  personalDetailsVerified: boolean;
  identityDocumentVerified: boolean;
  addressDocumentVerified: boolean;
  applicantPhotoVerified: boolean;
  comments: string;
}

// FEATURE: Reviewer decision response
export interface SubmitReviewResponse {
  message: string;
  applicationRequestId: string;
  reviewDecision: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewerService {

  // FEATURE: Backend API URL
  private readonly apiUrl =
    `${environment.apiUrl}/ApplicationReview`;

  constructor(
    private readonly http: HttpClient
  ) {}

  // FEATURE: Get pending applications
  getPendingApplications(): Observable<PendingApplication[]> {
    return this.http.get<PendingApplication[]>(
      `${this.apiUrl}/pending`
    );
  }

  // FEATURE: Get application details by ID
  getApplicationDetails(
    id: number
  ): Observable<ApplicationDetails> {
    return this.http.get<ApplicationDetails>(
      `${this.apiUrl}/${id}`
    );
  }

  // FEATURE: Submit reviewer decision
  submitReview(
    id: number,
    request: SubmitReviewRequest
  ): Observable<SubmitReviewResponse> {
    return this.http.post<SubmitReviewResponse>(
      `${this.apiUrl}/${id}/decision`,
      request
    );
  }

    getDashboardStatistics(): Observable<ReviewDashboardStatistics> {
    return this.http.get<ReviewDashboardStatistics>(
      `${this.apiUrl}/statistics`
    );
  }

  
  startReview(id: number): Observable<{ message: string; reviewStartedAtUtc: string }> {
    return this.http.post<{ message: string; reviewStartedAtUtc: string }>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

}
