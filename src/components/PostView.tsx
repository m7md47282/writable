'use client';

import { Post } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, Tag, BookOpen, TrendingUp, Eye } from 'lucide-react';
import Image from 'next/image';

interface PostViewProps {
  post: Post;
}

export default function PostView({ post }: PostViewProps) {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return '';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="group relative">
      {post.featuredImage && (
        <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-2xl mb-8">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute top-6 left-6">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              {post.category}
            </Badge>
          </div>

        </div>
      )}

      <div className="mx-auto px-4">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center justify-center">
                <Eye className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-medium">{post.viewCount || 0}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed font-light">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">{post.authorName || 'Anonymous'}</span>
            </div>
            
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <span>Published {formatDate(post.publishedAt)}</span>
              </div>
            )}
            
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <span className="font-medium">{post.readTime} min read</span>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-orange max-w-none mb-12">
          <div 
            className="text-gray-800 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Tagged with:</span>
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>
                {post.createdAt && `Created ${formatDateTime(post.createdAt)}`}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
