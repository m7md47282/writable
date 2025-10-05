'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '@/models';
import { postService } from '@/services/postService';
import { PostView, PageLoader } from '@/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';

export default function ViewPostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await postService.getPostById(postId, true);
        setPost(fetchedPost);
        
        try {
          await postService.incrementViewCount(postId);
        } catch (viewError) {
          console.warn('Failed to increment view count:', viewError);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <PageLoader text="Loading post..."  />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-orange-500 text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            {error || 'The post you are looking for does not exist or has been removed.'}
          </p>
          <Button 
            onClick={() => router.push('/')} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md h-[80px]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 rounded-xl px-4 py-2"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <PostView post={post} />
      </div>
    </div>
  );
}
