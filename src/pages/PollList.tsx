import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollApi } from '../services/api';
import type { Poll, PaginatedResponse } from '../types';

const PollList: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async (page = 0) => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Poll> = await pollApi.getPolls(page, 10);
      
      if (page === 0) {
        setPolls(response.content);
      } else {
        setPolls(prev => [...prev, ...response.content]);
      }
      
      setCurrentPage(page);
      setTotalPages(response.totalPages);
      setHasMore(!response.last);
      setError('');
    } catch (err: any) {
      setError('Anketler yüklenirken bir hata oluştu');
      console.error('Error loading polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPolls(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && polls.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Anketler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Aktif Anketler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Topluluk tarafından oluşturulan anketlere katılın ve görüşlerinizi paylaşın.
          </p>
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Henüz anket bulunmuyor.</p>
          <p className="text-gray-400 mt-2">İlk anketi oluşturmak ister misiniz?</p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <div key={poll.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {poll.totalVotes} oy
                  </span>
                  {poll.isExpired && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Süresi dolmuş
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {poll.title}
                </h3>
                
                {poll.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {poll.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500 mb-4">
                  <p>Oluşturan: {poll.creator.fullName || poll.creator.username}</p>
                  <p>Tarih: {formatDate(poll.createdAt)}</p>
                  {poll.expiresAt && (
                    <p>Son tarih: {formatDate(poll.expiresAt)}</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {poll.options.length} seçenek
                  </span>
                  <Link
                    to={`/poll/${poll.id}`}
                    className="btn-primary text-sm"
                  >
                    {poll.hasUserVoted ? 'Sonuçları Gör' : 'Oy Ver'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PollList; 