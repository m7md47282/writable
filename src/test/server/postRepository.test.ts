import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostRepository } from '@/server/repositories/postRepository'
import { BaseFirebaseRepository } from '@/server/repositories/baseFirebaseRepository'
import { Post, PostFilters } from '@/models'

// Mock the base repository
vi.mock('@/server/repositories/baseFirebaseRepository')

describe('PostRepository', () => {
  let postRepository: PostRepository
  let mockBaseRepository: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create mock base repository
    mockBaseRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findBySlug: vi.fn(),
      count: vi.fn(),
      incrementViewCount: vi.fn(),
      incrementLikeCount: vi.fn(),
      decrementLikeCount: vi.fn()
    }

    // Mock the base repository constructor
    vi.mocked(BaseFirebaseRepository).mockImplementation(() => mockBaseRepository)

    postRepository = new PostRepository()
  })

  describe('create', () => {
    const mockPostData: Omit<Post, 'id'> = {
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      category: 'Technology',
      tags: ['test', 'blog'],
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

    it('should create a post successfully', async () => {
      // Arrange
      const expectedPost: Post = {
        id: 'post-123',
        ...mockPostData
      }

      mockBaseRepository.create.mockResolvedValue(expectedPost)

      // Act
      const result = await postRepository.create(mockPostData)

      // Assert
      expect(result).toEqual(expectedPost)
      expect(mockBaseRepository.create).toHaveBeenCalledWith(mockPostData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      mockBaseRepository.create.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.create(mockPostData)).rejects.toThrow('Firebase error')
    })
  })

  describe('getById', () => {
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
      mockBaseRepository.getById.mockResolvedValue(mockPost)

      // Act
      const result = await postRepository.getById('post-123')

      // Assert
      expect(result).toEqual(mockPost)
      expect(mockBaseRepository.getById).toHaveBeenCalledWith('post-123')
    })

    it('should return null when post not found', async () => {
      // Arrange
      mockBaseRepository.getById.mockResolvedValue(null)

      // Act
      const result = await postRepository.getById('non-existent')

      // Assert
      expect(result).toBeNull()
    })

    it('should handle retrieval errors', async () => {
      // Arrange
      mockBaseRepository.getById.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.getById('post-123')).rejects.toThrow('Firebase error')
    })
  })

  describe('update', () => {
    const mockUpdateData = {
      title: 'Updated Post',
      content: 'Updated content',
      updatedAt: new Date()
    }

    const mockUpdatedPost: Post = {
      id: 'post-123',
      title: 'Updated Post',
      content: 'Updated content',
      excerpt: 'Test excerpt',
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
      mockBaseRepository.update.mockResolvedValue(mockUpdatedPost)

      // Act
      const result = await postRepository.update('post-123', mockUpdateData)

      // Assert
      expect(result).toEqual(mockUpdatedPost)
      expect(mockBaseRepository.update).toHaveBeenCalledWith('post-123', mockUpdateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      mockBaseRepository.update.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.update('post-123', mockUpdateData)).rejects.toThrow('Firebase error')
    })
  })

  describe('delete', () => {
    it('should delete a post successfully', async () => {
      // Arrange
      mockBaseRepository.delete.mockResolvedValue(true)

      // Act
      const result = await postRepository.delete('post-123')

      // Assert
      expect(result).toBe(true)
      expect(mockBaseRepository.delete).toHaveBeenCalledWith('post-123')
    })

    it('should handle deletion errors', async () => {
      // Arrange
      mockBaseRepository.delete.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.delete('post-123')).rejects.toThrow('Firebase error')
    })
  })

  describe('findMany', () => {
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
      mockBaseRepository.findMany.mockResolvedValue(mockPosts)

      // Act
      const result = await postRepository.findMany({})

      // Assert
      expect(result).toEqual(mockPosts)
      expect(mockBaseRepository.findMany).toHaveBeenCalledWith({})
    })

    it('should get posts with filters', async () => {
      // Arrange
      const filters: PostFilters = {
        category: 'Technology',
        isPublished: true,
        authorId: 'user-123'
      }
      const filteredPosts = [mockPosts[0]]
      mockBaseRepository.findMany.mockResolvedValue(filteredPosts)

      // Act
      const result = await postRepository.findMany(filters)

      // Assert
      expect(result).toEqual(filteredPosts)
      expect(mockBaseRepository.findMany).toHaveBeenCalledWith(filters)
    })

    it('should handle retrieval errors', async () => {
      // Arrange
      mockBaseRepository.findMany.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.findMany({})).rejects.toThrow('Firebase error')
    })
  })

  describe('findBySlug', () => {
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

    it('should find a post by slug successfully', async () => {
      // Arrange
      mockBaseRepository.findBySlug.mockResolvedValue(mockPost)

      // Act
      const result = await postRepository.findBySlug('test-post')

      // Assert
      expect(result).toEqual(mockPost)
      expect(mockBaseRepository.findBySlug).toHaveBeenCalledWith('test-post')
    })

    it('should return null when post not found', async () => {
      // Arrange
      mockBaseRepository.findBySlug.mockResolvedValue(null)

      // Act
      const result = await postRepository.findBySlug('non-existent')

      // Assert
      expect(result).toBeNull()
    })

    it('should handle retrieval errors', async () => {
      // Arrange
      mockBaseRepository.findBySlug.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.findBySlug('test-post')).rejects.toThrow('Firebase error')
    })
  })

  describe('count', () => {
    it('should count posts successfully', async () => {
      // Arrange
      mockBaseRepository.count.mockResolvedValue(5)

      // Act
      const result = await postRepository.count({})

      // Assert
      expect(result).toBe(5)
      expect(mockBaseRepository.count).toHaveBeenCalledWith({})
    })

    it('should count posts with filters', async () => {
      // Arrange
      const filters: PostFilters = {
        category: 'Technology',
        isPublished: true
      }
      mockBaseRepository.count.mockResolvedValue(3)

      // Act
      const result = await postRepository.count(filters)

      // Assert
      expect(result).toBe(3)
      expect(mockBaseRepository.count).toHaveBeenCalledWith(filters)
    })

    it('should handle count errors', async () => {
      // Arrange
      mockBaseRepository.count.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.count({})).rejects.toThrow('Firebase error')
    })
  })

  describe('incrementViewCount', () => {
    it('should increment view count successfully', async () => {
      // Arrange
      mockBaseRepository.incrementViewCount.mockResolvedValue(undefined)

      // Act
      await postRepository.incrementViewCount('post-123')

      // Assert
      expect(mockBaseRepository.incrementViewCount).toHaveBeenCalledWith('post-123')
    })

    it('should handle increment errors', async () => {
      // Arrange
      mockBaseRepository.incrementViewCount.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.incrementViewCount('post-123')).rejects.toThrow('Firebase error')
    })
  })

  describe('incrementLikeCount', () => {
    it('should increment like count successfully', async () => {
      // Arrange
      mockBaseRepository.incrementLikeCount.mockResolvedValue(undefined)

      // Act
      await postRepository.incrementLikeCount('post-123')

      // Assert
      expect(mockBaseRepository.incrementLikeCount).toHaveBeenCalledWith('post-123')
    })

    it('should handle increment errors', async () => {
      // Arrange
      mockBaseRepository.incrementLikeCount.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.incrementLikeCount('post-123')).rejects.toThrow('Firebase error')
    })
  })

  describe('decrementLikeCount', () => {
    it('should decrement like count successfully', async () => {
      // Arrange
      mockBaseRepository.decrementLikeCount.mockResolvedValue(undefined)

      // Act
      await postRepository.decrementLikeCount('post-123')

      // Assert
      expect(mockBaseRepository.decrementLikeCount).toHaveBeenCalledWith('post-123')
    })

    it('should handle decrement errors', async () => {
      // Arrange
      mockBaseRepository.decrementLikeCount.mockRejectedValue(new Error('Firebase error'))

      // Act & Assert
      await expect(postRepository.decrementLikeCount('post-123')).rejects.toThrow('Firebase error')
    })
  })
})