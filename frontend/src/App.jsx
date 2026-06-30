import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from './config';
import { SocketProvider, SocketContext } from './context/SocketContext'; // 🚀 IMPORT CENTRALIZED PRODUCER HOOKS
import { useContext } from 'react';

// Components
import Navbar from './components/Navbar'; 
import Feed from './components/Feed';
import Profile from './components/Profile';
import Network from './components/Network';
import UserProfile from './components/UserProfile'; 
import ManagePages from './components/ManagePages';
import SinglePostView from './components/SinglePostView';
import SearchResults from './components/SearchResults';
import PageProfile from './components/PageProfile';
import Auth from './components/Auth';
import Notifications from './components/Notifications'; 

// APP SHELL COMPONENTS
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomNav from './components/BottomNav';
import Messages from './components/Messages';

const MobileDrawer = ({ isOpen, onClose, handleLogout, currentUser }) => {
  if (!isOpen) return null;

  const displayName = currentUser?.name || localStorage.getItem('userName') || "Shoyab Khan";
  const displayTitle = currentUser?.jobTitle || currentUser?.role || localStorage.getItem('userTitle') || "Business Development";
  const displayAvatar = currentUser?.avatar || localStorage.getItem('userAvatar') || null;

  return (
    <div className="fixed inset-0 z-[9999] md:hidden flex animate-fadeIn">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-[260px] h-full flex flex-col shadow-xl text-left animate-slideInLeft transition-all duration-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-white font-bold flex items-center justify-center text-base uppercase mb-2 overflow-hidden border border-gray-300">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{displayName}</h3>
          <p className="text-xs text-gray-500 truncate mt-0.5">{displayTitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-1 space-y-0.5 text-xs font-bold text-gray-700">
          <a href="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors no-underline text-gray-700">
            <span>👤</span> View Profile
          </a>
          <a href="/pages" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors no-underline text-gray-700">
            <span>🏢</span> Company Pages
          </a>
          <div className="border-b border-gray-100 my-1" />
          <div className="px-4 py-1 flex justify-between text-xs font-medium text-gray-500">
            <span>Profile viewers</span>
            <span className="text-blue-600 font-bold">25</span>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={() => { onClose(); handleLogout(); }}
            className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-2 px-3 border border-gray-300 rounded-md text-xs transition-colors duration-150 flex items-center justify-center gap-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedLayout = ({ children, handleLogout }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 🚀 EXTRACT REALTIME CENTRAL COUNTS GLOBALLY
  const { unreadCount } = useContext(SocketContext);

  useEffect(() => {
    const fetchRealUserProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const freshData = await res.json();
          setCurrentUser(freshData);
          
          if (freshData.avatar) localStorage.setItem('userAvatar', freshData.avatar);
          if (freshData.name) localStorage.setItem('userName', freshData.name);
          if (freshData.jobTitle) localStorage.setItem('userTitle', freshData.jobTitle);
        }
      } catch (err) {
        console.error("Profile endpoint sync failed:", err);
      }
    };

    fetchRealUserProfileData();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F3F2EF] flex flex-col antialiased">
      <Navbar 
        handleLogout={handleLogout} 
        onOpenDrawer={() => setDrawerOpen(true)} 
        currentUser={currentUser}
      />
      
      <MobileDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        handleLogout={handleLogout} 
        currentUser={currentUser}
      />
      
      <main className="max-w-7xl w-full mx-auto px-0 md:px-4 pt-[46px] md:pt-4 pb-16 md:pb-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 flex-1">
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>

        <div className={`col-span-1 ${isMessagesPage ? 'md:col-span-9' : 'md:col-span-6'} bg-transparent space-y-2 md:space-y-4`}>
          {children}
        </div>

        {!isMessagesPage && (
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        )}
      </main>

      {/* 🚀 LIVE INDICATOR EMBEDDED SAFELY */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    setIsAuthenticated(false);
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <SocketProvider>
      <Toaster position="bottom-center" />

      <Routes>
        <Route path="/post/:id" element={
          isAuthenticated ? (
            <AuthenticatedLayout handleLogout={handleLogout}><SinglePostView /></AuthenticatedLayout>
          ) : (
            <div className="min-h-screen bg-[#F3F2EF] py-10"><SinglePostView /></div>
          )
        } />

        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Feed /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Profile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Network /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><UserProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Notifications /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Messages /></AuthenticatedLayout></ProtectedRoute>} />        
        <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/page/:id" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><PageProfile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><SearchResults /></AuthenticatedLayout></ProtectedRoute>} />
        
        <Route path="/login" element={!isAuthenticated ? <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"><Auth /></div> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </SocketProvider>
  );
}

const UserProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <UserProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;