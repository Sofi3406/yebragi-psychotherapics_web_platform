import { useEffect, useState } from 'react';
import { articleService, Article } from '../services/articleService';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MainLayout } from '../components/Layout/MainLayout';
import toast from 'react-hot-toast';

export const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await articleService.list();
      setArticles(data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (id: number) => {
    try {
      const article = await articleService.getOne(id);
      setSelectedArticle(article);
    } catch (error) {
      toast.error('Failed to load article');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mental Health Articles</h1>
          <p className="mt-2 text-gray-600">Explore our curated collection of mental health resources</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : selectedArticle ? (
          <div className="bg-white rounded-xl shadow-md p-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Articles
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(selectedArticle.createdAt), 'MMMM dd, yyyy')}</span>
              </span>
            </div>
            {selectedArticle.content ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            ) : (
              <p className="text-gray-600 mb-4">Content not available. Please visit the original source.</p>
            )}
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>Read Original Article</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => handleArticleClick(article.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {article.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(article.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Read More →
                </button>
              </div>
            ))}
          </div>
        )}

        {articles.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Available</h3>
            <p className="text-gray-600">Check back later for new articles.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};



