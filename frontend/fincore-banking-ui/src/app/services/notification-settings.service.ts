import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface NotificationSettings {
  transactionAlerts: boolean;
  loginAlerts: boolean;
  promotionalNotifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {

  private apiUrl =
    `${environment.apiUrl}/NotificationSettings`;

  constructor(private http: HttpClient) {}

  // Gets the current user's notification settings.
  getSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(this.apiUrl);
  }

  // Updates the current user's notification settings.
  updateSettings(
    settings: NotificationSettings
  ): Observable<any> {
    return this.http.put(this.apiUrl, settings);
  }
}