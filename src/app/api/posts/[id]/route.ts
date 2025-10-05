import { NextRequest } from 'next/server';
import { PostController } from '@/server/controllers/postController';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const controller = new PostController();
  const resolvedParams = await params;
  return controller.getPostById(request, { params: resolvedParams });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const controller = new PostController();
  const resolvedParams = await params;
  return controller.updatePost(request, { params: resolvedParams });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const controller = new PostController();
  const resolvedParams = await params;
  return controller.deletePost(request, { params: resolvedParams });
}
