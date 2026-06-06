import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchInput, setSearchInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setIsMobileMenuOpen(false); // Mobile pe search karte hi menu band kar do
    }
  };

  // Helper function taaki link click hote hi mobile menu band ho jaye
  const navTo = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b px-4 py-3 md:px-10 relative z-50 mb-6">
      <div className="flex justify-between items-center">
        
        {/* Logo */}
        <h1 onClick={() => navTo('/')} className="text-2xl font-bold text-blue-600 cursor-pointer flex-shrink-0">
          GovNetwork
        </h1>

        {/* 🔍 SEARCH BAR (DESKTOP) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <span className="absolute left-3 top-2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search posts, people, or pages..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-full py-1.5 pl-10 pr-4 text-sm transition shadow-inner"
          />
        </form>

        {/* Navigation Links (DESKTOP) */}
        <div className="hidden md:flex gap-6 items-center font-medium text-gray-700 flex-shrink-0 text-sm">
          <button onClick={() => navTo('/')} className={location.pathname === '/' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Feed</button>
          <button onClick={() => navTo('/network')} className={location.pathname.startsWith('/network') || location.pathname.startsWith('/creator') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Network</button>
          <button onClick={() => navTo('/pages')} className={location.pathname === '/pages' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Pages</button>
          <button onClick={() => navTo('/profile')} className={location.pathname === '/profile' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}>Profile</button>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition">Logout</button>
        </div>

        {/* 🍔 HAMBURGER ICON (MOBILE ONLY) */}
        <button 
          className="md:hidden text-gray-600 text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* 📱 MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl py-4 px-4 flex flex-col gap-3 z-50">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full mb-2">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:outline-none focus:border-blue-500 rounded-full py-2 pl-10 pr-4 text-sm"
            />
          </form>
          
          {/* Mobile Links */}
          <button onClick={() => navTo('/')} className={`text-left p-2 rounded font-semibold ${location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>Feed</button>
          <button onClick={() => navTo('/network')} className={`text-left p-2 rounded font-semibold ${location.pathname.startsWith('/network') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>Network</button>
          <button onClick={() => navTo('/pages')} className={`text-left p-2 rounded font-semibold ${location.pathname === '/pages' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>Pages</button>
          <button onClick={() => navTo('/profile')} className={`text-left p-2 rounded font-semibold ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>Profile</button>
          <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="text-left p-2 text-red-500 font-semibold mt-1 border-t pt-3">Logout</button>
        </div>
      )}
    </nav>
  );
}