import { useState, useEffect, createContext } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client'; // 🚀 SOCKET CLIENT INITIALIZED
import { API_BASE_URL } from './config';

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

// 🚀 CREATE EXPORTABLE GLOBAL SOCKET CONTEXT
export const SocketContext = createContext(null);

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
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-base uppercase mb-2 overflow-hidden border border-gray-300">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName[0].toUpperCase()
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
          <div className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Analytics</div>
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

// 🚀 FIXED PROPS INJECTION: Received counts states from parent context
const AuthenticatedLayout = ({ children, handleLogout, unreadCount, setUnreadCount }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
        unreadCount={unreadCount} // 🚀 Desktop realtime count badge link
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

      {/* 🚀 FIXED FOR MOBILE SYSTEM: Passed unreadCount states directly to bottom navigation tray */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // 🚀 LIVE BADGE LAYER
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) socket.disconnect();
      return;
    }

    const socketInstance = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      const userId = payload.id || payload._id;

      if (userId) {
        socketInstance.emit('setup_session', userId);
      }

      fetch(`${API_BASE_URL}/api/notifications/unread-counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.unreadNotifications !== undefined) {
          setUnreadCount(data.unreadNotifications);
        }
      }).catch(err => console.error("Badges fetch failure:", err));

    } catch (e) {
      console.error("Token session extraction error:", e);
    }

    // 🚀 LISTENERS WIRE: Sockets listeners updating badge arrays reactively
    socketInstance.on('new_notification', () => {
      setUnreadCount(prev => prev + 1); 
    });

    socketInstance.on('delete_notification', () => {
      setUnreadCount(prev => Math.max(0, prev - 1)); 
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.clear(); 
    setIsAuthenticated(false);
    if (socket) socket.disconnect();
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <SocketContext.Provider value={socket}>
      <Toaster position="bottom-center" />

      <Routes>
        <Route path="/post/:id" element={
          isAuthenticated ? (
            <AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><SinglePostView /></AuthenticatedLayout>
          ) : (
            <div className="min-h-screen bg-[#F3F2EF] py-10"><SinglePostView /></div>
          )
        } />

        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><Feed /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><Profile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><Network /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><UserProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><Notifications setUnreadCount={setUnreadCount} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><Messages /></AuthenticatedLayout></ProtectedRoute>} />        
        <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/page/:id" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><PageProfile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}><SearchResults /></AuthenticatedLayout></ProtectedRoute>} />
        
        <Route path="/login" element={!isAuthenticated ? <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"><Auth /></div> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </SocketContext.Provider>
  );
}

const UserProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <UserProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;