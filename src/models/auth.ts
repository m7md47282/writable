
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface ApiResponse {
  data?: unknown;
  success: boolean;
  status: number;
  error?: {
    message: string;
  };
}

export interface BackendUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified: boolean;
}

export interface BackendAuthResponse {
  success: boolean;
  data?: {
    user: BackendUser;
    idToken?: string;
    customToken?: string;
  };
  error?: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}
