import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

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

const AuthenticatedLayout = ({ children, handleLogout }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar handleLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-24 md:pb-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>

        <div className={`col-span-1 ${isMessagesPage ? 'md:col-span-9' : 'md:col-span-6'}`}>
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
        <Route path="/post/:id" element={
          isAuthenticated ? (
            <AuthenticatedLayout handleLogout={handleLogout}><SinglePostView /></AuthenticatedLayout>
          ) : (
            <div className="min-h-screen bg-[#F4F6F8] py-10"><SinglePostView /></div>
          )
        } />

        {/* --- AUTHENTICATED ROUTES --- */}
        <Route path="/" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Feed /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Profile /></AuthenticatedLayout></ProtectedRoute>} />
        
        {/* 🚀 FIXED ROUTE INTERNALS */}
        <Route path="/network" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Network /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><UserProfileWrapper /></AuthenticatedLayout></ProtectedRoute>} />
        
        <Route path="/notifications" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Notifications /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><Messages /></AuthenticatedLayout></ProtectedRoute>} />        
        
        <Route path="/pages" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><ManagePages onBack={() => navigate('/')} /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/page/:id" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><PageProfile /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AuthenticatedLayout handleLogout={handleLogout}><SearchResults /></AuthenticatedLayout></ProtectedRoute>} />
        
        {/* --- AUTH ROUTE --- */}
        <Route path="/login" element={!isAuthenticated ? <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"><Auth /></div> : <Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

// 🚀 WRAPPER MATCHING SYNCHRONIZATION
const UserProfileWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <UserProfile userId={userId} onBack={() => navigate('/network')} />;
};

export default App;