export interface AuthResponse {
  userId: number;
  userName: string;
  email: string;
  roles: string[];
  token: string;
  lastLoginDate?: string;

  // Indicates whether OTP verification is required.
  requiresTwoFactor?: boolean;

  // Stores the response message.
  message?: string;
}