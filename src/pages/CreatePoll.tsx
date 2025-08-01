import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollApi } from '../services/api';
import type { CreatePollRequest } from '../types';

const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreatePollRequest>({
    title: '',
    description: '',
    options: ['', ''],
    allowMultipleVotes: false,
    expiresAt: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (formData.title.trim().length < 3) {
      setError('Başlık en az 3 karakter olmalıdır');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError('En az 2 seçenek eklemelisiniz');
      return;
    }

    // Expiry date validasyonu
    let expiresAt = undefined;
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= new Date()) {
        setError('Bitiş tarihi gelecekte olmalıdır');
        return;
      }
      expiresAt = expiryDate.toISOString();
    }

    const pollData: CreatePollRequest = {
      ...formData,
      options: validOptions,
      expiresAt,
    };

    try {
      setLoading(true);
      const newPoll = await pollApi.createPoll(pollData);
      navigate(`/poll/${newPoll.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Anket oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  // Minimum tarih (şu andan 1 saat sonra)
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="mb-4 text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            ← Geri Dön
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Yeni Anket Oluştur</h1>
          <p className="mt-2 text-gray-600">
            Topluluğun görüşlerini öğrenmek için bir anket oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Başlık */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Anket Başlığı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={200}
              className="input-field"
              placeholder="Anketinizin başlığını yazın"
              value={formData.title}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/200 karakter
            </p>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={1000}
              className="input-field resize-none"
              placeholder="Anketinizle ilgili ek bilgi ekleyin"
              value={formData.description}
              onChange={handleInputChange}
            />
                         <p className="mt-1 text-xs text-gray-500">
               {(formData.description || '').length}/1000 karakter
             </p>
          </div>

          {/* Seçenekler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seçenekler *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    maxLength={500}
                    className="input-field"
                    placeholder={`Seçenek ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 btn-secondary text-sm"
              >
                + Seçenek Ekle
              </button>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              En az 2, en fazla 10 seçenek ekleyebilirsiniz.
            </p>
          </div>

          {/* Çoklu oy */}
          <div className="flex items-center">
            <input
              id="allowMultipleVotes"
              name="allowMultipleVotes"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.allowMultipleVotes}
              onChange={handleInputChange}
            />
            <label htmlFor="allowMultipleVotes" className="ml-2 block text-sm text-gray-900">
              Kullanıcıların oylarını değiştirmesine izin ver
            </label>
          </div>

          {/* Bitiş tarihi */}
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Tarihi (İsteğe bağlı)
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              min={minDateTimeString}
              className="input-field"
              value={formData.expiresAt}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Boş bırakırsanız anket süresiz açık kalır.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll; 