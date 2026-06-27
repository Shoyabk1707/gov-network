import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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

// NEW APP SHELL COMPONENTS
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomNav from './components/BottomNav';
import Messages from './components/Messages';

// 🚀 FIXED DRAWER COMPONENT: Reads localized identity keys with absolute zero runtime lags
const MobileDrawer = ({ isOpen, onClose, handleLogout }) => {
  const [profile, setProfile] = useState({ name: 'Shoyab Khan', title: 'Business Development', avatar: '' });

  useEffect(() => {
    // 🚀 READ JUGAAD MEMORY LAYERS RIGHT AWAY
    const savedName = localStorage.getItem('userName');
    const savedTitle = localStorage.getItem('userTitle');
    const savedAvatar = localStorage.getItem('userAvatar');

    // If local identity exists, override defaults safely
    if (savedName) {
      setProfile({
        name: savedName,
        title: savedTitle || 'Member Connected',
        avatar: savedAvatar || ''
      });
    } else {
      // Emergency dynamic token fallback parsing layer
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          setProfile({
            name: payload?.name || payload?.username || 'Shoyab Khan',
            title: payload?.jobTitle || payload?.role || 'Business Development',
            avatar: payload?.avatar || ''
          });
        }
      } catch (e) { console.log(e); }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] md:hidden flex animate-fadeIn">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white w-[280px] h-full flex flex-col shadow-2xl text-left animate-slideInLeft transition-all duration-300">
        <div className="p-5 border-b border-gray-100 bg-slate-50/80">
          <div className="w-14 h-14 rounded-full bg-slate-950 text-white font-black flex items-center justify-center text-lg uppercase mb-3 overflow-hidden shadow-xs border border-gray-200">
            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile.name[0].toUpperCase()}
          </div>
          {/* 🔥 FIXED REAL TIME IDENTITY INJECTION */}
          <h3 className="font-extrabold text-slate-900 text-base leading-snug">{profile.name}</h3>
          <p className="text-xs text-blue-600 font-bold truncate mt-0.5">{profile.title}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 text-sm font-bold text-slate-700">
          <a href="/profile" onClick={onClose} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors no-underline text-slate-700">
            <span>👤</span> My Profile
          </a>
          <a href="/pages" onClick={onClose} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors no-underline text-slate-700">
            <span>🏢</span> Manage Pages
          </a>
          <div className="border-b border-gray-100 my-1" />
          <div className="px-5 py-2.5 text-[11px] font-black tracking-wider text-gray-400 uppercase">Analytics</div>
          <div className="px-5 py-1.5 flex justify-between text-xs font-semibold text-slate-500">
            <span>Profile viewers</span>
            <span className="text-blue-600 font-bold">25</span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-slate-50/50">
          <button 
            onClick={() => { onClose(); handleLogout(); }}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <span>🚪</span> Sign Out Session
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

  return (
    <div className="min-h-screen bg-[#F3F2EF] flex flex-col">
      <Navbar 
        handleLogout={handleLogout} 
        onOpenDrawer={() => setDrawerOpen(true)} 
      />
      
      <MobileDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        handleLogout={handleLogout} 
      />
      
      <main className="max-w-7xl w-full mx-auto px-0 md:px-4 pt-[49px] md:pt-4 pb-20 md:pb-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 flex-1">
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>

        <div className={`col-span-1 ${isMessagesPage ? 'md:col-span-9' : 'md:col-span-6'} bg-transparent`}>
          {children}
        </div>

        {!isMessagesPage && (
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clears all local slots instantly on logout session end
    setIsAuthenticated(false);
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <>
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
    </>
  );
}

const UserProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <UserProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;