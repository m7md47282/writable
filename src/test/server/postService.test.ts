import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostService } from '@/server/services/postService'
import { AuthService } from '@/server/services/authService'
import { PostRepository } from '@/server/repositories/postRepository'
import { CreatePostData, UpdatePostData, Post, PostFilters } from '@/models'

// Mock dependencies
vi.mock('@/server/services/authService')
vi.mock('@/server/repositories/postRepository')

describe('PostService', () => {
  let postService: PostService
  let mockAuthService: {
    verifyToken: ReturnType<typeof vi.fn>
  }
  let mockPostRepository: {
    create: ReturnType<typeof vi.fn>
    getById: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    incrementViewCount: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create mock instances
    mockAuthService = {
      verifyToken: vi.fn()
    }
    
    mockPostRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      incrementViewCount: vi.fn()
    }

    // Mock the constructor dependencies
    vi.mocked(AuthService).mockReturnValue(mockAuthService as unknown as AuthService)
    vi.mocked(PostRepository).mockReturnValue(mockPostRepository as unknown as PostRepository)

    postService = new PostService()
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

    const mockToken = 'valid-token'
    const mockUser = {
      user: {
        uid: 'user-123',
        displayName: 'Test User'
      }
    }

    it('should create a post successfully', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })

      const expectedPost: Post = {
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

      mockPostRepository.create.mockResolvedValue(expectedPost)

      // Act
      const result = await postService.createPost(mockPostData, mockToken)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(expectedPost)
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(mockToken)
      expect(mockPostRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPostData,
          authorId: 'user-123',
          authorName: 'Test User',
          slug: 'test-post',
          viewCount: 0,
          likeCount: 0
        })
      )
    })

    it('should return error for invalid token', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: { message: 'Invalid token' }
      })

      // Act
      const result = await postService.createPost(mockPostData, 'invalid-token')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Invalid token')
      expect(mockPostRepository.create).not.toHaveBeenCalled()
    })

    it('should handle repository errors', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })
      mockPostRepository.create.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await postService.createPost(mockPostData, mockToken)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Database error')
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
      featuredImage: 'https://example.com/image.jpg',
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: true,
      isFeatured: false,
      readTime: '5',
      publishedAt: new Date()
    }

    it('should get a post by ID successfully', async () => {
      // Arrange
      mockPostRepository.getById.mockResolvedValue(mockPost)

      // Act
      const result = await postService.getPostById('post-123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPost)
      expect(mockPostRepository.getById).toHaveBeenCalledWith('post-123')
    })

    it('should return error when post not found', async () => {
      // Arrange
      mockPostRepository.getById.mockResolvedValue(null)

      // Act
      const result = await postService.getPostById('non-existent')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Post not found')
    })

    it('should handle repository errors', async () => {
      // Arrange
      mockPostRepository.getById.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await postService.getPostById('post-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Database error')
    })
  })

  describe('updatePost', () => {
    const mockUpdateData: UpdatePostData = {
      id: 'post-123',
      title: 'Updated Post',
      content: 'Updated content',
      excerpt: 'Updated excerpt'
    }

    const mockToken = 'valid-token'
    const mockUser = {
      user: {
        uid: 'user-123',
        displayName: 'Test User'
      }
    }

    const mockExistingPost: Post = {
      id: 'post-123',
      title: 'Original Post',
      content: 'Original content',
      excerpt: 'Original excerpt',
      category: 'Technology',
      tags: ['test'],
      featuredImage: 'https://example.com/image.jpg',
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'original-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: false,
      isFeatured: false,
      readTime: '5'
    }

    it('should update a post successfully', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })
      mockPostRepository.getById.mockResolvedValue(mockExistingPost)
      
      const updatedPost = { ...mockExistingPost, ...mockUpdateData, updatedAt: new Date() }
      mockPostRepository.update.mockResolvedValue(updatedPost)

      // Act
      const result = await postService.updatePost(mockUpdateData, mockToken)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedPost)
      expect(mockPostRepository.update).toHaveBeenCalledWith('post-123', expect.objectContaining({
        ...mockUpdateData,
        updatedAt: expect.any(Date)
      }))
    })

    it('should return error for invalid token', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: { message: 'Invalid token' }
      })

      // Act
      const result = await postService.updatePost(mockUpdateData, 'invalid-token')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Invalid token')
    })

    it('should return error when post not found', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })
      mockPostRepository.getById.mockResolvedValue(null)

      // Act
      const result = await postService.updatePost(mockUpdateData, mockToken)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Post not found')
    })

    it('should return error for unauthorized user', async () => {
      // Arrange
      const unauthorizedUser = {
        user: {
          uid: 'different-user',
          displayName: 'Different User'
        }
      }
      
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: unauthorizedUser
      })
      mockPostRepository.getById.mockResolvedValue(mockExistingPost)

      // Act
      const result = await postService.updatePost(mockUpdateData, mockToken)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Unauthorized to update this post')
    })
  })

  describe('deletePost', () => {
    const mockToken = 'valid-token'
    const mockUser = {
      user: {
        uid: 'user-123',
        displayName: 'Test User'
      }
    }

    const mockExistingPost: Post = {
      id: 'post-123',
      title: 'Test Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      category: 'Technology',
      tags: ['test'],
      featuredImage: 'https://example.com/image.jpg',
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: false,
      isFeatured: false,
      readTime: '5'
    }

    it('should delete a post successfully', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })
      mockPostRepository.getById.mockResolvedValue(mockExistingPost)
      mockPostRepository.delete.mockResolvedValue(true)

      // Act
      const result = await postService.deletePost('post-123', mockToken)

      // Assert
      expect(result.success).toBe(true)
      expect(mockPostRepository.delete).toHaveBeenCalledWith('post-123')
    })

    it('should return error for invalid token', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: { message: 'Invalid token' }
      })

      // Act
      const result = await postService.deletePost('post-123', 'invalid-token')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Invalid token')
    })

    it('should return error when post not found', async () => {
      // Arrange
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: mockUser
      })
      mockPostRepository.getById.mockResolvedValue(null)

      // Act
      const result = await postService.deletePost('post-123', mockToken)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Post not found')
    })

    it('should return error for unauthorized user', async () => {
      // Arrange
      const unauthorizedUser = {
        user: {
          uid: 'different-user',
          displayName: 'Different User'
        }
      }
      
      mockAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: unauthorizedUser
      })
      mockPostRepository.getById.mockResolvedValue(mockExistingPost)

      // Act
      const result = await postService.deletePost('post-123', mockToken)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Unauthorized to delete this post')
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
        featuredImage: 'https://example.com/image1.jpg',
        authorId: 'user-123',
        authorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'post-1',
        viewCount: 10,
        likeCount: 5,
        isPublished: true,
        isFeatured: false,
        readTime: '5',
        publishedAt: new Date()
      },
      {
        id: 'post-2',
        title: 'Post 2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        category: 'Lifestyle',
        tags: ['lifestyle'],
        featuredImage: 'https://example.com/image2.jpg',
        authorId: 'user-456',
        authorName: 'Another User',
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'post-2',
        viewCount: 20,
        likeCount: 8,
        isPublished: true,
        isFeatured: false,
        readTime: '3',
        publishedAt: new Date()
      }
    ]

    it('should get all posts successfully', async () => {
      // Arrange
      mockPostRepository.findMany.mockResolvedValue(mockPosts)
      mockPostRepository.count.mockResolvedValue(2)

      // Act
      const result = await postService.getPosts({})

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPosts)
      expect(result.pagination).toBeDefined()
      expect(mockPostRepository.findMany).toHaveBeenCalledWith({})
    })

    it('should get posts with filters', async () => {
      // Arrange
      const filters: PostFilters = {
        category: 'Technology',
        tags: ['tech'],
        authorId: 'user-123',
        isPublished: true
      }
      mockPostRepository.findMany.mockResolvedValue([mockPosts[0]])
      mockPostRepository.count.mockResolvedValue(1)

      // Act
      const result = await postService.getPosts(filters)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPosts[0]])
      expect(result.pagination).toBeDefined()
      expect(mockPostRepository.findMany).toHaveBeenCalledWith(filters)
    })

    it('should handle repository errors', async () => {
      // Arrange
      mockPostRepository.findMany.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await postService.getPosts({})

      // Assert
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Database error')
    })
  })

})