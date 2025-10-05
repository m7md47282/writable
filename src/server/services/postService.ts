import { Post, CreatePostData, UpdatePostData, PostResponse, PostsResponse, PostFilters } from '@/models';

import { AuthService } from './authService';
import { PostRepository } from '../repositories/postRepository';

export class PostService {
  private postRepository = new PostRepository();
  private authService = new AuthService();

  private cleanUndefinedValues(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
    );
  }

  async createPost(postData: CreatePostData, token: string): Promise<PostResponse> {
    try {
      const authResult = await this.authService.verifyToken(token);
      if (!authResult.success) {
        return {
          success: false,
          error: { message: 'Invalid token' }
        };
      }

      const user = authResult.data as { user: { uid: string; displayName?: string } };
      const authorId = user.user.uid;
      const authorName = user.user.displayName || 'Anonymous';

      const postDataWithMetadata = {
        ...postData,
        authorId,
        authorName,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: this.generateSlug(postData.title),
        viewCount: 0,
        likeCount: 0,
        ...(postData.isPublished && { publishedAt: new Date() })
      };

      const cleanPostData = this.cleanUndefinedValues(postDataWithMetadata) as Omit<Post, 'id'>;
      const createdPost = await this.postRepository.create(cleanPostData);
      
      return {
        success: true,
        data: createdPost
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to create post' }
      };
    }
  }

  async getPostById(postId: string): Promise<PostResponse> {
    try {
      const post = await this.postRepository.getById(postId);
      
      if (!post) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      return {
        success: true,
        data: post
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to fetch post' }
      };
    }
  }

  async getPosts(filters?: PostFilters): Promise<PostsResponse> {
    try {
      const posts = await this.postRepository.findMany(filters);
      const total = await this.postRepository.count(filters);
      
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to fetch posts' }
      };
    }
  }

  async updatePost(updateData: UpdatePostData, token: string): Promise<PostResponse> {
    try {

      const authResult = await this.authService.verifyToken(token);
      if (!authResult.success) {
        return {
          success: false,
          error: { message: 'Invalid token' }
        };
      }

      const user = authResult.data as { user: { uid: string } };
      const userId = user.user.uid;


      const existingPost = await this.postRepository.getById(updateData.id);
      if (!existingPost) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      if (existingPost.authorId !== userId) {
        return {
          success: false,
          error: { message: 'Unauthorized to update this post' }
        };
      }


      const updateFields: Partial<Post> = {
        ...updateData,
        updatedAt: new Date()
      };


      if (updateData.isPublished && !existingPost.isPublished) {
        updateFields.publishedAt = new Date();
      }


      const cleanUpdateFields = this.cleanUndefinedValues(updateFields) as Partial<Post>;
      const updatedPost = await this.postRepository.update(updateData.id, cleanUpdateFields);
      
      return {
        success: true,
        data: updatedPost
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to update post' }
      };
    }
  }

  async deletePost(postId: string, token: string): Promise<PostResponse> {
    try {
      const authResult = await this.authService.verifyToken(token);
      if (!authResult.success) {
        return {
          success: false,
          error: { message: 'Invalid token' }
        };
      }

      const user = authResult.data as { user: { uid: string } };
      const userId = user.user.uid;

      const existingPost = await this.postRepository.getById(postId);
      if (!existingPost) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      if (existingPost.authorId !== userId) {
        return {
          success: false,
          error: { message: 'Unauthorized to delete this post' }
        };
      }

      await this.postRepository.delete(postId);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to delete post' }
      };
    }
  }

  async publishPost(postId: string, token: string): Promise<PostResponse> {
    try {
      const authResult = await this.authService.verifyToken(token);
      if (!authResult.success) {
        return {
          success: false,
          error: { message: 'Invalid token' }
        };
      }

      const user = authResult.data as { user: { uid: string } };
      const userId = user.user.uid;

      const existingPost = await this.postRepository.getById(postId);
      if (!existingPost) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      if (existingPost.authorId !== userId) {
        return {
          success: false,
          error: { message: 'Unauthorized to publish this post' }
        };
      }

      const updatedPost = await this.postRepository.update(postId, {
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        success: true,
        data: updatedPost
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to publish post' }
      };
    }
  }

  async unpublishPost(postId: string, token: string): Promise<PostResponse> {
    try {
      const authResult = await this.authService.verifyToken(token);
      if (!authResult.success) {
        return {
          success: false,
          error: { message: 'Invalid token' }
        };
      }

      const user = authResult.data as { user: { uid: string } };
      const userId = user.user.uid;

      const existingPost = await this.postRepository.getById(postId);
      if (!existingPost) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      if (existingPost.authorId !== userId) {
        return {
          success: false,
          error: { message: 'Unauthorized to unpublish this post' }
        };
      }

      const updatedPost = await this.postRepository.update(postId, {
        isPublished: false,
        updatedAt: new Date()
      });
      
      return {
        success: true,
        data: updatedPost
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to unpublish post' }
      };
    }
  }

  async incrementViewCount(postId: string): Promise<PostResponse> {
    try {
      const existingPost = await this.postRepository.getById(postId);
      if (!existingPost) {
        return {
          success: false,
          error: { message: 'Post not found' }
        };
      }

      const currentViewCount = existingPost.viewCount || 0;
      const updatedPost = await this.postRepository.update(postId, {
        viewCount: currentViewCount + 1,
        updatedAt: new Date()
      });
      
      return {
        success: true,
        data: updatedPost
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to increment view count' }
      };
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
