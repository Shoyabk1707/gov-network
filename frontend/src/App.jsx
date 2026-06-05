import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Network from './components/Network';
import CreatorProfile from './components/CreatorProfile';
import ManagePages from './components/ManagePages';
import SinglePostView from './components/SinglePostView';
import SearchResults from './components/SearchResults';

// 🚀 FIX: AuthenticatedLayout ko App ke bahar nikala taaki re-render pe cursor na hate!
const AuthenticatedLayout = ({ children, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✨ SEARCH STATE AB YAHAN HAI
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center mb-6 px-4 md:px-10 gap-4">
        
        {/* Logo */}
        <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-blue-600 cursor-pointer flex-shrink-0">
          GovNetwork
        </h1>

        {/* 🔍 SEARCH BAR */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search posts, people, or pages..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-full py-2 pl-10 pr-4 text-sm transition shadow-inner"
          />
        </form>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center font-medium text-gray-700 flex-shrink-0">
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
        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Dashboard onLogout={handleLogout} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Profile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Network onViewProfile={(id) => navigate(`/creator/${id}`)} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/creator/:userId" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><CreatorProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />
        
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