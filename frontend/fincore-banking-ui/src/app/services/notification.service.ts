import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  // Gets notifications for the current user.
  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  // Gets the unread notification count.
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.apiUrl}/unread-count`
    );
  }

  // Marks a notification as read.
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  // Marks all notifications as read.
  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/mark-all-read`,
      {}
    );
  }
}