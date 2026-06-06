import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';

export default function CreatorProfile({ userId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // ✨ AAPKA SAHI WALA API ENDPOINT ✨
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="h-32 bg-slate-800 rounded-t-lg"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white absolute -top-16 left-6"></div>
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

  // ✨ DATA DESTRUCTURING ✨
  const { profile, posts } = data;

  // --- MAIN UI (NO EDIT BUTTONS) ---
  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4 pb-12 relative px-4 md:px-0">
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
      >
        ← Back to Network
      </button>

      {/* --- MAIN PROFILE HEADER --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-slate-800 relative"></div> 
        
        <div className="px-6 pb-6 relative">
          {/* DYNAMIC MAIN AVATAR */}
          <div className="w-32 h-32 bg-blue-100 text-blue-700 rounded-full border-4 border-white absolute -top-16 left-6 shadow-sm flex items-center justify-center text-4xl font-extrabold tracking-wide z-10">
            {getInitials(profile.name)}
          </div> 
          
          <div className="pt-20 mt-2">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.role && (
                   <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                     profile.role === 'official' ? 'bg-blue-100 text-blue-800' : 
                     profile.role === 'creator' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                   }`}>
                     {profile.role.toUpperCase()}
                   </span>
                )}
            </div>
            <p className="text-gray-700 mt-1 font-medium">{profile.tagline || profile.jobTitle || profile.department || 'GovNetwork Member'}</p>
            <p className="text-sm text-gray-500 mt-1">{profile.city ? `${profile.city}, ${profile.state || ''}, India` : 'India'}</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.bio || 'No summary provided.'}</p>
        {profile.skills && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Top skills</p>
            <p className="text-sm text-gray-600 mt-1">{profile.skills}</p>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex border-b mb-6">
          <button className="pb-3 px-4 font-semibold transition text-sm text-blue-600 border-b-2 border-blue-600">
            📝 {profile.name.split(' ')[0]}'s Activity
          </button>
        </div>
        
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{profile.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{profile.tagline || 'GovNetwork Member'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content || post.title}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-6">No recent activity.</p>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
        {profile.experience?.length > 0 ? (
          profile.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-sm text-gray-700">{exp.company} • {exp.location}</p>
              <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
            </div>
          ))
        ) : <p className="text-sm text-gray-500">No work experience listed.</p>}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
        {profile.education?.length > 0 ? (
          profile.education.map((edu, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-sm text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
            </div>
          ))
        ) : <p className="text-sm text-gray-500">No educational background listed.</p>}
      </div>

    </div>
  );
}