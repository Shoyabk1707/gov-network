import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ handleLogout }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* 🚀 Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* 1. LOGO */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          {/* Shield Icon Box */}
          <div className="bg-[#1e293b] text-white p-1.5 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="text-[#1e293b]">Gov </span>
            <span className="text-blue-600">Network</span>
          </h1>
        </div>

        {/* 2. SEARCH BAR (Desktop & Tablet) */}
        <div className="flex-1 max-w-2xl hidden sm:block mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search officials, institutes, posts..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-700 transition-all placeholder-gray-500"
            />
          </form>
        </div>

        {/* 3. SIGN OUT */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors flex-shrink-0"
        >
          <span className="hidden sm:inline">Sign out</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>

      </div>
      
      {/* 📱 MOBILE SEARCH (Visible only on small screens) */}
      <div className="sm:hidden px-4 pb-3">
         <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-700 transition-all"
            />
          </form>
      </div>
    </nav>
  );
}