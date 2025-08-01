import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import type { LoginRequest } from '../types';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authData = await authApi.login(formData);
      login(authData);
      navigate('/');
    } catch (err: any) {
      console.error('Login hatası:', err);
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Backend sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Kullanıcı adı/şifre hatalı veya istek formatı geçersiz');
      } else if (err.response?.status === 401) {
        setError('Kullanıcı adı veya şifre hatalı');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Kayıt olun
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                Kullanıcı Adı veya E-posta
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                required
                className="input-field"
                placeholder="Kullanıcı adınız veya e-posta adresiniz"
                value={formData.usernameOrEmail}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 