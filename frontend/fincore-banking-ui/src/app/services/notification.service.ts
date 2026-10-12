
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr';

import { environment } from '../../environments/environment';

export interface AppNotification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdDate: string;
  readDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/Notifications`;

  private hubConnection?: HubConnection;

  private newApplicationSubject =
    new Subject<{ message: string }>();

  // Subscribe to this observable in the Reviewer Dashboard.
  newApplication$ = this.newApplicationSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Existing API methods

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.apiUrl}/unread-count`
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/mark-all-read`,
      {}
    );
  }

  // Starts the SignalR connection.

  async startConnection(): Promise<void> {
    if (
      this.hubConnection?.state === 'Connected' ||
      this.hubConnection?.state === 'Connecting'
    ) {
      return;
    }

    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('SignalR: JWT token not found in sessionStorage.');
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7208/hubs/notifications', {
        accessTokenFactory: () =>
          sessionStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

      this.hubConnection.on(
        'NewApplication',
        (notification: { message: string }) => {
          console.log('NewApplication event received:', notification);

          // Notify the Reviewer Dashboard
          this.newApplicationSubject.next(notification);
        }
      );

    this.hubConnection.onreconnecting(error => {
      console.warn('SignalR reconnecting:', error);
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log('SignalR reconnected:', connectionId);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR connected successfully.');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }


  // Stops the SignalR connection.
  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }
}
