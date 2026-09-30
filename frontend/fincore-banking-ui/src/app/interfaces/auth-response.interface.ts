// Represents the authentication response.
export interface AuthResponse {
  token: string;
  userId: number;
  userName: string;
  email: string;
  lastLoginDate: string;
  role: string;
}