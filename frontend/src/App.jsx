import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar'; // 🚀 NAYA IMPORT
import Register from './components/Register';
import Login from './components/Login';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Network from './components/Network';
import CreatorProfile from './components/CreatorProfile';
import ManagePages from './components/ManagePages';
import SinglePostView from './components/SinglePostView';
import SearchResults from './components/SearchResults';
import PageProfile from './components/PageProfile';

// 🚀 CLEAN AuthenticatedLayout
const AuthenticatedLayout = ({ children, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar handleLogout={handleLogout} />
      {children}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(true);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* 🚀 PUBLIC ROUTE */}
        <Route path="/post/:id" element={
          isAuthenticated ? (
            <AuthenticatedLayout handleLogout={handleLogout}><SinglePostView /></AuthenticatedLayout>
          ) : (
            <div className="min-h-screen bg-gray-100 py-10"><SinglePostView /></div>
          )
        } />

        {/* --- AUTHENTICATED ROUTES --- */}
        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Feed onLogout={handleLogout} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Profile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Network onViewProfile={(id) => navigate(`/creator/${id}`)} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/creator/:userId" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><CreatorProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/page/:id" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><PageProfile /></AuthenticatedLayout></ProtectedRoute>} />
        
        {/* 🔍 SEARCH ROUTE */}
        <Route path="/search" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><SearchResults /></AuthenticatedLayout></ProtectedRoute>} />
        

        {/* --- UNAUTHENTICATED ROUTES (Login/Register) --- */}
        <Route path="/login" element={
          !isAuthenticated ? (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
              {showLogin ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Register />}
              <button onClick={() => setShowLogin(!showLogin)} className="mt-4 text-blue-600 underline">
                {showLogin ? "Need an account? Register here." : "Already have an account? Login here."}
              </button>
            </div>
          ) : <Navigate to="/" replace />
        } />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

// Helper wrapper for CreatorProfile
const CreatorProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <CreatorProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;