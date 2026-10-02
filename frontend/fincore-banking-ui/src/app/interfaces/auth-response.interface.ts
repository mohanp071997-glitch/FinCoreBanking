export interface AuthResponse {
  userId: number;
  userName: string;
  email: string;
  role: string;
  token: string;
  lastLoginDate?: string;

  // Indicates whether OTP verification is required.
  requiresTwoFactor?: boolean;

  // Stores the response message.
  message?: string;
}