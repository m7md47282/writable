export interface Post {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  readTime: string;
  authorId: string;
  authorName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  slug?: string;
  viewCount?: number;
  likeCount?: number;
}

export interface CreatePostData {
    
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  readTime: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface PostResponse {
  success: boolean;
  data?: Post;
  error?: {
    message: string;
  };
}

export interface PostsResponse {
  success: boolean;
  data?: Post[];
  error?: {
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostFilters {
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
}
