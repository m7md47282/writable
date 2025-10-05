"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FeaturedContent from "@/components/FeaturedContent";
import { postService } from "@/services/postService";
import { Post } from "@/models";
import { PageLoader } from "@/components";

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [categoryPostsMap, setCategoryPostsMap] = useState<Record<string, Post[]>>({});
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/");
    }
  }, [currentUser, loading, router]);


  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentUser) return;
      
      try {
        setPostsLoading(true);
        setPostsError(null);

        const featuredResponse = await postService.getFeaturedPosts(6);

        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedPosts(featuredResponse.data);
        }
        const allPublishedResponse = await postService.getPosts({ isPublished: true, limit: 60, sortBy: 'publishedAt', sortOrder: 'desc' });
        if (allPublishedResponse.success && allPublishedResponse.data) {
          const grouped: Record<string, Post[]> = {};
          for (const post of allPublishedResponse.data) {
            const key = (post.category || 'Uncategorized').trim();
            if (!grouped[key]) grouped[key] = [];
            if (grouped[key].length < 6) grouped[key].push(post);
          }
          setCategoryPostsMap(grouped);
        }
      } catch (error) {
        setPostsError(error instanceof Error ? error.message : 'Failed to fetch posts');
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

  const featuredArticles = featuredPosts.map(post => ({
    id: post.id,
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    category: post.category,
    readTime: post.readTime,
    createdAt: post.createdAt ? (post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)) : undefined,
    updatedAt: post.updatedAt ? (post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt)) : undefined,
    authorName: post.authorName,
    tags: post.tags,
    viewCount: post.viewCount
  }));

  const categorySections = Object.entries(categoryPostsMap).map(([category, posts]) => ({
    category,
    articles: posts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.excerpt,
      image: post.featuredImage,
      category: post.category,
      readTime: post.readTime,
      createdAt: post.createdAt ? (post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)) : undefined,
      updatedAt: post.updatedAt ? (post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt)) : undefined,
      authorName: post.authorName,
      tags: post.tags,
      viewCount: post.viewCount
    }))
  }));


  if (loading || postsLoading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return null;
  }

  if (postsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Posts</h2>
          <p className="text-gray-600 mb-4">{postsError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.displayName || currentUser.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s your personalized content
          </p>
        </div>

        <FeaturedContent title="Featured" articles={featuredArticles} />

        {categorySections.map(({ category, articles }) => (
          <FeaturedContent key={category} title={category} articles={articles} />
        ))}
      </div>
    </div>
  );
}
