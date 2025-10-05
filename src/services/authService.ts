import { 
  signInWithCustomToken,
  signOut,
  User
} from 'firebase/auth';
import { getFirebase } from '@/lib/firebase';
import { LoginCredentials, ApiResponse, SignupCredentials } from '@/models';
import { Post } from './httpsService';


export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {

      const response = await Post({ url: '/api/auth/login', body: credentials, skipToken: true }) as ApiResponse;
      const { auth } = getFirebase();
      const userCredential = await signInWithCustomToken(auth, (response.data as { customToken : string })?.customToken );
      return userCredential.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }


  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      const response = await Post({ url: '/api/auth/signup', body: credentials, skipToken: true }) as ApiResponse;
      const { auth } = getFirebase();
      const userCredential = await signInWithCustomToken(auth, (response.data as { customToken : string })?.customToken );
      return userCredential.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    }
  }

  async logout(): Promise<void> {
    const { auth } = getFirebase();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    const idToken = await currentUser.getIdToken();
    
    const response = await Post({ 
      url: '/api/auth/logout', 
      body: {}, 
      skipToken: false, 
      additionalHeaders: {
        'Authorization': `Bearer ${idToken}`
      }
    }) as ApiResponse;
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Logout failed');
    }
    
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    const { auth } = getFirebase();
    return auth.currentUser;
  }
}

export const authService = AuthService.getInstance();
export default authService;
