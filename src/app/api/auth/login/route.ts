import { NextRequest } from 'next/server';
import { AuthController } from '@/server/controllers/authController';

export async function POST(request: NextRequest) {
  const controller = new AuthController();
  return controller.login(request);
}
