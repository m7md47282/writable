## Design Patterns Used

### 1) Singleton (Client-side PostService)

We use the Singleton pattern on the client to provide a single, shared instance of the `PostService` used by React components/pages. This avoids multiple instances with redundant configuration and centralizes HTTP logic.

Key benefits:
- Single shared instance across the app
- Centralized error handling and request building

Small example (from `src/services/postService.ts`):

```ts
export class PostService {
  private static instance: PostService;
  private constructor() {}
  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }
  // ... CRUD methods
}

export const postService = PostService.getInstance();
```

Usage in pages/components:

```ts
import postService from '@/services/postService';

async function onCreate(data) {
  await postService.createPost(data);
}
```

Why it fits here: a single HTTP client abstraction with consistent behavior is ideal for the app layer.

---

### 2) Repository (Server-side data access abstraction)

The Repository pattern isolates data access from business logic. It provides a clean API for CRUD and query operations and hides Firestore-specific details.

Key benefits:
- Swap/modify persistence with minimal changes to services
- Unit test business logic by mocking repositories

Small example (from `src/server/repositories/postRepository.ts`):

```ts
export class PostRepository extends BaseFirebaseRepository<Post> {
  constructor() {
    super('posts');
  }

  async findMany(filters?: PostFilters): Promise<Post[]> {
    let query: Query = this.db.collection(this.collectionName);
    // apply filters, sorting, pagination
    const snapshot = await query.get();
    // map to domain model
    return posts;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const postRef = this.db.collection(this.collectionName).doc(postId);
    await postRef.update({ viewCount: FieldValue.increment(1) });
  }
}
```

The `AuthRepository` uses the same pattern for users/auth with Firebase Admin.

---

### 3) Service Layer + Controller (Separation of concerns)

While not a GoF pattern, the Service Layer combined with Controllers is a common architectural pattern. Controllers validate/authenticate requests and delegate to services, which hold business rules. Services depend on repositories for persistence.

Structure:
- Controller: parse HTTP request, auth checks, shape HTTP response
- Service: domain rules (ownership checks, slug generation, timestamps)
- Repository: persistence operations

Small example (from `src/server/services/postService.ts`):

```ts
export class PostService {
  private postRepository = new PostRepository();
  private authService = new AuthService();

  async updatePost(updateData: UpdatePostData, token: string): Promise<PostResponse> {
    const authResult = await this.authService.verifyToken(token);
    const existingPost = await this.postRepository.getById(updateData.id);
    // ownership checks, apply timestamps, publish logic
    const updatedPost = await this.postRepository.update(updateData.id, cleanUpdateFields);
    return { success: true, data: updatedPost };
  }
}
```

And the Controller delegating (from `src/server/controllers/postController.ts`):

```ts
export class PostController {
  private postService = new PostService();

  async updatePost(request: NextRequest, { params }: { params: { id: string } }) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    const body = await request.json();
    const result = await this.postService.updatePost({ ...body, id: params.id }, token);
    return NextResponse.json(result);
  }
}
```

Why it fits here: Route handlers remain thin and focused on HTTP concerns; business logic stays reusable, testable, and framework-agnostic.

---

### 4) Context for State Management (React Context API)

The app uses React Context for global auth state. While Context isn’t a classical GoF pattern, it provides an observable-like state container for React trees.

Small example (from `src/contexts/AuthContext.tsx`):

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, user => setCurrentUser(user)), []);
  const value = { currentUser, login, signup, logout, loading };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
```

Why it fits here: It provides a single source of truth for authentication state and avoids prop drilling across pages/components.


