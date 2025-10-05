import { NextRequest } from 'next/server';
import { PostController } from '@/server/controllers/postController';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const controller = new PostController();
  const resolvedParams = await params;
  return controller.publishPost(request, { params: resolvedParams });
}
