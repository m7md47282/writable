import { EyeIcon } from "lucide-react";
import Link from "next/link";

const getTimeAgo = (date: Date | undefined): string => {
  if (!date) return '';
  
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

interface FeaturedArticle {
  id?: string;
  title: string;
  description: string;
  image: string;
  category: string;
  readTime: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  authorName: string | undefined;
  tags: string[];
  viewCount: number | undefined;
}

interface FeaturedContentProps {
  articles: FeaturedArticle[];
  title?: string;
}

export default function FeaturedContent({ articles, title }: FeaturedContentProps) {
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title || 'Featured Content'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <Link 
            key={index} 
            href={article.id ? `/posts/${article.id}` : '#'}
            className="rounded-sm overflow-hidden cursor-pointer"
          >
            <div 
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${article.image})` }}
            />
            <div className="py-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.readTime} Mins</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">By {article.authorName || 'Unknown'}</span>
                <div className="text-right">
                  {article.updatedAt && (
                    <div className="text-xs text-gray-400">
                      Updated {getTimeAgo(article.updatedAt)} 
                    </div>
                  )}
                </div>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  {article.viewCount || 0} 
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
