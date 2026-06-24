import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import SkeletonPost from './SkeletonPost';
import PostCard from './PostCard';
import ExperienceModal from './ExperienceModal';
import EducationModal from './EducationModal';

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('About'); 
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [expModalConfig, setExpModalConfig] = useState({ isOpen: false, editData: null });
  const [eduModalConfig, setEduModalConfig] = useState({ isOpen: false, editData: null });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({});

  // 🔥 MASTER CHRONOLOGICAL SORT ENGINE (Descending Order: Latest on Top)
  // Handles both Experience (startDate) and Education (startYear) schemas seamlessly
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

  const fetchProfileData = async () => {
    try {
      const resProfile = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resProfile.ok) {
        const data = await resProfile.json();
        setUser(data);
        setFormData({
          name: data.name || '', tagline: data.tagline || '', city: data.city || '', 
          state: data.state || '', bio: data.bio || '', 
          department: data.department || '', jobTitle: data.jobTitle || '',
          targetExams: data.targetExams?.join(', ') || ''
        });

        const resPosts = await fetch(`${API_BASE_URL}/api/posts`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resPosts.ok) {
          const allPosts = await resPosts.json();
          setUserPosts(allPosts.filter(post => String(post.user?._id || post.user) === String(data._id) && !post.page));
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
    } catch (err) {}
  };

  useEffect(() => { fetchProfileData(); fetchSavedPosts(); }, []);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File size must be under 5MB!");

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);
    setUploadingAvatar(true);
    const loadToast = toast.loading("Uploading snapshot...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-avatar`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: uploadFormData });
      const responseData = await res.json();
      if (res.ok) {
        toast.success("Avatar updated! 📸", { id: loadToast });
        setUser(prev => ({ ...prev, avatar: responseData.avatar }));
      }
    } catch (err) {} finally { setUploadingAvatar(false); }
  };

  const handleMainChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveToDatabase = async (updatedFields) => {
    try {
      let payload = {
        name: formData.name || user.name,
        tagline: formData.tagline || user.tagline,
        city: formData.city || user.city,
        state: formData.state || user.state,
        bio: formData.bio || user.bio,
        department: formData.department !== undefined ? formData.department : user.department,
        jobTitle: formData.jobTitle !== undefined ? formData.jobTitle : user.jobTitle,
        experience: updatedFields.experience !== undefined ? updatedFields.experience : user.experience,
        education: updatedFields.education !== undefined ? updatedFields.education : user.education,
      };

      if (formData.targetExams && typeof formData.targetExams === 'string') {
        payload.targetExams = formData.targetExams.split(',').map(e => e.trim()).filter(e => e);
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();
      if (res.ok) {
        setUser(responseData); 
        setShowEditModal(false);
        setExpModalConfig({ isOpen: false, editData: null });
        setEduModalConfig({ isOpen: false, editData: null });
        toast.success("Profile synced! ✨");
      }
    } catch (err) {}
  };

  const handleSaveExperience = (data) => {
    let currentExpList = [...(user.experience || [])];
    if (data._id) {
      currentExpList = currentExpList.map(item => item._id === data._id ? data : item);
    } else {
      currentExpList.push(data);
    }
    saveToDatabase({ experience: currentExpList });
  };

  const handleDeleteExperience = (id) => {
    if (!window.confirm("Delete this workspace record?")) return;
    saveToDatabase({ experience: (user.experience || []).filter(item => item._id !== id) });
  };

  const handleSaveEducation = (data) => {
    let currentEduList = [...(user.education || [])];
    if (data._id) {
      currentEduList = currentEduList.map(item => item._id === data._id ? data : item);
    } else {
      currentEduList.push(data);
    }
    saveToDatabase({ education: currentEduList });
  };

  const handleDeleteEducation = (id) => {
    if (!window.confirm("Delete this academic record?")) return;
    saveToDatabase({ education: (user.education || []).filter(item => item._id !== id) });
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setUserPosts((prev) => prev.filter(p => p._id !== postId));
        toast.success("Deleted! 🗑️");
      }
    } catch (err) {}
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { fetchProfileData(); fetchSavedPosts(); }
    } catch (err) {}
  };

  if (!user) return <div className="max-w-3xl mx-auto mt-6 px-4 animate-pulse"><SkeletonPost /></div>;

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-4 pb-12 relative px-4 md:px-0 text-left">
      <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Intro Info</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase(formData); }} className="space-y-4">
              <input type="text" name="name" value={formData.name || ''} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Full Name" required />
              <input type="text" name="tagline" value={formData.tagline || ''} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Headline Tagline" />
              <div className="flex gap-4">
                <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Designation" />
                <input type="text" name="department" value={formData.department || ''} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Organization" />
              </div>
              <div className="flex gap-4">
                <input type="text" name="city" value={formData.city || ''} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="City" />
                <input type="text" name="state" value={formData.state || ''} onChange={handleMainChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="State" />
              </div>
              <textarea name="bio" value={formData.bio || ''} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-24 outline-none text-sm font-medium text-slate-900" placeholder="Summary..."></textarea>
              <input type="text" name="targetExams" value={formData.targetExams || ''} onChange={handleMainChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Targeted Exams" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 text-slate-600 font-semibold rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExperienceModal isOpen={expModalConfig.isOpen} onClose={() => setExpModalConfig({ isOpen: false, editData: null })} onSave={handleSaveExperience} onDelete={handleDeleteExperience} editData={expModalConfig.editData} />
      <EducationModal isOpen={eduModalConfig.isOpen} onClose={() => setEduModalConfig({ isOpen: false, editData: null })} onSave={handleSaveEducation} onDelete={handleDeleteEducation} editData={eduModalConfig.editData} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-black relative"></div>
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-16 left-6 z-10">
            <div onClick={() => !uploadingAvatar && fileInputRef.current.click()} className="group relative w-32 h-32 bg-slate-900 text-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-extrabold overflow-hidden cursor-pointer">
              {uploadingAvatar ? <span className="text-xs text-teal-400 animate-pulse">SYNCING</span> : (
                <>
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(user.name)}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /></svg></div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setShowEditModal(true)} className="px-4 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-100 transition shadow-sm">Edit Profile</button>
          </div>
          <div className="pt-2 mt-2 text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
            
            <div className="space-y-0.5 mb-2 mt-1">
              <p className="text-slate-800 text-[15px] font-medium">{user.tagline || 'Active Network Member'}</p>
              {(user.jobTitle || user.department) && (
                <p className="text-slate-500 text-[13px]">
                  {user.jobTitle} {user.department ? `at ${user.department}` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
              {user.city ? `${user.city}, ${user.state}, India` : 'India'}
            </div>

            {/* 👥 LINKEDIN STYLE FOLLOWERS & FOLLOWING COUNTER */}
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <span className="text-blue-600 hover:underline cursor-pointer">
                {user.followers?.length || 0} followers
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 hover:underline cursor-pointer">
                {user.following?.length || 0} following
              </span>
            </div>

            
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex p-1">
        {['About', 'Activity', 'Saved'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'About' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 relative">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Summary</h2>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{user.bio || 'Add professional bio summaries...'}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience History</h2>
              <button onClick={() => setExpModalConfig({ isOpen: true, editData: null })} className="text-slate-900 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">+ Add</button>
            </div>
            <div className="space-y-5">
              {user.experience?.length > 0 ? (
                sortChronologicallyDescending(user.experience).map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0 flex justify-between items-start group text-left">
                    <div>
                      <div className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="font-bold text-slate-900 text-sm">{exp.title}</h3>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                      <p className="text-xs text-slate-500 mt-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    </div>
                    <button onClick={() => setExpModalConfig({ isOpen: true, editData: exp })} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 transition p-1 rounded-md hover:bg-slate-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                ))
              ) : <p className="text-sm text-slate-400 italic">No workspace records.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Education Credentials</h2>
              <button onClick={() => setEduModalConfig({ isOpen: true, editData: null })} className="text-slate-900 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">+ Add</button>
            </div>
            <div className="space-y-5">
              {user.education?.length > 0 ? (
                sortChronologicallyDescending(user.education).map((edu, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200 last:border-0 flex justify-between items-start group text-left">
                    <div>
                      <div className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="font-bold text-slate-900 text-sm">{edu.school}</h3>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                      {/* 🔴 RENDER LAYER FIXED TO MATCH SCHEMA KEYS */}
                      <p className="text-xs text-slate-500 mt-1">{edu.startYear} - {edu.endYear}</p>
                    </div>
                    <button onClick={() => setEduModalConfig({ isOpen: true, editData: edu })} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 transition p-1 rounded-md hover:bg-slate-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                ))
              ) : <p className="text-sm text-slate-400 italic">No academic timelines added yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? userPosts.map(post => <PostCard key={post._id} post={post} onDelete={handleDelete} onLike={handleLike} />) : <p className="text-sm text-slate-400 italic text-center py-6">No shared streams.</p>}
        </div>
      )}

      {activeTab === 'Saved' && (
        <div className="space-y-4">
          {savedPosts.length > 0 ? savedPosts.map(post => <PostCard key={post._id} post={post} onDelete={handleDelete} onLike={handleLike} />) : <p className="text-sm text-slate-400 italic text-center py-6">No saved cards.</p>}
        </div>
      )}
    </div>
  );
}