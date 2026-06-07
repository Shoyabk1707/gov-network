import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function LeftSidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  // --- 🌟 HELPER: GET INITIALS FOR AVATAR ---
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  // --- 📡 FETCH LOGGED-IN USER DATA ---
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Error fetching user in sidebar:", err);
      }
    };

    fetchMe();
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Network', path: '/network', icon: '👥' },
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Mini Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-16 bg-blue-600"></div>
        <div className="px-4 pb-4 text-center relative">
          
          {/* 🌟 DYNAMIC AVATAR INITIALS */}
          <div className="w-16 h-16 bg-blue-800 text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-white mx-auto -mt-8 uppercase">
            {currentUser ? getInitials(currentUser.name) : "..."}
          </div>
          
          {/* 🌟 DYNAMIC NAME & ROLE */}
          <h2 className="mt-2 text-lg font-bold text-gray-900 leading-tight">
            {currentUser ? currentUser.name : "Loading..."}
          </h2>
          
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {currentUser 
              ? (currentUser.jobTitle || currentUser.role || 'Member') 
              : 'User'}
          </p>
          
          {currentUser?.role === 'official' && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              Government Official
            </span>
          )}

          {currentUser?.role === 'aspirant' && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
              Exam Aspirant
            </span>
          )}

          {currentUser?.role === 'creator' && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
              Creator / Institute
            </span>
          )}

          <hr className="my-4 border-gray-100" />
          <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
            View profile
          </Link>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}