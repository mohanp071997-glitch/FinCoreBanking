import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Customer } from '../interfaces/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/Customers`;

  constructor(private http: HttpClient) {}

  // Gets the logged-in customer.
  getCurrentCustomer(): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.apiUrl}/current`
    );
  }

  // Updates the customer profile.
  updateCustomer(
    customerId: number,
    customer: Customer
  ): Observable<Customer> {
    return this.http.put<Customer>(
      `${this.apiUrl}/${customerId}`,
      customer
    );
  }
}