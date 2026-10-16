import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';
import { environment } from '../../environments/environment.development';
import { MobileLoginResponse, MobileVerifyOtpResponse } from '../interfaces/mobile-login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {
    this.startTokenExpiryCheck();
  }

  private expirySubscription?: Subscription;

    private loginStateSubject = new BehaviorSubject<boolean>(
    this.isLoggedIn()
  );

  loginState$ = this.loginStateSubject.asObservable();


  // Logs in the user.
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      request
    );
  }

  // Changes the account password.  
    changePassword(request: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {
    // Sends the password change request to the API.
    return this.http.put(
      `${this.apiUrl}/change-password`,
      request
    );
  }

   // Sets the transaction MPIN.
    setMpin(request: {
      newMpin: string;
      confirmMpin: string;
    }): Observable<any> {

      // Sends the MPIN request to the API.
      return this.http.post(
        `${this.apiUrl}/set-mpin`,
        request
      );
    }

    // Changes the transaction MPIN.
    changeMpin(request: {
      currentMpin: string;
      newMpin: string;
      confirmMpin: string;
    }): Observable<any> {

      // Sends the MPIN change request to the API.
      return this.http.put(
        `${this.apiUrl}/change-mpin`,
        request
      );
    }

    // Gets the MPIN configuration status.
    getMpinStatus(): Observable<{ isMpinConfigured: boolean }> {

      // Gets the MPIN status from the API.
      return this.http.get<{ isMpinConfigured: boolean }>(
        `${this.apiUrl}/mpin-status`
      );
    }

    // Updates the two-factor authentication setting.
    updateTwoFactor(enabled: boolean): Observable<any> {

      // Sends the two-factor setting to the API.
      return this.http.put(
        `${this.apiUrl}/two-factor`,
        {
          enabled
        }
      );
    }

    // Gets the current two-factor authentication status.
    getTwoFactorStatus(): Observable<{
      isTwoFactorEnabled: boolean;
    }> {

      // Gets the two-factor status from the API.
      return this.http.get<{
        isTwoFactorEnabled: boolean;
      }>(
        `${this.apiUrl}/two-factor-status`
      );
    }

    // Verifies the OTP and returns the authentication response.
    verifyOtp(request: {
      userId: number;
      otpCode: string;
    }): Observable<AuthResponse> {
      return this.http.post<AuthResponse>(
        `${this.apiUrl}/verify-otp`,
        request
      );
    }

    // Starts mobile number login and requests an OTP.
  mobileLogin(mobileNumber: string): Observable<MobileLoginResponse> {
    return this.http.post<MobileLoginResponse>(
      `${this.apiUrl}/mobile-login`,
      {
        mobileNumber: mobileNumber
      }
    );
  }

  // Verifies the mobile OTP and returns the JWT token.
  verifyMobileOtp(
    userId: number,
    otpCode: string
  ): Observable<MobileVerifyOtpResponse> {
    return this.http.post<MobileVerifyOtpResponse>(
      `${this.apiUrl}/verify-mobile-otp`,
      {
        userId: userId,
        otpCode: otpCode
      }
    );
  }

  // Requests a password reset OTP for the registered email.
  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      {
        email: email
      }
    );
  }

    resetPassword(
    email: string,
    otpCode: string,
    newPassword: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reset-password`,
      {
        email: email,
        otpCode: otpCode,
        newPassword: newPassword
      }
    );
  }

    verifyPasswordResetOtp(
    email: string,
    otpCode: string
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verify-password-reset-otp`,
      {
        email,
        otpCode
      }
    );
  }
      

  // Logs out the current user.
  logout(): void {
    this.expirySubscription?.unsubscribe();
    this.expirySubscription = undefined;

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authUser');

    // Clear any other authentication-related values if used.
    sessionStorage.removeItem('twoFactorUserId');
    sessionStorage.removeItem('twoFactorEmail');

    localStorage.removeItem('token');
    localStorage.removeItem('authUser');

    this.loginStateSubject.next(false);

    window.location.replace('/login');
  }

    notifyLoginSuccess(): void {
    this.loginStateSubject.next(this.isLoggedIn());
  }


  // FEATURE: Validate whether the user has a valid JWT session
    isLoggedIn(): boolean {
      const token = sessionStorage.getItem('token');

      if (!token) {
        return false;
      }

      try {
        const parts = token.split('.');

        if (parts.length !== 3) {
          this.logout();
          return false;
        }

        const payload = parts[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const decodedPayload = atob(
          payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
        );

        const claims = JSON.parse(decodedPayload);

        // FEATURE: Reject tokens without a valid expiry
        if (
          typeof claims.exp !== 'number' ||
          claims.exp * 1000 <= Date.now()
        ) {
          this.logout();
          return false;
        }

        return true;
      } catch {
        this.logout();
        return false;
      }
    }

    
  // FEATURE: Get the saved logged-in user
  getCurrentUser(): any | null {
    const authUser = sessionStorage.getItem('authUser');

    if (!authUser) {
      return null;
    }

    try {
      return JSON.parse(authUser);
    } catch {
      // FEATURE: Remove invalid saved user data
      sessionStorage.removeItem('authUser');
      return null;
    }
  }

  // Saves the authenticated user's session.
  saveLoginSession(response: AuthResponse): void {
    sessionStorage.setItem('token', response.token);

    sessionStorage.setItem(
      'authUser',
      JSON.stringify(response.userName)
    );

    this.loginStateSubject.next(this.isLoggedIn());

    this.startTokenExpiryCheck();
  }

  private startTokenExpiryCheck(): void {
  this.expirySubscription?.unsubscribe();

  const token = sessionStorage.getItem('token');

  if (!token) {
    this.loginStateSubject.next(false);
    return;
  }

  const expiryTime = this.getTokenExpiry(token);

  if (expiryTime === null || expiryTime <= Date.now()) {
    this.logout();
    return;
  }

  const remainingTime = expiryTime - Date.now();

  this.expirySubscription = timer(remainingTime).subscribe(() => {
    this.logout();
  });
}

  private getTokenExpiry(token: string): number | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decoded = atob(
        payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
      );

      const claims = JSON.parse(decoded);

      if (typeof claims.exp !== 'number') {
        return null;
      }

      return claims.exp * 1000;
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.expirySubscription?.unsubscribe();
  }


}