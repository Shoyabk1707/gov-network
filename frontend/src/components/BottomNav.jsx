import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  // 🚀 FIXED 4-ICON MATRIX: Strict corporate layout mapping matching LinkedIn standard
  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Network', path: '/network', icon: '👥' },
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    // 🚀 ZERO-GAP CONTINUOUS TRAY: Fluid structural container with uniform distribution fields
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[52px] z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex justify-around items-center select-none w-full px-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.name} 
            to={item.path}
            className={`flex flex-col items-center justify-center h-full flex-1 transition-all duration-150 relative ${
              isActive ? 'text-blue-600 font-black' : 'text-slate-400 font-bold'
            }`}
          >
            {/* Active Indication Top Line Tracker bar */}
            {isActive && (
              <span className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-blue-600 rounded-b-full animate-fadeIn" />
            )}
            
            <span className={`text-lg transition-transform ${isActive ? 'scale-105 mb-0' : 'mb-0.5'}`}>
              {item.icon}
            </span>
            <span className="text-[9px] tracking-tight mt-0.5 font-sans">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}