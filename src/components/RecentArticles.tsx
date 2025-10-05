import Link from "next/link";

interface Article {
  id?: string;
  title: string;
  timeAgo: string;
}

interface RecentArticlesProps {
  articles: Article[];
}

export default function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
      <div className="space-y-3">
        {articles.map((article, index) => (
          <Link 
            key={index} 
            href={article.id ? `/posts/${article.id}` : '#'}
            className="block border-l-4 border-orange-500 pl-3 hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
          >
            <h4 className="font-medium text-gray-900">{article.title}</h4>
            <p className="text-sm text-gray-600">{article.timeAgo}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
