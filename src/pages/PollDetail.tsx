import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollApi, voteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Poll, VoteRequest } from '../types';

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadPoll();
    }
  }, [id]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const pollData = await pollApi.getPollById(Number(id));
      setPoll(pollData);
      setError('');
    } catch (err: any) {
      setError('Anket yüklenirken bir hata oluştu');
      console.error('Error loading poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !poll || !isAuthenticated) return;

    try {
      setVoting(true);
      const voteRequest: VoteRequest = { optionId: selectedOption };
      await voteApi.vote(poll.id, voteRequest);
      
      // Anketi yeniden yükle (güncel sonuçları almak için)
      await loadPoll();
      setSelectedOption(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Oy verirken bir hata oluştu');
    } finally {
      setVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!poll || !isAuthenticated) return;

    try {
      setVoting(true);
      await voteApi.removeVote(poll.id);
      
      // Anketi yeniden yükle
      await loadPoll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Oy geri alınırken bir hata oluştu');
    } finally {
      setVoting(false);
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

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Anket yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => navigate('/')}
            className="ml-4 btn-secondary text-sm"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Anket bulunamadı.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const canVote = isAuthenticated && !poll.hasUserVoted && !poll.isExpired;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="mb-4 text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            ← Geri Dön
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {poll.totalVotes} oy
            </span>
            {poll.isExpired && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Süresi dolmuş
              </span>
            )}
            {poll.allowMultipleVotes && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Çoklu oy
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{poll.title}</h1>
          
          {poll.description && (
            <p className="text-gray-600 text-lg mb-6">{poll.description}</p>
          )}
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Oluşturan: {poll.creator.fullName || poll.creator.username}</p>
            <p>Tarih: {formatDate(poll.createdAt)}</p>
            {poll.expiresAt && (
              <p>Son tarih: {formatDate(poll.expiresAt)}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Voting or Results */}
        <div className="card">
          {canVote ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Oyunuzu verin:
              </h3>
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <label 
                    key={option.id} 
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="vote"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900">{option.text}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className={`btn-primary ${(!selectedOption || voting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {voting ? 'Oy veriliyor...' : 'Oy Ver'}
                </button>
                
                {poll.hasUserVoted && poll.allowMultipleVotes && (
                  <button
                    onClick={handleRemoveVote}
                    disabled={voting}
                    className="btn-secondary"
                  >
                    Oyumu Geri Al
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Anket Sonuçları:
              </h3>
              
              {!isAuthenticated && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                  Oy vermek için{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="font-medium underline hover:no-underline"
                  >
                    giriş yapın
                  </button>
                  .
                </div>
              )}
              
              <div className="space-y-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-medium">{option.text}</span>
                      <span className="text-sm text-gray-600">
                        {option.voteCount} oy ({option.votePercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(option.votePercentage)}`}
                        style={{ width: `${option.votePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {poll.hasUserVoted && (
                <div className="mt-6 flex gap-3">
                  {poll.allowMultipleVotes && (
                    <button
                      onClick={handleRemoveVote}
                      disabled={voting}
                      className="btn-secondary"
                    >
                      Oyumu Geri Al
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetail; 