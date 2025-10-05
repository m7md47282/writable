import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/authService';

export class AuthController {
  private authService = new AuthService();

  async login(request: NextRequest) {
    try {
      const body = await request.json();
      
      const result = await this.authService.login(body);
      
      const status = result.success ? 200 : 401;
      return NextResponse.json(result, { status });
      
    } catch {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  async signup(request: NextRequest) {
    try {
      const body = await request.json();
      
      const result = await this.authService.signup(body);
      
      const status = result.status;
      return NextResponse.json(result, { status });
      
    } catch {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  async logout(request: NextRequest) {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: 'No authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      
      const decodedToken = await this.authService.verifyToken(token);
      
      if (!decodedToken.success) {
        return NextResponse.json(decodedToken, { status: 401 });
      }

      const userId = (decodedToken.data as { user: { uid: string } })?.user?.uid;
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'Invalid token - no user ID found' },
          { status: 401 }
        );
      }

      const result = await this.authService.logout(userId);
      
      return NextResponse.json(result);
      
    } catch {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  async verifyToken(request: NextRequest) {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: 'No authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.authService.verifyToken(token);
      
      return NextResponse.json(result);
      
    } catch {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
