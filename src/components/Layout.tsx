import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">VoteVerse</h1>
              </Link>
              
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Anketler
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/create-poll"
                        className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Anket Oluştur
                      </Link>
                      <Link
                        to="/my-polls"
                        className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Anketlerim
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">
                    Merhaba, {user?.fullName || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 