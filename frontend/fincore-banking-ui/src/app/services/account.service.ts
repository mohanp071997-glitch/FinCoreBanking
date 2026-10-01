import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Account } from '../interfaces/account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/Accounts`;

  constructor(private http: HttpClient) {}

  // Gets the accounts for the logged-in customer.
  getCurrentAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}/current`
    );
  }

  // Converts an account to a Salary Account.
  convertToSalaryAccount(
    accountId: number,
    request: {
      companyName: string;
      monthlySalary: number | null;
      confirmation: boolean;
    }
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${accountId}/convert-to-salary`,
      request
    );
  }
}