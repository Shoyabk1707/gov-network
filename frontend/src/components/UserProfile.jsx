import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';
import PostCard from './PostCard';

export default function UserProfile({ userId, onBack }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data, setData] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About'); 

  const sortChronologicallyDescending = (array = []) => {
    return [...array].sort((a, b) => {
      const getDateString = (obj) => obj.startDate || obj.startYear || '';
      const getYear = (str) => {
        if (!str) return 0;
        const parts = str.split(' ');
        return parseInt(parts[parts.length - 1]) || 0;
      };
      return getYear(getDateString(b)) - getYear(getDateString(a));
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const fetchCreatorData = async () => {
    try {
      const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMe.ok) {
        const meData = await resMe.json();
        const cleanIds = (meData.following || []).map(f => (f._id || f).toString());
        setMyFollowing(cleanIds);
      }

      const res = await fetch(`${API_BASE_URL}/api/network/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const rawData = await res.json();
        setData(rawData);
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

  useEffect(() => {
    if (userId) fetchCreatorData();
  }, [userId]); 

  const sortedExperience = useMemo(() => {
    return data?.profile?.experience ? sortChronologicallyDescending(data.profile.experience) : [];
  }, [data?.profile?.experience]);

  const sortedEducation = useMemo(() => {
    return data?.profile?.education ? sortChronologicallyDescending(data.profile.education) : [];
  }, [data?.profile?.education]);


  const [isFollowTransitioning, setIsFollowTransitioning] = useState(false);

  const handleFollowToggle = async () => {
    // 🔥 SECURITY LOCK: Agar pehle se request chal rahi hai, toh agla click reject karo
    if (isFollowTransitioning) return;
    
    setIsFollowTransitioning(true);
    const isCurrentlyFollowing = myFollowing.includes(userId.toString());
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/follow/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const resData = await res.json();
        
        if (resData.following) {
          const updatedIds = resData.following.map(uid => (uid._id || uid).toString());
          setMyFollowing(updatedIds);
        } else {
          setMyFollowing(prev => 
            isCurrentlyFollowing ? prev.filter(uid => uid !== userId.toString()) : [...prev, userId.toString()]
          );
        }

        setData(prev => {
          if (!prev || !prev.profile) return prev;
          let newFollowers = [...(prev.profile.followers || [])];
          if (isCurrentlyFollowing) {
            newFollowers = newFollowers.filter(f => (f._id || f).toString() !== userId.toString());
        {/*     toast.success("Unfollowed member node.");    */}
          } else {
            newFollowers.push(userId);
            {/*  toast.success("Following updates live! 📢");   */}
          }
          return { 
            ...prev, 
            profile: { 
              ...prev.profile, 
              followers: newFollowers
            } 
          };
        });
      }
    } catch (err) {
      toast.error("Action pipeline sync broke down.");
    } finally {
      // 🔥 RELEASE LOCK: Request complete hone par lock kholo
      setIsFollowTransitioning(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: userId })
      });

      const conversationData = await res.json();
      if (res.ok && conversationData) {
        toast.success("Opening secure stream... 💬");
        const chatRoomId = conversationData._id || conversationData.id;
        navigate('/messages', { state: { autoSelectChatId: chatRoomId } }); 
      } else {
        toast.error(conversationData.message || "Failed to initiate chat bridge.");
      }
    } catch (err) {
      toast.error("Navigation routing layout fault.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            posts: prev.posts.map(p => p._id === postId ? { ...p, likes: p.likes?.includes(userId) ? p.likes.filter(id => id !== userId) : [...(p.likes || []), userId] } : p)
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Deleted successfully! 🗑️");
        setData(prev => {
          if (!prev) return prev;
          return { ...prev, posts: prev.posts.filter(p => p._id !== postId) };
        });
      }
    } catch (err) {
      toast.error("Network fault processing delete.");
    }
  };

  const handleUpdateComments = (id, newComments) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map(p => p._id === id ? { ...p, comments: newComments } : p)
      };
    });
  };

  if (loading || !data || !data.profile) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-pulse text-left">
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
  const checkIsFollowingProfile = myFollowing.includes(profile._id.toString());

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-4 pb-12 relative px-4 md:px-0 text-left">
      
      <button onClick={onBack} className="mb-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
        ← Back to Network
      </button>

      {/* 🖼️ PROFILE MASTER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-black relative"></div> 
        
        <div className="px-6 pb-6 relative">
          
          <div className="absolute -top-16 left-6 z-10">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-900 text-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-extrabold tracking-wide overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile.name)}
            </div> 
            
            {profile.role === 'official' && (
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                <svg className="w-5 h-5 text-teal-600 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Main Info Text Layer */}
          <div className="pt-14 md:pt-20 mt-2 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 tracking-wider">
                {profile.role === 'official' ? 'Official 🏛️' : profile.role === 'creator' ? 'Creator 🎓' : 'Aspirant 🎯'}
              </span>
            </div>
            
            <div className="space-y-0.5 mb-1.5">
              <p className="text-slate-800 text-sm md:text-[15px] font-normal leading-normal">{profile.tagline || 'Active Network Node'}</p>
              {(profile.jobTitle || profile.department) && (
                <p className="text-slate-500 text-xs md:text-[13px]">{profile.jobTitle} {profile.department ? `at ${profile.department}` : ''}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400 mb-3">
              {profile.city ? `${profile.city}, ${profile.state ? profile.state + ', ' : ''}India` : 'India'}
            </div>

            {/* 👥 FIXED LINKEDIN STYLE COMPACT COUNTER */}
            <div className="flex items-center gap-1 text-xs md:text-sm mb-4">
              <span className="font-bold text-slate-800">{profile.followers?.length || 0}</span>
              <span className="text-slate-500 font-medium mr-3">followers</span>
              <span className="font-bold text-slate-800">{profile.following?.length || 0}</span>
              <span className="text-slate-500 font-medium">following</span>
            </div>

            {/* 🚀 FIXED RESPONSIVE BUTTON FRAME (Followers Ke Niche) */}
            <div className="flex flex-row items-center gap-2 pt-0.5 z-20 w-full sm:max-w-xs">
              <button 
                onClick={handleFollowToggle}
                disabled={isFollowTransitioning}
                className={`flex-1 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1 ${
                  checkIsFollowingProfile 
                    ? 'bg-white border border-slate-400  text-slate-600 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-700' 
                    : 'bg-slate-800 text-white border border-slate-900 hover:bg-slate-900  hover:text-white '
                }`}
              >
                {checkIsFollowingProfile ? 'Following' : 'Follow'}
              </button>

              <button 
                onClick={handleStartChat}
                className="flex-1 px-4 py-2 bg-white text-slate-700 border border-slate-400 rounded-xl text-sm font-bold hover:border-slate-500 hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                Message
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      {activeTab === 'About' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Summary</h2>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {profile.bio || 'No professional summary provided yet.'}
            </p>
          </div>

          {profile.targetExams && profile.targetExams.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Targeted Exams</h2>
               <div className="flex flex-wrap gap-2">
                 {profile.targetExams.map((exam, idx) => exam.trim() && (
                   <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold">
                     🎯 {exam.trim()}
                   </span>
                 ))}
               </div>
            </div>
          )}

          {sortedExperience && sortedExperience.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Experience History</h2>
              <div className="space-y-5">
                {sortedExperience.map((exp, idx) => (
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

          {sortedEducation && sortedEducation.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Education Credentials</h2>
              <div className="space-y-5">
                {sortedEducation.map((edu, idx) => (
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
          {posts && posts.filter(post => !post.page).length > 0 ? (
            posts
              .filter(post => !post.page)
              .map(post => (
                <PostCard 
                  key={post._id} 
                  post={{...post, user: profile}} 
                  onDelete={handleDelete} 
                  onLike={handleLike}
                  onUpdateComments={handleUpdateComments}
                />
              ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">No activity posted yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}