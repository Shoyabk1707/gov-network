import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ handleLogout, onOpenDrawer, currentUser }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // 🚀 FIXED RESOLUTION: Use centralized currentUser values with precise fallbacks
  const displayName = currentUser?.name || "User";
  const displayAvatar = currentUser?.avatar || null;

  return (
    // 🚀 FIXED AIRTIGHT BAR: High-end static height tracking layout containing zero flex padding leaks
    <nav className="bg-white border-b border-gray-200 fixed md:sticky top-0 left-0 right-0 z-50 h-[49px] md:h-14 flex items-center select-none w-full">
      <div className="max-w-7xl w-full mx-auto px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4 h-full">
        
        {/* 👤 1. LEFT CORNER: Mobile Avatar Drawer Trigger & Desktop Branding Logo */}
        <div className="flex items-center flex-shrink-0">
          {/* Mobile Profile Trigger Button - Now perfectly hooked to currentUser state */}
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
          {/* Mobile + Desktop Messaging Shortcut */}
          <button 
            onClick={() => navigate('/messages')}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all duration-150 relative"
            title="Open Inbox Messages"
          >
            <svg className="w-5 h-5 md:w-5.5 md:h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12 Tri-Shield 0 7.582 4.03 4 9 4s9 3.582 9 8z"></path>
            </svg>
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