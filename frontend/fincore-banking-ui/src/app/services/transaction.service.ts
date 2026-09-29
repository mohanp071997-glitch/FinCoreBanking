import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Transaction } from '../interfaces/transaction.interface';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transactions`;

  constructor(private http: HttpClient) {}

  // Gets transactions for an account.
  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/account/${accountId}`
    );
  }
}