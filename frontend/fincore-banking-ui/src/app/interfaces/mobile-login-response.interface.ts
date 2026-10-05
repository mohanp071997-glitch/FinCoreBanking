// Represents the mobile login API response.
export interface MobileLoginResponse {
  message: string;
  userId: number;
  mobileNumber: string;
}

// Represents the mobile OTP verification response.
export interface MobileVerifyOtpResponse {
  token: string;
  userId: number;
  userName: string;
  email: string;
  lastLoginDate: string;
  role: string;
  requiresTwoFactor: boolean;
}