import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Network', path: '/network', icon: '👥' },
    { name: 'Pages', path: '/pages', icon: '🏢' }, // 👈 Injected Page Hook
    { name: 'Messages', path: '/messages', icon: '💬' }, // 👈 Injected Chat Hook
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.name} 
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-slate-950 font-extrabold scale-105' : 'text-gray-400 font-medium'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[9px] tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}