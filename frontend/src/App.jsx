import { useState, useEffect } from 'react';
// ✨ NEW: Imported structural route components from react-router-dom
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Network from './components/Network';
import CreatorProfile from './components/CreatorProfile';
import ManagePages from './components/ManagePages';
import SinglePostView from './components/SinglePostView';

// 🔗 Temporary Placeholder for Single Post View so share links don't throw 404
const SinglePostViewPlaceholder = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow border text-center">
      <h2 className="text-xl font-bold text-gray-800">Post View System Initializing</h2>
      <p className="text-sm text-gray-500 mt-2">Hum jaldi hi is page ka functional code bana kar replace karenge!</p>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  
  // ✨ React Router hooks for handling redirection and current active track path
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login'); // Redirect instantly to login route
  };

  // Safe wrapper check to bounce unauthenticated traffic back to login path
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        
        {/* --- NAVIGATION BAR (ROUTER UPGRADED) --- */}
        <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center mb-6 px-4 md:px-10">
          <h1 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer"
          >
            GovNetwork
          </h1>
          
          <div className="flex gap-6 items-center font-medium text-gray-700">
            <button 
              onClick={() => navigate('/')} 
              className={location.pathname === '/' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Feed
            </button>
            <button 
              onClick={() => navigate('/network')} 
              className={location.pathname.startsWith('/network') || location.pathname.startsWith('/creator') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Network
            </button>
            <button 
              onClick={() => navigate('/pages')} 
              className={location.pathname === '/pages' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Pages
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className={location.pathname === '/profile' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Profile
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* --- 🏁 DECLARATIVE ROUTING ENGINE GRID --- */}
        <div>
          <Routes>
            {/* Main feed endpoint guarded */}
            <Route path="/" element={<ProtectedRoute><Dashboard onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><Network onViewProfile={(id) => navigate(`/creator/${id}`)} /></ProtectedRoute>} />
            <Route path="/creator/:userId" element={<ProtectedRoute><CreatorProfileWrapper /></ProtectedRoute>} />
            <Route path="/pages" element={<ProtectedRoute><ManagePages onBack={() => navigate('/')} /></ProtectedRoute>} />
            
            {/* 🔗 THE MAGIC LINK ROUTE: Publicly accessible isolated wrapper */}
            <Route path="/post/:id" element={<SinglePostView />} />            
            {/* Fallback route redirection control */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Auth screen routes (Login/Register template)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Routes>
        <Route path="/login" element={showLogin ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/register" replace />} />
        <Route path="/register" element={!showLogin ? <Register /> : <Navigate to="/login" replace />} />
        {/* Dynamic traffic catch */}
        <Route path="*" element={
          <div className="flex flex-col items-center">
            {showLogin ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Register />}
            <button onClick={() => setShowLogin(!showLogin)} className="mt-4 text-blue-600 underline">
              {showLogin ? "Need an account? Register here." : "Already have an account? Login here."}
            </button>
          </div>
        } />
      </Routes>
    </div>
  );
}

// 📦 Helper wrapper to extract params from URL inside route mapping seamlessly
import { useParams } from 'react-router-dom';
const CreatorProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <CreatorProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;