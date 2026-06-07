import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';

export default function CreatorProfile({ userId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About'); // 🚀 Premium Tab State

  const token = localStorage.getItem('token');

  // --- 🌟 HELPER: GET INITIALS FOR AVATAR ---
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/network/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        } else {
          toast.error("Profile not found!");
          onBack();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchCreatorData();
  }, [userId, token, onBack]);

  // --- LOADING SKELETON ---
  if (loading || !data || !data.profile) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="h-32 bg-slate-200"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white absolute -top-16 left-6"></div>
            <div className="pt-20 space-y-3">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <SkeletonPost />
      </div>
    );
  }

  const { profile, posts } = data;

  // 🚀 DYNAMIC TABS LOGIC BASED ON ROLE
  const getTabs = () => {
    if (profile.role === 'creator') return ['About', 'Organization', 'Posts'];
    if (profile.role === 'official') return ['About', 'Experience', 'Posts'];
    return ['About', 'Education', 'Posts']; // Default for aspirants
  };
  const tabs = getTabs();

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-4 pb-12 relative px-4 md:px-0">
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="mb-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
      >
        ← Back
      </button>

      {/* 🚀 MAIN PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] relative"></div> 
        
        <div className="px-6 pb-6 relative">
          {/* Action Buttons (Right Aligned Overlay) */}
          <div className="absolute top-4 right-6 flex gap-2 z-20">
            <button className="px-5 py-1.5 bg-[#1e293b] text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
              Follow
            </button>
            {profile.role === 'official' && (
              <button className="px-4 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Request Guidance
              </button>
            )}
          </div>

          {/* Avatar with Verified Badge Overlay */}
          <div className="relative inline-block absolute -top-16 left-6 z-10">
            <div className="w-32 h-32 bg-[#2563eb] text-white rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl font-extrabold tracking-wide">
              {getInitials(profile.name)}
            </div> 
            {profile.role === 'official' && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                <svg className="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="pt-20 mt-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
              {/* Dynamic Role Pill */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                profile.role === 'official' ? 'bg-[#0f172a] text-white border-slate-800' : 
                profile.role === 'creator' ? 'bg-[#ca8a04] text-white border-yellow-600' : 'bg-[#00875a] text-white border-emerald-700'
              }`}>
                {profile.role === 'official' ? 'Government Official' : profile.role === 'creator' ? 'Creator / Institute' : 'Exam Aspirant'}
              </span>
            </div>
            
            <p className="text-slate-800 text-sm font-medium mb-2">
              {profile.tagline || profile.jobTitle || profile.department || 'Active Network Member'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {profile.city ? `${profile.city}, ${profile.state || ''}` : 'India'}
              </div>
              <div className="flex items-center gap-1 capitalize">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {profile.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NAVIGATION TABS CARD */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-x-auto hide-scrollbar p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === tab 
                ? 'bg-[#1e293b] text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🚀 DYNAMIC CONTENT RENDERER */}
      
      {/* 1. ABOUT TAB */}
      {activeTab === 'About' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">About</h2>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {profile.bio || 'No professional summary provided yet.'}
            </p>
            {profile.skills && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Top Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC MIDDLE TAB (Experience / Education / Organization) */}
      {(activeTab === 'Experience' || activeTab === 'Education' || activeTab === 'Organization') && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{activeTab} Details</h2>
          
          {/* Aspirant / Official List Format */}
          {(activeTab === 'Experience' || activeTab === 'Education') && (
            <div className="space-y-5">
              {profile[activeTab.toLowerCase()]?.length > 0 ? (
                profile[activeTab.toLowerCase()].map((item, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0">
                    <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title || item.school}</h3>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{item.company || item.degree}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.startDate || item.startYear} - {item.current ? 'Present' : (item.endDate || item.endYear)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No {activeTab.toLowerCase()} records added.</p>
              )}
            </div>
          )}

          {/* Institute/Creator Grid Format */}
          {activeTab === 'Organization' && (
            <div className="grid grid-cols-2 gap-y-4 text-sm">
               <div><span className="block text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Type</span> <span className="font-medium text-slate-800">Institute / Creator</span></div>
               <div><span className="block text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Location</span> <span className="font-medium text-slate-800">{profile.city || 'India'}</span></div>
               <div><span className="block text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Industry</span> <span className="font-medium text-slate-800">Education & Guidance</span></div>
            </div>
          )}
        </div>
      )}

      {/* 3. POSTS TAB */}
      {activeTab === 'Posts' && (
        <div className="space-y-4 animate-fadeIn">
          {posts && posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{profile.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{profile.tagline || 'Member'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{post.content || post.title}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">No posts published yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}