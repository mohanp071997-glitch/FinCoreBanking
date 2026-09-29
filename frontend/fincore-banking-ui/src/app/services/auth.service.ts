import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // Logs in the user.
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      request
    );
  }

  // Logs out the current user.
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
  }
}