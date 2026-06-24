import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonNetworkCard from './SkeletonNetworkCard';
import toast from 'react-hot-toast';

export default function Network() { 
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Government Official', 'Exam Aspirant', 'Creator / Institute'];
  
  const token = localStorage.getItem('token');

  const getInitials = (name) => {
    if (!name) return "U";
    const clean = name.trim().split(' ');
    return clean.length >= 2 
      ? (clean[0][0] + clean[1][0]).toUpperCase() 
      : clean[0][0].toUpperCase();
  };

  const fetchDiscoverUsers = async () => {
    try {
      const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = resMe.ok ? await resMe.json() : null;

      if (meData) {
        const followingIds = (meData.following || []).map(f => (f._id || f).toString());
        setFollowedUsers(followingIds);
      }

      const res = await fetch(`${API_BASE_URL}/api/network/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverUsers();
  }, []);

  const handleFollowToggle = async (id) => {
    const targetIdStr = id.toString();
    const isCurrentlyFollowing = followedUsers.includes(targetIdStr);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/follow/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const resData = await res.json();
        
        // 🔄 Sync arrays using pure reference validation list from DB
        if (resData.following) {
          const updatedIds = resData.following.map(uid => (uid._id || uid).toString());
          setFollowedUsers(updatedIds);
        } else {
          setFollowedUsers(prev => 
            isCurrentlyFollowing ? prev.filter(uid => uid !== targetIdStr) : [...prev, targetIdStr]
          );
        }

        if (isCurrentlyFollowing) {
          toast.success("Unfollowed member node.");
        } else {
          toast.success("Following updates live! 📢");
        }
      }
    } catch (err) {
      toast.error("Network sync broke down.");
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Government Official') return u.role === 'official';
    if (activeTab === 'Exam Aspirant') return u.role === 'aspirant';
    if (activeTab === 'Creator / Institute') return u.role === 'creator';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-2 px-4 text-left">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 p-4 space-y-4 text-left">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Discover the network</h1>
        <p className="text-sm text-slate-500 mt-1">Verified officials, fellow aspirants and trusted institutes.</p>
      </div>
      
      <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto hide-scrollbar gap-1">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex-shrink-0 ${
              activeTab === tab 
                ? 'bg-[#1e293b] text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 shadow-sm text-slate-400 text-sm font-medium">
          No profiles found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(u => {
            const isFollowing = followedUsers.includes(u._id.toString());
            return (
              <div key={u._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                
                <div className="flex gap-4 items-start mb-4">
                  <div className="relative flex-shrink-0 cursor-pointer" onClick={() => navigate(`/user/${u._id}`)}>
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-16 h-16 rounded-full object-cover border border-slate-100" />
                    ) : (
                      <div className="w-16 h-16 bg-[#2563eb] text-white flex items-center justify-center rounded-full text-xl font-bold tracking-wide">
                        {getInitials(u.name)}
                      </div>
                    )}
                    {u.role === 'official' && (
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                        <svg className="w-4 h-4 text-[#2563eb] fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h2 
                      onClick={() => navigate(`/user/${u._id}`)}
                      className="font-bold text-base text-slate-900 leading-snug hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {u.name}
                    </h2>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {u.tagline || `${u.jobTitle || 'Member'} ${u.department ? `at ${u.department}` : ''}`}
                    </p>
                    
                    <div className="flex items-center gap-1 text-slate-400 text-[11px] pt-0.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{u.city ? `${u.city}, ${u.state || ''}` : u.location || 'India'}</span>
                    </div>

                    <div className="pt-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                        u.role === 'official' ? 'bg-[#0f172a] text-white' : 
                        u.role === 'creator' ? 'bg-[#ca8a04] text-white' : 'bg-[#00875a] text-white'
                      }`}>
                        {u.role === 'official' ? 'Government Official' : u.role === 'creator' ? 'Creator / Institute' : 'Exam Aspirant'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full pt-1">
                  <button 
                    onClick={() => handleFollowToggle(u._id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 ${
                      isFollowing 
                        ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300' 
                        : 'bg-[#1e293b] text-white hover:bg-slate-800'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Following</span>
                      </>
                    ) : 'Follow'}
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/user/${u._id}`)}
                    className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                  >
                    View profile
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}