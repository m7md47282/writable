# Design Patterns Implementation & System Design Decisions

## Overview

This blog application implements several key design patterns to ensure maintainability, testability, and scalability. The architecture follows a layered approach with clear separation of concerns.

## 1. Repository Pattern

### Implementation
The Repository pattern abstracts data access logic and provides a clean interface for CRUD operations.

**Base Repository (`src/server/repositories/baseFirebaseRepository.ts`):**
```typescript
export abstract class BaseFirebaseRepository<T extends DocumentData> {
  protected db = getFirebaseAdminFirestore();
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(data: T, id?: string): Promise<T & { id: string }> {
    // Implementation details hidden from business logic
  }

  async getById(id: string): Promise<T | null> {
    // Firestore-specific query logic
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    // Update logic with proper error handling
  }
}
```

**Concrete Repository (`src/server/repositories/postRepository.ts`):**
```typescript
export class PostRepository extends BaseFirebaseRepository<Post> {
  constructor() {
    super('posts');
  }

  async findMany(filters?: PostFilters): Promise<Post[]> {
    let query: Query = this.db.collection(this.collectionName);
    // Apply filters, sorting, pagination
    const snapshot = await query.get();
    return posts;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const postRef = this.db.collection(this.collectionName).doc(postId);
    await postRef.update({ viewCount: FieldValue.increment(1) });
  }
}
```

### Justification
- **Data Access Abstraction**: Hides Firestore-specific implementation details from business logic
- **Testability**: Easy to mock repositories for unit testing business logic
- **Flexibility**: Can swap data sources (Firestore → PostgreSQL) without changing service layer
- **Consistency**: Provides uniform interface across different entity types
- **Reusability**: Base repository eliminates code duplication

## 2. Service Layer Pattern

### Implementation
Services contain business logic and orchestrate between repositories and external services.

**Post Service (`src/server/services/postService.ts`):**
```typescript
export class PostService {
  private postRepository = new PostRepository();
  private authService = new AuthService();

  async createPost(postData: CreatePostData, token: string): Promise<PostResponse> {
    // 1. Authentication
    const authResult = await this.authService.verifyToken(token);
    if (!authResult.success) {
      return { success: false, error: { message: 'Invalid token' } };
    }

    // 2. Business Logic
    const user = authResult.data as { user: { uid: string; displayName?: string } };
    const postDataWithMetadata = {
      ...postData,
      authorId: user.user.uid,
      authorName: user.user.displayName || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: this.generateSlug(postData.title),
      viewCount: 0,
      likeCount: 0,
      ...(postData.isPublished && { publishedAt: new Date() })
    };

    // 3. Persistence
    const createdPost = await this.postRepository.create(cleanPostData);
    
    return { success: true, data: createdPost };
  }

  async updatePost(updateData: UpdatePostData, token: string): Promise<PostResponse> {
    // 1. Authentication
    const authResult = await this.authService.verifyToken(token);
    
    // 2. Authorization (ownership check)
    const existingPost = await this.postRepository.getById(updateData.id);
    if (existingPost.authorId !== userId) {
      return { success: false, error: { message: 'Unauthorized to update this post' } };
    }

    // 3. Business Logic
    const updateFields: Partial<Post> = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.isPublished && !existingPost.isPublished) {
      updateFields.publishedAt = new Date();
    }

    // 4. Persistence
    const updatedPost = await this.postRepository.update(updateData.id, cleanUpdateFields);
    
    return { success: true, data: updatedPost };
  }
}
```

### Justification
- **Business Logic Centralization**: All domain rules in one place
- **Transaction Management**: Handles complex operations atomically
- **Authorization**: Implements ownership and permission checks
- **Data Transformation**: Applies business rules (slug generation, timestamps)
- **Error Handling**: Consistent error responses across operations

## 3. Controller Pattern

### Implementation
Controllers handle HTTP concerns and delegate to services.

**Post Controller (`src/server/controllers/postController.ts`):**
```typescript
export class PostController {
  private postService = new PostService();

  async createPost(request: NextRequest) {
    try {
      // 1. HTTP Request Parsing
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
      
      // 2. Delegate to Service
      const result = await this.postService.createPost(postData, token);
      
      // 3. HTTP Response Shaping
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

  async getPosts(request: NextRequest) {
    try {
      // 1. Query Parameter Parsing
      const { searchParams } = new URL(request.url);
      
      const filters: PostFilters = {};
      const category = searchParams.get('category');
      const tags = searchParams.get('tags');
      // ... parse all query parameters
      
      // 2. Delegate to Service
      const result = await this.postService.getPosts(filters);
      
      // 3. Return Response
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
}
```

### Justification
- **HTTP Concerns Separation**: Handles request/response parsing
- **Thin Controllers**: Minimal logic, delegates to services
- **Consistent Error Handling**: Standardized error responses
- **Framework Independence**: Services remain framework-agnostic
- **Validation**: Input validation and sanitization

## 4. Singleton Pattern (Client-side)

### Implementation
Ensures single instance of HTTP service across the application.

**Client Post Service (`src/services/postService.ts`):**
```typescript
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
    const response = await Post({ url: '/api/posts', body: postData }) as PostResponse;
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create post');
    }
    
    return response.data;
  }
}

// Export singleton instance
export const postService = PostService.getInstance();
export default postService;
```

### Justification
- **Resource Efficiency**: Single HTTP client instance
- **Consistent Configuration**: Shared base URL, headers, interceptors
- **State Management**: Centralized request/response handling
- **Memory Optimization**: Prevents multiple service instances

## 5. Context Pattern (React State Management)

### Implementation
Provides global authentication state across React components.

**Auth Context (`src/contexts/AuthContext.tsx`):**
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Login logic
  };

  const signup = async (email: string, password: string) => {
    // Signup logic
  };

  const logout = async () => {
    // Logout logic
  };

  const value = { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loading 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### Justification
- **Global State**: Single source of truth for authentication
- **Prop Drilling Elimination**: Avoids passing auth state through multiple components
- **Reactive Updates**: Automatic re-renders when auth state changes
- **Centralized Logic**: All auth operations in one place

## Architecture Benefits

### 1. Separation of Concerns
- **Controllers**: HTTP request/response handling
- **Services**: Business logic and orchestration
- **Repositories**: Data access and persistence
- **Models**: Data structures and validation

### 2. Testability
- **Unit Testing**: Each layer can be tested independently
- **Mocking**: Easy to mock dependencies (repositories, external services)
- **Integration Testing**: Test service-repository interactions
- **E2E Testing**: Test complete request-response cycles

### 3. Maintainability
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed Principle**: Easy to extend without modifying existing code
- **Dependency Inversion**: High-level modules don't depend on low-level modules

### 4. Scalability
- **Horizontal Scaling**: Stateless services can be replicated
- **Database Independence**: Repository pattern allows database switching
- **Microservice Ready**: Clear boundaries enable service extraction

## Design Decisions Summary

1. **Layered Architecture**: Clear separation between presentation, business, and data layers
2. **Repository Pattern**: Abstracts data access for flexibility and testability
3. **Service Layer**: Centralizes business logic and transaction management
4. **Controller Pattern**: Handles HTTP concerns while keeping business logic separate
5. **Singleton Pattern**: Optimizes client-side resource usage
6. **Context Pattern**: Manages global state efficiently in React
7. **Error Handling**: Consistent error responses across all layers
8. **Type Safety**: Full TypeScript implementation for compile-time error detection

This architecture provides a solid foundation for a scalable, maintainable blog application with clear separation of concerns and excellent testability.
