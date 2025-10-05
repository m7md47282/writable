import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '../services/postService';
import { CreatePostData, UpdatePostData, PostFilters } from '@/models';

export class PostController {
  private postService = new PostService();

  async createPost(request: NextRequest) {
    try {
      const body = await request.json();
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: { message: 'No authorization header' } },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const postData: CreatePostData = body;
      
      const result = await this.postService.createPost(postData, token);
      
      const status = result.success ? 201 : 400;
      return NextResponse.json(result, { status });
      
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status: 500 }
      );
    }
  }

  async getPostById(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      
      const result = await this.postService.getPostById(id);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }

  async getPosts(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      
      const filters: PostFilters = {};
      
      const category = searchParams.get('category');
      const tags = searchParams.get('tags');
      const isPublished = searchParams.get('isPublished');
      const isFeatured = searchParams.get('isFeatured');
      const authorId = searchParams.get('authorId');
      const search = searchParams.get('search');
      const page = searchParams.get('page');
      const limit = searchParams.get('limit');
      const sortBy = searchParams.get('sortBy');
      const sortOrder = searchParams.get('sortOrder');

      if (category) filters.category = category;
      if (tags) filters.tags = tags.split(',');
      if (isPublished !== null) filters.isPublished = isPublished === 'true';
      if (isFeatured !== null) filters.isFeatured = isFeatured === 'true';
      if (authorId) filters.authorId = authorId;
      if (search) filters.search = search;
      if (page) filters.page = parseInt(page);
      if (limit) filters.limit = parseInt(limit);
      if (sortBy) filters.sortBy = sortBy as 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount';
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      
      const result = await this.postService.getPosts(filters);
      
      return NextResponse.json(result);
      
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status: 500 }
      );
    }
  }

  async updatePost(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const body = await request.json();
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: { message: 'No authorization header' } },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const updateData: UpdatePostData = { ...body, id };
      
      const result = await this.postService.updatePost(updateData, token);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }

  async deletePost(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: { message: 'No authorization header' } },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      
      const result = await this.postService.deletePost(id, token);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }

  async publishPost(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: { message: 'No authorization header' } },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      
      const result = await this.postService.publishPost(id, token);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }

  async unpublishPost(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: { message: 'No authorization header' } },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      
      const result = await this.postService.unpublishPost(id, token);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }

  async incrementViewCount(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      
      const result = await this.postService.incrementViewCount(id);
      
      return NextResponse.json(result);
      
    } catch (error) {
      const status = error instanceof Error && error.message === 'Post not found' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: error instanceof Error ? error.message : 'Internal server error' 
          } 
        },
        { status }
      );
    }
  }
}
