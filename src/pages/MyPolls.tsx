import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollApi } from '../services/api';
import type { Poll, PaginatedResponse } from '../types';

const MyPolls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async (page = 0) => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Poll> = await pollApi.getUserPolls(page, 10);
      
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
      setError('Anketleriniz yüklenirken bir hata oluştu');
      console.error('Error loading user polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPolls(currentPage + 1);
    }
  };

  const handleDelete = async (pollId: number) => {
    if (!window.confirm('Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setDeletingId(pollId);
      await pollApi.deletePoll(pollId);
      
      // Silinen anketi listeden çıkar
      setPolls(prev => prev.filter(poll => poll.id !== pollId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Anket silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
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

  const getStatusColor = (poll: Poll) => {
    if (!poll.active) return 'bg-gray-100 text-gray-800';
    if (poll.isExpired) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (poll: Poll) => {
    if (!poll.active) return 'Silinmiş';
    if (poll.isExpired) return 'Süresi dolmuş';
    return 'Aktif';
  };

  if (loading && polls.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Anketleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Anketlerim</h1>
          <p className="mt-2 text-sm text-gray-700">
            Oluşturduğunuz anketleri görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/create-poll"
            className="btn-primary"
          >
            Yeni Anket Oluştur
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {polls.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz anket oluşturmamışsınız</h3>
          <p className="mt-1 text-sm text-gray-500">İlk anketinizi oluşturmak için başlayın.</p>
          <div className="mt-6">
            <Link
              to="/create-poll"
              className="btn-primary"
            >
              İlk Anketimi Oluştur
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {/* Desktop görünümü */}
          <div className="hidden md:block">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anket
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oylar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturulma
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {poll.title}
                          </div>
                          {poll.description && (
                            <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {poll.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {poll.options.length} seçenek
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(poll)}`}>
                          {getStatusText(poll)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {poll.totalVotes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(poll.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          to={`/poll/${poll.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Görüntüle
                        </Link>
                        {poll.active && (
                          <>
                            <Link
                              to={`/edit-poll/${poll.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Düzenle
                            </Link>
                            <button
                              onClick={() => handleDelete(poll.id)}
                              disabled={deletingId === poll.id}
                              className={`text-red-600 hover:text-red-900 ${deletingId === poll.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {deletingId === poll.id ? 'Siliniyor...' : 'Sil'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile görünümü */}
          <div className="md:hidden">
            <div className="space-y-4">
              {polls.map((poll) => (
                <div key={poll.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(poll)}`}>
                      {getStatusText(poll)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {poll.totalVotes} oy
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {poll.title}
                  </h3>
                  
                  {poll.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {poll.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4">
                    <p>{poll.options.length} seçenek</p>
                    <p>Tarih: {formatDate(poll.createdAt)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/poll/${poll.id}`}
                        className="btn-primary text-sm text-center"
                      >
                        Görüntüle
                      </Link>
                      {poll.active && (
                        <Link
                          to={`/edit-poll/${poll.id}`}
                          className="btn-secondary text-sm text-center"
                        >
                          Düzenle
                        </Link>
                      )}
                    </div>
                    {poll.active && (
                      <button
                        onClick={() => handleDelete(poll.id)}
                        disabled={deletingId === poll.id}
                        className={`btn-secondary text-sm w-full mt-2 ${deletingId === poll.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {deletingId === poll.id ? 'Siliniyor...' : 'Sil'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

export default MyPolls; 