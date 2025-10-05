import { NextRequest } from 'next/server';
import { PostController } from '@/server/controllers/postController';

export async function POST(request: NextRequest) {
  const controller = new PostController();
  return controller.createPost(request);
}

export async function GET(request: NextRequest) {
  const controller = new PostController();
  return controller.getPosts(request);
}
