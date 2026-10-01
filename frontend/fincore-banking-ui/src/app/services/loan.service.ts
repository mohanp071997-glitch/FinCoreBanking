import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Loan, LoanType } from '../interfaces/loan.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private apiUrl = `${environment.apiUrl}/Loans`;

  constructor(private http: HttpClient) {}

  // Gets loans for the logged-in customer.
  getCurrentLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/current`);
  }

  // Gets available loan types.
  getLoanTypes(): Observable<LoanType[]> {
    return this.http.get<LoanType[]>(`${this.apiUrl}/types`);
  }

  // Gets a specific loan for the logged-in customer.
    getLoanById(loanId: number): Observable<Loan> {
    return this.http.get<Loan>(
        `${this.apiUrl}/${loanId}`
    );
    }
}