import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PostController } from '@/server/controllers/postController'
import { PostService } from '@/server/services/postService'
import { CreatePostData, UpdatePostData } from '@/models'

// Mock the PostService
vi.mock('@/server/services/postService')

describe('PostController', () => {
  let postController: PostController
  let mockPostService: {
    createPost: ReturnType<typeof vi.fn>
    getPostById: ReturnType<typeof vi.fn>
    updatePost: ReturnType<typeof vi.fn>
    deletePost: ReturnType<typeof vi.fn>
    getPosts: ReturnType<typeof vi.fn>
    publishPost: ReturnType<typeof vi.fn>
    unpublishPost: ReturnType<typeof vi.fn>
    incrementViewCount: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create mock PostService
    mockPostService = {
      createPost: vi.fn(),
      getPostById: vi.fn(),
      updatePost: vi.fn(),
      deletePost: vi.fn(),
      getPosts: vi.fn(),
      publishPost: vi.fn(),
      unpublishPost: vi.fn(),
      incrementViewCount: vi.fn()
    }

    // Mock the constructor
    vi.mocked(PostService).mockReturnValue(mockPostService as unknown as PostService)

    postController = new PostController()
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

    it('should create a post successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          id: 'post-123',
          ...mockPostData,
          authorId: 'user-123',
          authorName: 'Test User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slug: 'test-post',
          viewCount: 0,
          likeCount: 0
        }
      }

      mockPostService.createPost.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(mockPostData)
      })

      // Act
      const response = await postController.createPost(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(mockPostService.createPost).toHaveBeenCalledWith(mockPostData, 'valid-token')
    })

    it('should return 401 when no authorization header', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockPostData)
      })

      // Act
      const response = await postController.createPost(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'No authorization header' }
      })
      expect(mockPostService.createPost).not.toHaveBeenCalled()
    })

    it('should return 400 when post creation fails', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        error: { message: 'Invalid post data' }
      }

      mockPostService.createPost.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(mockPostData)
      })

      // Act
      const response = await postController.createPost(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData).toEqual(mockResponse)
    })

    it('should handle internal server errors', async () => {
      // Arrange
      mockPostService.createPost.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(mockPostData)
      })

      // Act
      const response = await postController.createPost(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'Database error' }
      })
    })
  })

  describe('getPostById', () => {
    const mockPost = {
      id: 'post-123',
      title: 'Test Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      category: 'Technology',
      tags: ['test'],
      authorId: 'user-123',
      authorName: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: 'test-post',
      viewCount: 0,
      likeCount: 0,
      isPublished: true,
      publishedAt: new Date().toISOString()
    }

    it('should get a post by ID successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: mockPost
      }

      mockPostService.getPostById.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/post-123')
      const params = { id: 'post-123' }

      // Act
      const response = await postController.getPostById(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(mockPostService.getPostById).toHaveBeenCalledWith('post-123')
    })

    it('should return 200 with error when post not found', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        error: { message: 'Post not found' }
      }

      mockPostService.getPostById.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/non-existent')
      const params = { id: 'non-existent' }

      // Act
      const response = await postController.getPostById(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockResponse)
    })

    it('should handle internal server errors', async () => {
      // Arrange
      mockPostService.getPostById.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/posts/post-123')
      const params = { id: 'post-123' }

      // Act
      const response = await postController.getPostById(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'Database error' }
      })
    })
  })

  describe('updatePost', () => {
    const mockUpdateData: UpdatePostData = {
      id: 'post-123',
      title: 'Updated Post',
      content: 'Updated content',
      excerpt: 'Updated excerpt'
    }

    it('should update a post successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          ...mockUpdateData,
          authorId: 'user-123',
          authorName: 'Test User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slug: 'updated-post',
          viewCount: 0,
          likeCount: 0,
          isPublished: false
        }
      }

      mockPostService.updatePost.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/post-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(mockUpdateData)
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.updatePost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(mockPostService.updatePost).toHaveBeenCalledWith(mockUpdateData, 'valid-token')
    })

    it('should return 401 when no authorization header', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/posts/post-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockUpdateData)
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.updatePost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'No authorization header' }
      })
      expect(mockPostService.updatePost).not.toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Post deleted successfully'
      }

      mockPostService.deletePost.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/post-123', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.deletePost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockResponse)
      expect(mockPostService.deletePost).toHaveBeenCalledWith('post-123', 'valid-token')
    })

    it('should return 401 when no authorization header', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/posts/post-123', {
        method: 'DELETE'
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.deletePost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'No authorization header' }
      })
      expect(mockPostService.deletePost).not.toHaveBeenCalled()
    })
  })

  describe('getPosts', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Post 1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        category: 'Technology',
        tags: ['tech'],
        authorId: 'user-123',
        authorName: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: 'post-1',
        viewCount: 10,
        likeCount: 5,
        isPublished: true,
        publishedAt: new Date().toISOString()
      }
    ]

    it('should get all posts successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: mockPosts
      }

      mockPostService.getPosts.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts')

      // Act
      const response = await postController.getPosts(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(mockPostService.getPosts).toHaveBeenCalledWith({})
    })

    it('should handle internal server errors', async () => {
      // Arrange
      mockPostService.getPosts.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/posts')

      // Act
      const response = await postController.getPosts(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'Database error' }
      })
    })
  })

  describe('publishPost', () => {
    it('should publish a post successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          id: 'post-123',
          title: 'Test Post',
          isPublished: true,
          publishedAt: new Date().toISOString()
        }
      }

      mockPostService.publishPost.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/post-123/publish', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.publishPost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(mockPostService.publishPost).toHaveBeenCalledWith('post-123', 'valid-token')
    })

    it('should return 401 when no authorization header', async () => {
      // Arrange
      const request = new NextRequest('http://localhost/api/posts/post-123/publish', {
        method: 'PUT'
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.publishPost(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'No authorization header' }
      })
      expect(mockPostService.publishPost).not.toHaveBeenCalled()
    })
  })

  describe('incrementViewCount', () => {
    it('should increment view count successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          id: 'post-123',
          viewCount: 11
        }
      }

      mockPostService.incrementViewCount.mockResolvedValue(mockResponse)

      const request = new NextRequest('http://localhost/api/posts/post-123/view', {
        method: 'PUT'
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.incrementViewCount(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockResponse)
      expect(mockPostService.incrementViewCount).toHaveBeenCalledWith('post-123')
    })

    it('should handle internal server errors', async () => {
      // Arrange
      mockPostService.incrementViewCount.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/posts/post-123/view', {
        method: 'PUT'
      })
      const params = { id: 'post-123' }

      // Act
      const response = await postController.incrementViewCount(request, { params })
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: { message: 'Database error' }
      })
    })
  })
})