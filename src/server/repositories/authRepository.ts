import { getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { GoogleAuthRequest, LoginCredentials, SignupCredentials, UserProfile, CreateUserProfileData } from '@/models';
import { BaseFirebaseRepository } from './baseFirebaseRepository';

export class AuthRepository extends BaseFirebaseRepository<UserProfile> {
  constructor() {
    super('users');
  }

  async authenticateUser(credentials: LoginCredentials) {
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!firebaseApiKey) {
      throw new Error('Firebase API key not configured');
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Authentication failed');
    }

    return data;
  }

  async createUser(credentials: SignupCredentials) {
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!firebaseApiKey) {
      throw new Error('Firebase API key not configured');
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          displayName: credentials.displayName,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'User creation failed');
    }

    return data;
  }

  async verifyIdToken(idToken: string) {
    const auth = getFirebaseAdminAuth();
    return auth.verifyIdToken(idToken);
  }

  async generateCustomToken(uid: string) {
    const auth = getFirebaseAdminAuth();
    return auth.createCustomToken(uid);
  }

  async authenticateWithGoogle(request: GoogleAuthRequest) {
    const decodedToken = await this.verifyIdToken(request.idToken);
    return decodedToken;
  }

  async revokeSession(uid: string) {
    const auth = getFirebaseAdminAuth();
    await auth.revokeRefreshTokens(uid);
  }

  async createUserProfile(userData: CreateUserProfileData): Promise<UserProfile> {
    const now = new Date();
    
    const userProfile: UserProfile = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      emailVerified: userData.emailVerified,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };

    return await this.create(userProfile, userData.uid);
  }

  async getUserProfile(id: string): Promise<UserProfile | null> {
    return await this.getById(id);
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    return await this.update(uid, updateData);
  }

  async updateLastLogin(uid: string): Promise<void> {
    await this.update(uid, {
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });
  }

  async deleteUserProfile(uid: string): Promise<void> {
    await this.delete(uid);
  }
}
