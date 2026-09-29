import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Beneficiary } from '../interfaces/beneficiary.interface';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = `${environment.apiUrl}/Beneficiaries`;

  constructor(private http: HttpClient) {}

  // Gets beneficiaries for a customer.
  getBeneficiariesByCustomer(customerId: number): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

    // Creates a new beneficiary.
    createBeneficiary(request: {
      customerId: number;
      beneficiaryName: string;
      beneficiaryAccountNumber: string;
      bankName: string;
      ifscCode: string;
    }): Observable<Beneficiary> {
      return this.http.post<Beneficiary>(
        this.apiUrl,
        request
      );
    }
}
