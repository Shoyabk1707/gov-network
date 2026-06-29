import { Link, useLocation } from 'react-router-dom';

// 🚀 INJECTED UNREADCOUNT LAYER VALUE FOR REALTIME INDICATORS
export default function BottomNav({ unreadCount }) {
  const location = useLocation();

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
        const isNotifications = item.name === 'Notifications';

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
            
            {/* Icon housing wrapper with relative container setup */}
            <div className="relative">
              <span className={`text-lg transition-transform inline-block ${isActive ? 'scale-105 mb-0' : 'mb-0.5'}`}>
                {item.icon}
              </span>
              
              {/* 🚀 MOBILE REAL-TIME BADGE PIN: Overlaps perfectly on top-right edge of the bell icon */}
              {isNotifications && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white font-sans font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            <span className="text-[9px] tracking-tight mt-0.5 font-sans">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}