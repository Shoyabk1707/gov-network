import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import SkeletonPost from './SkeletonPost';

const ProfilePostCard = ({ post, author, getInitials, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const WORD_LIMIT = 25;

  const content = post.content || post.title || '';
  const words = content.split(' ');
  const isLong = words.length > WORD_LIMIT;
  const displayContent = isExpanded ? content : words.slice(0, WORD_LIMIT).join(' ') + (isLong ? '...' : '');

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleActionClick = (e, actionName) => {
    e.stopPropagation();
    toast(`${actionName} clicked! (Backend link pending)`, { icon: '🚧' });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer mb-4 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-[#2563eb] text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm">
            {getInitials(author?.name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-[15px] hover:text-blue-600 transition">{author?.name || 'Unknown User'}</h3>
              {author?.role && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  author.role === 'official' ? 'bg-slate-900 text-white' : 
                  author.role === 'creator' ? 'bg-[#ca8a04] text-white' : 'bg-emerald-700 text-white'
                }`}>
                  {author.role === 'official' ? 'Official' : author.role === 'creator' ? 'Creator / Institute' : 'Aspirant'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{author?.tagline || author?.jobTitle || 'Active Member'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'} 
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
              <span className="text-blue-500 font-medium">{post.category || 'General Update'}</span>
            </p>
          </div>
        </div>

        <p className="text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
          {displayContent}
          {isLong && !isExpanded && (
            <span onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="text-slate-500 font-semibold cursor-pointer ml-1 hover:text-blue-600 transition">
              read more
            </span>
          )}
          {isLong && isExpanded && (
            <span onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-slate-500 font-semibold cursor-pointer ml-1 hover:text-blue-600 transition">
              show less
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

export default function Profile() {
  const navigate = useNavigate();

  // STATES
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('About'); 
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  
  const [formData, setFormData] = useState({});
  const [expData, setExpData] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', current: false });
  const [eduData, setEduData] = useState({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });

  const token = localStorage.getItem('token');

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const fetchProfileData = async () => {
    try {
      const resProfile = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resProfile.ok) {
        const currentUserData = await resProfile.json();
        setUser(currentUserData);
        setFormData({
          name: currentUserData.name || '', tagline: currentUserData.tagline || '', city: currentUserData.city || '', 
          state: currentUserData.state || '', bio: currentUserData.bio || '', targetExams: currentUserData.targetExams?.join(', ') || ''
        });

        const resPosts = await fetch(`${API_BASE_URL}/api/posts`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resPosts.ok) {
          const allPosts = await resPosts.json();
          setUserPosts(allPosts.filter(post => String(post.user?._id || post.user) === String(currentUserData._id)));
        }
      }
    } catch (err) {
      toast.error("Failed to fetch profile data!");
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/saved`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setSavedPosts(await res.json());
    } catch (err) {
      // silent error or toast
    }
  };

  useEffect(() => { fetchProfileData(); fetchSavedPosts(); }, []);

  const handleMainChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEduChange = (e) => setEduData({ ...eduData, [e.target.name]: e.target.value });
  const handleExpChange = (e) => setExpData({ ...expData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const saveToDatabase = async (updatedFields) => {
    try {
      let payload = { ...user, ...updatedFields };
      // If targetExams was updated in formData, convert it back to array if it's a string
      if (updatedFields.targetExams !== undefined && typeof updatedFields.targetExams === 'string') {
         payload.targetExams = updatedFields.targetExams.split(',').map(e => e.trim()).filter(e => e);
      }
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setUser(await res.json()); 
        setShowEditModal(false); setShowExpModal(false); setShowEduModal(false);
        setExpData({ title: '', company: '', location: '', startDate: '', endDate: '', current: false });
        setEduData({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
        toast.success("Profile updated successfully! ✨");
      } else toast.error(`Backend Error`);
    } catch (err) { toast.error(`Network Error`); }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="h-32 bg-slate-200"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white absolute -top-16 left-6"></div>
          </div>
        </div>
        <SkeletonPost />
      </div>
    );
  }

  const tabs = ['About', 'Activity', 'Saved'];

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-4 pb-12 relative px-4 md:px-0">
      
      {/* MODALS */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Edit Intro & About</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase(formData); }} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Full Name" required />
              <input type="text" name="tagline" value={formData.tagline} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Headline / Tagline" />
              <div className="flex gap-4">
                <input type="text" name="city" value={formData.city} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="City" />
                <input type="text" name="state" value={formData.state} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="State" />
              </div>
              <textarea name="bio" value={formData.bio} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-24 outline-none" placeholder="Professional Summary..."></textarea>
              
              {(user.role === 'aspirant' || user.role === 'official') && (
                <input type="text" name="targetExams" value={formData.targetExams} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Targeted Exams (e.g. UPSC CSE, UPPCS)" />
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Add Experience</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase({ experience: [...(user.experience || []), expData] }); }} className="space-y-4">
              <input type="text" name="title" value={expData.title} onChange={handleExpChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Job Title" required />
              <input type="text" name="company" value={expData.company} onChange={handleExpChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Company Name" required />
              <input type="text" name="location" value={expData.location} onChange={handleExpChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Location" />
              <div className="flex gap-4">
                <input type="text" name="startDate" value={expData.startDate} onChange={handleExpChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Start Date" required />
                {!expData.current && <input type="text" name="endDate" value={expData.endDate} onChange={handleExpChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="End Date" />}
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="current" checked={expData.current} onChange={handleExpChange} className="w-4 h-4 rounded text-blue-600" /> I currently work here
              </label>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition">Add Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEduModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Add Education</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase({ education: [...(user.education || []), eduData] }); }} className="space-y-4">
              <input type="text" name="school" value={eduData.school} onChange={handleEduChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="School / University" required />
              <input type="text" name="degree" value={eduData.degree} onChange={handleEduChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Degree" required />
              <input type="text" name="fieldOfStudy" value={eduData.fieldOfStudy} onChange={handleEduChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Field of Study" />
              <div className="flex gap-4">
                <input type="text" name="startYear" value={eduData.startYear} onChange={handleEduChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Start Year" />
                <input type="text" name="endYear" value={eduData.endYear} onChange={handleEduChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="End Year" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEduModal(false)} className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition">Add Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN PROFILE HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] relative"></div> 
        
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-16 left-6 z-10">
            <div className="w-32 h-32 bg-[#2563eb] text-white rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl font-extrabold tracking-wide">
              {getInitials(user.name)}
            </div> 
            {user.role === 'official' && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                <svg className="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-100 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Edit Profile
            </button>
          </div>
          
          <div className="pt-2 mt-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                user.role === 'official' ? 'bg-[#0f172a]' : 
                user.role === 'creator' ? 'bg-[#ca8a04]' : 'bg-[#059669]'
              }`}>
                {user.role === 'official' ? 'Government Official' : user.role === 'creator' ? 'Creator / Institute' : 'Exam Aspirant'}
              </span>
            </div>
            
            <p className="text-slate-700 text-[15px] font-medium mb-2">
              {user.tagline || user.jobTitle || user.department || 'Active Network Member'}
            </p>
            
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {user.city ? `${user.city}, ${user.state ? user.state + ', ' : ''}India` : 'India'}
            </div>

            <div className="flex items-center gap-6 border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-slate-300">
                <span className="font-extrabold text-slate-900 text-[17px]">{user.followers?.length || 0}</span>
                <span className="text-sm font-medium text-slate-500">Followers</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-slate-300">
                <span className="font-extrabold text-slate-900 text-[17px]">{user.following?.length || 0}</span>
                <span className="text-sm font-medium text-slate-500">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-x-auto hide-scrollbar p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-2.5 text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === tab ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'About' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* A. About Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
            <button onClick={() => setShowEditModal(true)} className="absolute top-4 right-5 text-slate-400 hover:text-blue-600 transition">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">About Summary</h2>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {user.bio || 'Add a professional summary about your background and goals.'}
            </p>
          </div>

          {/* B. Targeted Exams */}
          {(user.role === 'aspirant' || (user.role === 'official' && user.targetExams && user.targetExams.length > 0)) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Targeted Exams</h2>
               {user.targetExams && user.targetExams.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {(Array.isArray(user.targetExams) ? user.targetExams : user.targetExams.split(',')).map((exam, idx) => {
                     if (!exam.trim()) return null; 
                     return (
                       <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold">
                         🎯 {exam.trim()}
                       </span>
                     );
                   })}
                 </div>
               ) : (
                 <p className="text-sm text-slate-500 italic">No targeted exams added yet. Click edit to add.</p>
               )}
            </div>
          )}

          {/* C. Experience */}
          {user.role !== 'creator' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</h2>
                <button onClick={() => setShowExpModal(true)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition">
                  + Add
                </button>
              </div>
              <div className="space-y-5">
                {user.experience?.length > 0 ? (
                  user.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0">
                      <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="font-bold text-slate-900 text-sm">{exp.title}</h3>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">{exp.company} • {exp.location}</p>
                      <p className="text-xs text-slate-500 mt-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-slate-500 italic">Add your professional work experience here.</p>}
              </div>
            </div>
          )}

          {/* D. Education */}
          {user.role !== 'creator' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Education</h2>
                <button onClick={() => setShowEduModal(true)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition">
                  + Add
                </button>
              </div>
              <div className="space-y-5">
                {user.education?.length > 0 ? (
                  user.education.map((edu, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0">
                      <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="font-bold text-slate-900 text-sm">{edu.school}</h3>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">{edu.degree}, {edu.fieldOfStudy}</p>
                      <p className="text-xs text-slate-500 mt-1">{edu.startYear} - {edu.endYear}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-slate-500 italic">Add your educational background here.</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="space-y-4 animate-fadeIn">
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <ProfilePostCard key={post._id} post={post} author={user} getInitials={getInitials} navigate={navigate} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">You haven't posted anything yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Saved' && (
        <div className="space-y-4 animate-fadeIn">
          {savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <ProfilePostCard 
                key={post._id} 
                post={post} 
                author={post.user || { name: 'Unknown User', role: 'aspirant' }} 
                getInitials={getInitials} 
                navigate={navigate} 
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-3xl block mb-2 opacity-50">🔖</span>
              <p className="text-sm font-medium text-slate-500">No Saved Notices.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}