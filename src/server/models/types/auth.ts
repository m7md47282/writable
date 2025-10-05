export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    idToken?: string;
    customToken?: string;
  };
  error?: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  error?: string;
  data?: T;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
