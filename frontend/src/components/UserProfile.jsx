import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';

// ==========================================
// 📰 MODULAR POST CARD COMPONENT
// ==========================================
const ProfilePostCard = ({ post, author, getInitials, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const WORD_LIMIT = 25;

  const content = post.content || post.title || '';
  const words = content.split(' ');
  const isLong = words.length > WORD_LIMIT;
  const displayContent = isExpanded ? content : words.slice(0, WORD_LIMIT).join(' ') + (isLong ? '...' : '');

  const handleActionClick = (e, actionName) => {
    e.stopPropagation();
    toast(`${actionName} clicked! (Backend link pending)`, { icon: '🚧' });
  };

  return (
    <div 
      onClick={() => navigate(`/post/${post._id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer mb-4 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm">
            {getInitials(author?.name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-[15px] hover:text-blue-600 transition">{author?.name || 'Unknown User'}</h3>
              
              {/* Dynamic Checkmark Inside Post Feed Matrix */}
              {author?.verifiedAsOfficial && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-teal-600 text-white tracking-wider">
                  🏛️ Verified Official
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {author?.jobTitle ? `${author.jobTitle} ${author.department ? `at ${author.department}` : ''}` : author?.tagline || 'Network Member'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'} 
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
              <span className="text-slate-800 font-bold">{post.category || 'General Update'}</span>
            </p>
          </div>
        </div>

        <p className="text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {displayContent}
          {isLong && (
            <span onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-slate-500 font-semibold cursor-pointer ml-1 hover:text-blue-600 transition">
              {isExpanded ? 'show less' : 'read more'}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-slate-50/50 text-slate-500 font-medium text-sm">
         <button onClick={(e) => handleActionClick(e, 'Like')} className="flex items-center gap-1.5 hover:text-red-500 transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
           {post.likes?.length || 0}
         </button>
         <button onClick={(e) => handleActionClick(e, 'Comment')} className="flex items-center gap-1.5 hover:text-blue-500 transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
           {post.comments?.length || 0}
         </button>
         <button onClick={(e) => handleActionClick(e, 'Share')} className="flex items-center gap-1.5 hover:text-blue-500 transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
           Share
         </button>
         <button onClick={(e) => handleActionClick(e, 'Save')} className="flex items-center gap-1.5 hover:text-blue-500 transition">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
           Save
         </button>
      </div>
    </div>
  );
};

// ==========================================
// 🏛️ MAIN USER PROFILE EXTERNAL VIEW MODULE
// ==========================================
export default function UserProfile({ userId, onBack }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About'); 

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/network/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error("Profile view unavailable.");
          onBack();
        }
      } catch (err) {
        toast.error("Network synchronization failed.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchCreatorData();
  }, [userId, token, onBack]);

  if (loading || !data || !data.profile) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="h-32 bg-slate-200"></div>
          <div className="px-6 pb-6 relative"><div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white absolute -top-16 left-6"></div></div>
        </div>
        <SkeletonPost />
      </div>
    );
  }

  const { profile, posts } = data;
  const tabs = ['About', 'Activity'];

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-4 pb-12 relative px-4 md:px-0">
      
      <button onClick={onBack} className="mb-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
        ← Back to Network
      </button>

      {/* 🖼️ HERO CELL HEADER LAYER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-black relative"></div> 
        
        <div className="px-6 pb-6 relative">
          
          <div className="absolute top-4 right-6 flex gap-2 z-20">
            <button className="px-5 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
              Follow
            </button>
            
            {/* Guidance Context Render Hook Conditioned on Verification Status */}
            {profile.verifiedAsOfficial && (
              <button className="px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm font-bold hover:bg-slate-100 transition flex items-center gap-1.5 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Request Guidance
              </button>
            )}
          </div>

          <div className="absolute -top-16 left-6 z-10">
            <div className="w-32 h-32 bg-slate-900 text-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-extrabold tracking-wide overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile.name)}
            </div> 
            
            {profile.verifiedAsOfficial && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                <svg className="w-6 h-6 text-teal-600 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="pt-20 mt-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
              
              {/* Profile Context Verification Status Tags Mapping */}
              {profile.verificationStatus === 'verified' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-teal-600 text-white tracking-wider">Verified Official 🏛️</span>
              ) : profile.verificationStatus === 'pending' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500 text-white tracking-wider">Review Pending ⏳</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-slate-100 text-slate-600 tracking-wider">Network Member</span>
              )}
            </div>
            
            <p className="text-slate-700 text-[15px] font-medium mb-2">
              {profile.jobTitle ? `${profile.jobTitle} ${profile.department ? `at ${profile.department}` : ''}` : profile.tagline || 'Active Network Member'}
            </p>
            
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {profile.city ? `${profile.city}, ${profile.state ? profile.state + ', ' : ''}India` : 'India'}
            </div>

            <div className="flex items-center gap-6 border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-[17px]">{profile.followers?.length || 0}</span>
                <span className="text-sm font-medium text-slate-500">Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-[17px]">{profile.following?.length || 0}</span>
                <span className="text-sm font-medium text-slate-500">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📁 TABS CONTROLLER CONTAINER */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ==========================================
          📂 VIEW CONTENT RENDERING MATRIX
          ========================================== */}
      {activeTab === 'About' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Summary</h2>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {profile.bio || 'No professional summary provided yet.'}
            </p>
          </div>

          {/* DYNAMIC SECTION A: TARGET EXAMS CARD */}
          {profile.targetExams && profile.targetExams.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Targeted Exams</h2>
               <div className="flex flex-wrap gap-2">
                 {profile.targetExams.map((exam, idx) => exam.trim() && (
                   <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold">
                     🎯 {exam.trim()}
                   </span>
                 ))}
               </div>
            </div>
          )}

          {/* DYNAMIC SECTION B: EXPERIENCE HISTORY ARRAY MAP */}
          {profile.experience?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Experience History</h2>
              <div className="space-y-5">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0">
                    <div className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                    <h3 className="font-bold text-slate-900 text-sm">{exp.title}</h3>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                    <p className="text-xs text-slate-500 mt-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC SECTION C: ACADEMIC CREDENTIALS TIMELINE */}
          {profile.education?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Education Credentials</h2>
              <div className="space-y-5">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0">
                    <div className="absolute w-2.5 h-2.5 bg-slate-500 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                    <h3 className="font-bold text-slate-900 text-sm">{edu.school}</h3>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                    <p className="text-xs text-slate-500 mt-1">{edu.startYear} - {edu.endYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="space-y-4 animate-fadeIn">
          {posts && posts.length > 0 ? (
            posts.map(post => <ProfilePostCard key={post._id} post={post} author={profile} getInitials={getInitials} navigate={navigate} />)
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">No activity or broadcasts posted from this stream yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}