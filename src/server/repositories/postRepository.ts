import { Post, PostFilters } from '@/models';
import { BaseFirebaseRepository } from './baseFirebaseRepository';
import { Query, FieldValue } from 'firebase-admin/firestore';

export class PostRepository extends BaseFirebaseRepository<Post> {
  constructor() {
    super('posts');
  }

  async findMany(filters?: PostFilters): Promise<Post[]> {
    let query: Query = this.db.collection(this.collectionName);

    if (filters?.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters?.isPublished !== undefined) {
      query = query.where('isPublished', '==', filters.isPublished);
    }

    if (filters?.isFeatured !== undefined) {
      query = query.where('isFeatured', '==', filters.isFeatured);
    }

    if (filters?.authorId) {
      query = query.where('authorId', '==', filters.authorId);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.where('tags', 'array-contains-any', filters.tags);
    }


    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;
    
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limit);

    const snapshot = await query.get();
    const posts: Post[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        publishedAt: data.publishedAt?.toDate()
      } as Post);
    });

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      return posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
      );
    }

    return posts;
  }

  async count(filters?: PostFilters): Promise<number> {
    let query: Query = this.db.collection(this.collectionName);

    if (filters?.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters?.isPublished !== undefined) {
      query = query.where('isPublished', '==', filters.isPublished);
    }

    if (filters?.isFeatured !== undefined) {
      query = query.where('isFeatured', '==', filters.isFeatured);
    }

    if (filters?.authorId) {
      query = query.where('authorId', '==', filters.authorId);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.where('tags', 'array-contains-any', filters.tags);
    }

    const snapshot = await query.get();
    let count = snapshot.size;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      const posts: Post[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as Post);
      });

      count = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
      ).length;
    }

    return count;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const snapshot = await this.db.collection(this.collectionName).where('slug', '==', slug).limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      publishedAt: data.publishedAt?.toDate()
    } as Post;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const postRef = this.db.collection(this.collectionName).doc(postId);
    await postRef.update({
      viewCount: FieldValue.increment(1)
    });
  }

  async incrementLikeCount(postId: string): Promise<void> {
    const postRef = this.db.collection(this.collectionName).doc(postId);
    await postRef.update({
      likeCount: FieldValue.increment(1)
    });
  }

  async decrementLikeCount(postId: string): Promise<void> {
    const postRef = this.db.collection(this.collectionName).doc(postId);
    await postRef.update({
      likeCount: FieldValue.increment(-1)
    });
  }
}
