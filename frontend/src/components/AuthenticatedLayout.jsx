import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';

export default function AuthenticatedLayout({ children, handleLogout }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8]"> {/* Background color based on screenshot */}
      <Navbar handleLogout={handleLogout} />
      
      {/* PADDING BOTTOM: Taaki mobile me content bottom nav ke piche na chhupe */}
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:pb-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR - Sirf laptop/tablet pe dikhega */}
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>

        {/* DYNAMIC CENTER CONTENT - Isme feed, profile sab aayega */}
        <div className="col-span-1 md:col-span-6">
          {children}
        </div>

        {/* RIGHT SIDEBAR - Sirf laptop pe dikhega */}
        <div className="hidden lg:block lg:col-span-3">
          <RightSidebar />
        </div>
        
      </main>

      {/* BOTTOM NAV - Sirf mobile pe dikhega */}
      <BottomNav />
    </div>
  );
}