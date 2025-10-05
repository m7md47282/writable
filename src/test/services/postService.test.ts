import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostService } from '@/services/postService'
import { Post, Get, Put, Delete } from '@/services/httpsService'
import { CreatePostData, UpdatePostData, PostResponse, PostsResponse } from '@/models'

// Mock the httpsService
vi.mock('@/services/httpsService', () => ({
  Post: vi.fn(),
  Get: vi.fn(),
  Put: vi.fn(),
  Delete: vi.fn()
}))

describe('PostService (Client)', () => {
  let postService: PostService

  beforeEach(() => {
    vi.clearAllMocks()
    postService = PostService.getInstance()
  })

  describe('createPost', () => {
    const mockPostData: CreatePostData = {
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      category: 'Technology',
      tags: ['test', 'blog'],
      featuredImage: 'https://example.com/image.jpg',
      isPublished: false,
      isFeatured: false,
      readTime: '5'
    }

    const mockCreatedPost: Post = {
      id: 'post-123',
      ...mockPostData,
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-post',
      viewCount: 0,
      likeCount: 0
    }

    it('should create a post successfully', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: true,
        data: mockCreatedPost
      }
      vi.mocked(Post).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.createPost(mockPostData)

      // Assert
      expect(result).toEqual(mockCreatedPost)
      expect(Post).toHaveBeenCalledWith({
        url: '/api/posts',
        body: mockPostData
      })
    })

    it('should throw error when response is not successful', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: false,
        error: { message: 'Failed to create post' }
      }
      vi.mocked(Post).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.createPost(mockPostData)).rejects.toThrow('Failed to create post')
    })

    it('should throw error when data is missing', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: true,
        data: undefined as Post
      }
      vi.mocked(Post).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.createPost(mockPostData)).rejects.toThrow('Failed to create post')
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(Post).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(postService.createPost(mockPostData)).rejects.toThrow('Network error')
    })
  })

  describe('getPostById', () => {
    const mockPost: Post = {
      id: 'post-123',
      title: 'Test Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      category: 'Technology',
      tags: ['test'],
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: true,
      publishedAt: new Date()
    }

    it('should get a post by ID successfully', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: true,
        data: mockPost
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.getPostById('post-123')

      // Assert
      expect(result).toEqual(mockPost)
      expect(Get).toHaveBeenCalledWith({
        url: '/api/posts/post-123',
        skipToken: false
      })
    })

    it('should get a post by ID without token', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: true,
        data: mockPost
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.getPostById('post-123', true)

      // Assert
      expect(result).toEqual(mockPost)
      expect(Get).toHaveBeenCalledWith({
        url: '/api/posts/post-123',
        skipToken: true
      })
    })

    it('should throw error when response is not successful', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: false,
        error: { message: 'Post not found' }
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.getPostById('post-123')).rejects.toThrow('Post not found')
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(Get).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(postService.getPostById('post-123')).rejects.toThrow('Network error')
    })
  })

  describe('updatePost', () => {
    const mockUpdateData: UpdatePostData = {
      id: 'post-123',
      title: 'Updated Post',
      content: 'Updated content',
      excerpt: 'Updated excerpt'
    }

    const mockUpdatedPost: Post = {
      id: 'post-123',
      title: 'Updated Post',
      content: 'Updated content',
      excerpt: 'Updated excerpt',
      category: 'Technology',
      tags: ['test'],
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'updated-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: false
    }

    it('should update a post successfully', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: true,
        data: mockUpdatedPost
      }
      vi.mocked(Put).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.updatePost(mockUpdateData)

      // Assert
      expect(result).toEqual(mockUpdatedPost)
      expect(Put).toHaveBeenCalledWith({
        url: '/api/posts/post-123',
        body: {
          title: 'Updated Post',
          content: 'Updated content',
          excerpt: 'Updated excerpt'
        }
      })
    })

    it('should throw error when response is not successful', async () => {
      // Arrange
      const mockResponse: PostResponse = {
        success: false,
        error: { message: 'Failed to update post' }
      }
      vi.mocked(Put).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.updatePost(mockUpdateData)).rejects.toThrow('Failed to update post')
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(Put).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(postService.updatePost(mockUpdateData)).rejects.toThrow('Network error')
    })
  })

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Post deleted successfully'
      }
      vi.mocked(Delete).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.deletePost('post-123')

      // Assert
      expect(result).toBeUndefined()
      expect(Delete).toHaveBeenCalledWith({
        url: '/api/posts/post-123'
      })
    })

    it('should throw error when response is not successful', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        error: { message: 'Failed to delete post' }
      }
      vi.mocked(Delete).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.deletePost('post-123')).rejects.toThrow('Failed to delete post')
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(Delete).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(postService.deletePost('post-123')).rejects.toThrow('Network error')
    })
  })

  describe('getPosts', () => {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        title: 'Post 1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        category: 'Technology',
        tags: ['tech'],
        authorId: 'user-123',
        authorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'post-1',
        viewCount: 10,
        likeCount: 5,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        id: 'post-2',
        title: 'Post 2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        category: 'Lifestyle',
        tags: ['lifestyle'],
        authorId: 'user-456',
        authorName: 'Another User',
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'post-2',
        viewCount: 20,
        likeCount: 8,
        isPublished: true,
        publishedAt: new Date()
      }
    ]

    it('should get all posts successfully', async () => {
      // Arrange
      const mockResponse: PostsResponse = {
        success: true,
        data: mockPosts
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.getPosts()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(Get).toHaveBeenCalledWith({
        url: '/api/posts',
        skipToken: false
      })
    })

    it('should get posts with filters', async () => {
      // Arrange
      const filters = { category: 'Technology', isPublished: true }
      const mockResponse: PostsResponse = {
        success: true,
        data: [mockPosts[0]]
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act
      const result = await postService.getPosts(filters)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(Get).toHaveBeenCalledWith({
        url: '/api/posts?category=Technology&isPublished=true',
        skipToken: false
      })
    })

    it('should throw error when response is not successful', async () => {
      // Arrange
      const mockResponse: PostsResponse = {
        success: false,
        error: { message: 'Failed to fetch posts' }
      }
      vi.mocked(Get).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postService.getPosts()).rejects.toThrow('Failed to fetch posts')
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(Get).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(postService.getPosts()).rejects.toThrow('Network error')
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      // Act
      const instance1 = PostService.getInstance()
      const instance2 = PostService.getInstance()

      // Assert
      expect(instance1).toBe(instance2)
    })
  })
})