import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import PollList from './pages/PollList';
import PollDetail from './pages/PollDetail';
import CreatePoll from './pages/CreatePoll';
import EditPoll from './pages/EditPoll';
import MyPolls from './pages/MyPolls';

// Protected Route bileşeni
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route (sadece giriş yapmamış kullanıcılar için)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PollList />} />
        <Route path="/poll/:id" element={<PollDetail />} />
        
        {/* Auth routes (sadece giriş yapmamış kullanıcılar) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes (sadece giriş yapmış kullanıcılar) */}
        <Route 
          path="/create-poll" 
          element={
            <ProtectedRoute>
              <CreatePoll />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-poll/:id" 
          element={
            <ProtectedRoute>
              <EditPoll />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-polls" 
          element={
            <ProtectedRoute>
              <MyPolls />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
