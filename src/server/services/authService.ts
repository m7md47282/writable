import { AuthRepository } from '@/server/repositories/authRepository';
import { 
  LoginCredentials, 
  SignupCredentials, 
  CreateUserProfileData,
  ApiResponse,
} from '@/models';
import { ApiStatus } from '../models/types/apiStatuses';

export class AuthService {
  private authRepository = new AuthRepository();

  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {

      const authData = await this.authRepository.authenticateUser(credentials);
      
      const decodedToken = await this.authRepository.verifyIdToken(authData.idToken);
      
      let userProfile = await this.authRepository.getUserProfile(decodedToken.uid);
      
      if (!userProfile) {
        const userData: CreateUserProfileData = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name,
          emailVerified: decodedToken.email_verified || false
        };
        userProfile = await this.authRepository.createUserProfile(userData);
      } else {
        await this.authRepository.updateLastLogin(decodedToken.uid);
      }
      
      const customToken = await this.authRepository.generateCustomToken(decodedToken.uid);

      return {
        success: true,
        status: ApiStatus.SUCCESS,
        data: {
          user: userProfile,
          idToken: authData.idToken,
          customToken: customToken
        }
      };
    } catch (error) {
      return {
        success: false,
        status: ApiStatus.UNAUTHORIZED,
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
        }
      };
    }
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse> {
    try {


      const authData = await this.authRepository.createUser(credentials);
      
      const decodedToken = await this.authRepository.verifyIdToken(authData.idToken);
      
      const userData: CreateUserProfileData = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || credentials.displayName,
        emailVerified: decodedToken.email_verified || false
      };
      
      const userProfile = await this.authRepository.createUserProfile(userData);
      
      const customToken = await this.authRepository.generateCustomToken(decodedToken.uid);

      return {
        success: true,
        status: ApiStatus.SUCCESS,
        data: {
          user: userProfile,
          idToken: authData.idToken,
          customToken: customToken
        }
      };
    } catch (error) {
      return {
        success: false,
        status: ApiStatus.UNAUTHORIZED,
        error: {
          message: error instanceof Error ? error.message : 'Signup failed',
        }
      };
    }
  }
  async logout(uid: string): Promise<ApiResponse> {
    try {
      await this.authRepository.revokeSession(uid);
      return { success: true, status: ApiStatus.SUCCESS };
    } catch (error) {
      return {
        success: false,
        status: ApiStatus.UNAUTHORIZED,
        error: {
          message: error instanceof Error ? error.message : 'Logout failed',
        }
      };
    }
  }

  async verifyToken(idToken: string): Promise<ApiResponse> {
    try {
      const decodedToken = await this.authRepository.verifyIdToken(idToken);
      
      const userProfile = await this.authRepository.getUserProfile(decodedToken.uid);
      
      if (!userProfile) {
        return {
          success: false,
          status: ApiStatus.UNAUTHORIZED,
          error: {
            message: 'User profile not found',
          }
        };
      }
      
      return {
        success: true,
        status: ApiStatus.SUCCESS,
        data: {
          user: userProfile
        }
      };
    } catch (error) {
      return {
        success: false,
        status: ApiStatus.UNAUTHORIZED,
        error: {
          message: error instanceof Error ? error.message : 'Token verification failed',
        }
      };
    }
  }
}
