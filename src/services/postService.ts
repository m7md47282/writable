import { Post as PostModel, CreatePostData, UpdatePostData, PostResponse, PostsResponse, PostFilters } from '@/models';
import { Post, Get, Put, Delete } from './httpsService';

export class PostService {
  private static instance: PostService;

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async createPost(postData: CreatePostData): Promise<PostModel> {
    try {
      const response = await Post({ url: '/api/posts', body: postData }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create post');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create post');
    }
  }

  async getPostById(postId: string, skipToken: boolean = false): Promise<PostModel> {
    try {
      const response = await Get({ url: `/api/posts/${postId}`, skipToken }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Post not found');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch post');
    }
  }

  async getPosts(filters?: PostFilters, skipToken: boolean = false): Promise<PostsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }
      
      const url = queryParams.toString() 
        ? `/api/posts?${queryParams.toString()}`
        : '/api/posts';
        
      const response = await Get({ url, skipToken }) as PostsResponse;
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch posts');
      }
      
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch posts');
    }
  }

  async updatePost(postData: UpdatePostData): Promise<PostModel> {
    try {
      const { id, ...updateData } = postData;
      const response = await Put({ url: `/api/posts/${id}`, body: updateData }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update post');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update post');
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const response = await Delete({ url: `/api/posts/${postId}` }) as PostResponse;
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete post');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete post');
    }
  }

  async publishPost(postId: string): Promise<PostModel> {
    try {
      const response = await Post({ url: `/api/posts/${postId}/publish`, body: {} }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to publish post');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to publish post');
    }
  }

  async unpublishPost(postId: string): Promise<PostModel> {
    try {
      const response = await Post({ url: `/api/posts/${postId}/unpublish`, body: {} }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to unpublish post');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to unpublish post');
    }
  }

  async getPostsByAuthor(authorId: string, filters?: Omit<PostFilters, 'authorId'>, skipToken: boolean = false): Promise<PostsResponse> {
    return this.getPosts({ ...filters, authorId }, skipToken);
  }

  async getFeaturedPosts(limit?: number, skipToken: boolean = false): Promise<PostsResponse> {
    return this.getPosts({ isFeatured: true, isPublished: true, limit }, skipToken);
  }

  async getPostsByCategory(category: string, filters?: Omit<PostFilters, 'category'>, skipToken: boolean = false): Promise<PostsResponse> {
    return this.getPosts({ ...filters, category, isPublished: true }, skipToken);
  }

  async searchPosts(query: string, filters?: Omit<PostFilters, 'search'>, skipToken: boolean = false): Promise<PostsResponse> {
    return this.getPosts({ ...filters, search: query, isPublished: true }, skipToken);
  }

  async incrementViewCount(postId: string): Promise<PostModel> {
    try {
      const response = await Post({ url: `/api/posts/${postId}/view`, body: {} }) as PostResponse;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to increment view count');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to increment view count');
    }
  }
}

export const postService = PostService.getInstance();
export default postService;
