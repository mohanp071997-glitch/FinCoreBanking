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
}