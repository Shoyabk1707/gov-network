import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import SkeletonNetworkCard from './SkeletonNetworkCard';

export default function Network({ onViewProfile }) { 
  const [users, setUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 Filter Tabs State
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Government Official', 'Exam Aspirant', 'Creator / Institute'];
  
  const token = localStorage.getItem('token');

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  const fetchDiscoverUsers = async () => {
    try {
      const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = resMe.ok ? await resMe.json() : null;

      if (meData) {
        setFollowedUsers(meData.following || []);
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

  const handleFollow = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/follow/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowedUsers(prev => [...prev, id]); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 FRONTEND FILTER LOGIC FOR USER ROLES
  const filteredUsers = users.filter(u => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Government Official') return u.role === 'official';
    if (activeTab === 'Exam Aspirant') return u.role === 'aspirant';
    if (activeTab === 'Creator / Institute') return u.role === 'creator';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-2 px-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 George animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 p-4 space-y-4">
      {/* 🚀 Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Discover the network</h1>
        <p className="text-sm text-slate-500 mt-1">Verified officials, fellow aspirants and trusted institutes.</p>
      </div>
      
      {/* 🚀 Horizontal Filter Pills (Scrollable on Mobile) */}
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

      {/* 🚀 User Cards Layout Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 shadow-sm text-slate-400 text-sm">
          No profiles found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(u => (
            <div key={u._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* Profile Main Info (Row layout as per screenshot) */}
              <div className="flex gap-4 items-start mb-4">
                {/* Avatar with Verified Ring check icon overlay */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-[#2563eb] text-white flex items-center justify-center rounded-full text-xl font-bold tracking-wide">
                    {getInitials(u.name)}
                  </div>
                  {u.role === 'official' && (
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                      <svg className="w-4 h-4 text-[#2563eb] fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Text Area */}
                <div className="space-y-0.5">
                  <h2 className="font-bold text-base text-slate-900 leading-snug">{u.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {u.tagline || `${u.jobTitle || 'Member'} • ${u.department || 'Network'}`}
                  </p>
                  
                  {/* Pin/Location metadata */}
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] pt-0.5">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{u.location || 'India'}</span>
                  </div>

                  {/* Role Pill Badge */}
                  <div className="pt-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                      u.role === 'official' ? 'bg-[#0f172a] text-white' : 
                      u.role === 'creator' ? 'bg-[#ca8a04] text-white' : 'bg-[#00875a] text-white'
                    }`}>
                      {u.role === 'official' ? 'Government Official' : u.role === 'creator' ? 'Creator / Institute' : 'Exam Aspirant'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Frame */}
              <div className="flex gap-2 w-full pt-2">
                {followedUsers.includes(u._id) ? (
                  <button disabled className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Following
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFollow(u._id)}
                    className="flex-1 py-2 bg-[#1e293b] text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Follow
                  </button>
                )}
                
                <button 
                  onClick={() => onViewProfile(u._id)}
                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                >
                  View profile
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}