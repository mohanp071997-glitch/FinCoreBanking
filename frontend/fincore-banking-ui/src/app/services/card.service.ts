import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Card } from '../interfaces/card.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private apiUrl = `${environment.apiUrl}/Cards`;

  constructor(private http: HttpClient) {}

  // Gets cards for the logged-in customer.
  getCurrentCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/current`);
  }

  // Updates the card status.
  updateCardStatus(
    cardId: number,
    status: string
  ): Observable<Card> {
    return this.http.put<Card>(
      `${this.apiUrl}/${cardId}/status`,
      { status }
    );
  }
}