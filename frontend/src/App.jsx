import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Network from './components/Network';
import CreatorProfile from './components/CreatorProfile';
import ManagePages from './components/ManagePages';
import SinglePostView from './components/SinglePostView';

function App() {
  // 🔥 FIX 1: Synchronous token check! Isse naye tab me load hone par race condition nahi aayegi.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // 🌍 UI components wrapper for logged-in users (Navbar etc)
  const AuthenticatedLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center mb-6 px-4 md:px-10">
        <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-blue-600 cursor-pointer">
          GovNetwork
        </h1>
        <div className="flex gap-6 items-center font-medium text-gray-700">
          <button onClick={() => navigate('/')} className={location.pathname === '/' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Feed</button>
          <button onClick={() => navigate('/network')} className={location.pathname.startsWith('/network') || location.pathname.startsWith('/creator') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Network</button>
          <button onClick={() => navigate('/pages')} className={location.pathname === '/pages' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Pages</button>
          <button onClick={() => navigate('/profile')} className={location.pathname === '/profile' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Profile</button>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition">Logout</button>
        </div>
      </nav>
      {children}
    </div>
  );

  return (
    <Routes>
      {/* 🚀 FIX 2: PUBLIC ROUTE (Bina login wale bhi dekh payenge, aur logged in wale bhi) */}
      <Route path="/post/:id" element={
        isAuthenticated ? (
          <AuthenticatedLayout><SinglePostView /></AuthenticatedLayout>
        ) : (
          <div className="min-h-screen bg-gray-100 py-10"><SinglePostView /></div>
        )
      } />

      {/* --- AUTHENTICATED ROUTES --- */}
      <Route path="/" element={<ProtectedRoute><AuthenticatedLayout><Dashboard onLogout={handleLogout} /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout><Profile /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout><Network onViewProfile={(id) => navigate(`/creator/${id}`)} /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/creator/:userId" element={<ProtectedRoute><AuthenticatedLayout><CreatorProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />

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
  );
}

// Helper wrapper for CreatorProfile
import { useParams } from 'react-router-dom';
const CreatorProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <CreatorProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;