import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ handleLogout, onOpenDrawer, currentUser, unreadCount }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const displayName = currentUser?.name || "User";
  const displayAvatar = currentUser?.avatar || null;

  return (
    // 🚀 FIXED AIRTIGHT BAR: High-end static height tracking layout containing zero flex padding leaks
    <nav className="bg-white border-b border-gray-200 fixed md:sticky top-0 left-0 right-0 z-50 h-[49px] md:h-14 flex items-center select-none w-full">
      <div className="max-w-7xl w-full mx-auto px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4 h-full">
        
        {/* 👤 1. LEFT CORNER: Mobile Avatar Drawer Trigger & Desktop Branding Logo */}
        <div className="flex items-center flex-shrink-0">
          {/* Mobile Profile Trigger Button - Hooked to currentUser state */}
          <button 
            onClick={onOpenDrawer}
            className="md:hidden w-8 h-8 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs uppercase overflow-hidden shadow-xs border border-gray-100 flex-shrink-0"
          >
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </button>

          {/* Desktop App Branding Entry Shield Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="hidden md:flex items-center gap-2 cursor-pointer flex-shrink-0 ml-2 md:ml-0"
          >
            <div className="bg-[#1e293b] text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h1 className="text-base font-black tracking-tight">
              <span className="text-[#1e293b]">Gov</span>
              <span className="text-blue-600 ml-0.5">Network</span>
            </h1>
          </div>
        </div>

        {/* 🔍 2. CENTRAL REGION: Unified Single-Row Responsive Search Framework */}
        <div className="flex-1 max-w-2xl px-1 md:px-0">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none opacity-60">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder={window.innerWidth < 640 ? "Search..." : "Search officials, posts, vacancies..."} 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#edf2f7] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-1.5 md:py-2 pl-9 pr-3 text-xs md:text-sm text-gray-800 transition-all placeholder-gray-500 outline-none"
            />
          </form>
        </div>

        {/* 💬 3. RIGHT CORNER: Direct Redirection Actions System */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* 🚀 FIXED LOGO MATRIX: Exact LinkedIn Rounded Bubble & Tail Framework Layer */}
          <button 
            onClick={() => navigate('/messages')}
            className="p-1 text-[#8c8c8c] hover:text-[#5c5c5c] active:scale-95 transition-all duration-150 flex items-center justify-center"
            title="Open Inbox Messages"
          >
            <svg 
              className="w-6 h-6 md:w-6.5 md:h-6.5" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21.75 10.25C21.75 5.83172 17.3848 2.25 12 2.25C6.61522 2.25 2.25 5.83172 2.25 10.25C2.25 12.8344 3.73803 15.1189 6.06209 16.5912C5.97864 17.027 5.76632 17.765 5.3727 18.5997C5.10985 19.157 5.51865 19.75 6.13645 19.75H6.28919C7.88219 19.75 9.30939 19.0666 10.2587 18.043C10.8247 18.1788 11.4056 18.25 12 18.25C17.3848 18.25 21.75 14.6683 21.75 10.25Z" />
              <circle cx="8" cy="10.25" r="1" fill="white" />
              <circle cx="12" cy="10.25" r="1" fill="white" />
              <circle cx="16" cy="10.25" r="1" fill="white" />
            </svg>
          </button>

          {/* 🚀 DESKTOP EXCLUSIVE NOTIFICATIONS TRIGGER: Floating badge controller logic */}
          <button 
            onClick={() => navigate('/notifications')}
            className="hidden md:flex p-1 text-[#8c8c8c] hover:text-[#5c5c5c] relative items-center justify-center transition-all duration-150"
            title="Notifications Panel"
          >
            <svg className="w-[22px] h-[22px] md:w-[23px] md:h-[23px]" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-sans font-bold text-[9px] w-3.5 h-3.4 rounded-full flex items-center justify-center shadow-sm border border-white scale-105 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Desktop Exclusive Sign-Out Option */}
          <button 
            onClick={handleLogout} 
            className="hidden md:flex items-center gap-1 text-gray-500 hover:text-red-600 font-bold text-xs transition-colors"
          >
            <span>Sign out</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>

      </div>
    </nav>
  );
}