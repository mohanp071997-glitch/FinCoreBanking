import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';
import { environment } from '../../environments/environment.development';
import { MobileLoginResponse, MobileVerifyOtpResponse } from '../interfaces/mobile-login-response.interface';

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
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
  }
}