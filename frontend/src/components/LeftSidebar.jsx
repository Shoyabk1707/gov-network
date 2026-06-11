import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function LeftSidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCurrentUser(await res.json());
        }
      } catch (err) {
        console.error("Error fetching user in sidebar:", err);
      }
    };
    fetchMe();
  }, []);

  // ✨ UPDATED: Added Brand Pages explicitly inside navigational matrices array
  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Network', path: '/network', icon: '👥' },
    { name: 'Brand Pages', path: '/pages', icon: '🏢' }, // 👈 Naya access hook inject kiya
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="sticky top-20 space-y-4 animate-fadeIn">
      {/* Mini Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* ✨ Theme Updated to premium slate */}
        <div className="h-16 bg-gradient-to-r from-slate-800 to-slate-900"></div>
        <div className="px-4 pb-4 text-center relative">
          
          <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-extrabold border-4 border-white mx-auto -mt-8 uppercase overflow-hidden shadow-sm">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt="User avatar" className="w-full h-full object-cover" /> : getInitials(currentUser?.name)}
          </div>
          
          <h2 className="mt-2 text-base font-bold text-slate-900 leading-tight tracking-tight">
            {currentUser ? currentUser.name : "Loading..."}
          </h2>
          
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {currentUser?.jobTitle ? `${currentUser.jobTitle}` : currentUser?.tagline || 'Active Network Node'}
          </p>
          
          {/* ✨ Dynamic Verification Label Badge on Sidebar Core */}
          {currentUser?.verificationStatus === 'verified' ? (
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-teal-100">
              Verified Official 🏛️
            </span>
          ) : currentUser?.verificationStatus === 'pending' ? (
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-amber-100">
              Review Pending ⏳
            </span>
          ) : (
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-slate-100">
              Network Member
            </span>
          )}

          <hr className="my-3.5 border-slate-100" />
          <Link to="/profile" className="text-xs font-bold text-slate-900 hover:underline transition">
            View My Profile
          </Link>
        </div>
      </div>

      {/* Navigation Menu Sidebar Block */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-slate-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}