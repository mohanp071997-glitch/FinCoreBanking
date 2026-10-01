import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoanPayment } from '../interfaces/loan-payment.interface';

@Injectable({
  providedIn: 'root'
})
export class LoanPaymentService {

  private apiUrl = `${environment.apiUrl}/LoanPayments`;

  constructor(private http: HttpClient) {}

  // Gets payment schedule for a loan.
  getLoanPayments(loanId: number): Observable<LoanPayment[]> {
    return this.http.get<LoanPayment[]>(
      `${this.apiUrl}/loan/${loanId}`
    );
  }
}