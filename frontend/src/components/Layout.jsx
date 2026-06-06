// components/Layout.jsx
import Sidebar from './Sidebar';
import TrendingBox from './TrendingBox';
import VerifiedBox from './VerifiedBox';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar yahan bhi add kar sakte ho agar sab jagah common hai */}
      <Navbar /> 

      <main className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-12 gap-6">
        {/* LEFT SIDEBAR (Fixed) */}
        <div className="col-span-3 hidden md:block">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </div>

        {/* DYNAMIC CONTENT (Yahan feed, profile, ya network load hoga) */}
        <div className="col-span-12 md:col-span-6">
          {children}
        </div>

        {/* RIGHT SIDEBAR (Trending + Verified) */}
        <div className="col-span-3 hidden md:block space-y-6">
          <div className="sticky top-20">
            <TrendingBox />
            <VerifiedBox />
          </div>
        </div>
      </main>
    </div>
  );
}