import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { CreateFundTransferRequest } from '../interfaces/create-fund-transfer-request.interface';

@Injectable({
  providedIn: 'root'
})
export class FundTransferService {

  private apiUrl = `${environment.apiUrl}/FundTransfers`;

  constructor(private http: HttpClient) {}

  // Creates a fund transfer.
  createTransfer(
    request: CreateFundTransferRequest
  ): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      request
    );
  }
}