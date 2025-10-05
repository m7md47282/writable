import { NextRequest } from 'next/server';
import { AuthController } from '@/server/controllers/authController';

export async function POST(request: NextRequest) {
  try {
    const controller = new AuthController();
    return controller.signup(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}