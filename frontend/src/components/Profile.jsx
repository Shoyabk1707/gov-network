import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import SkeletonPost from './SkeletonPost';

export default function Profile() {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('my_posts'); 
  
  // Modal & Form States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  
  const [formData, setFormData] = useState({});
  const [expData, setExpData] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', current: false });
  const [eduData, setEduData] = useState({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });

  const token = localStorage.getItem('token');

  // --- 🌟 HELPER: GET INITIALS FOR AVATAR ---
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  // --- API CALLS ---
  const fetchProfileData = async () => {
    try {
      const resProfile = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resProfile.ok) {
        const currentUserData = await resProfile.json();
        setUser(currentUserData);
        setFormData({
          name: currentUserData.name || '', tagline: currentUserData.tagline || '', city: currentUserData.city || '', 
          state: currentUserData.state || '', bio: currentUserData.bio || '', skills: currentUserData.skills || ''
        });

        // Fetch Posts directly after getting user to save time
        const resPosts = await fetch(`${API_BASE_URL}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
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
      const res = await fetch(`${API_BASE_URL}/api/posts/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSavedPosts(await res.json());
    } catch (err) {
      toast.error("Failed to fetch saved posts");
    }
  };

  useEffect(() => { 
    fetchProfileData(); 
    fetchSavedPosts(); 
  }, []); // Optimized dependency array

  // --- HANDLERS ---
  const handleMainChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEduChange = (e) => setEduData({ ...eduData, [e.target.name]: e.target.value });
  const handleExpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpData({ ...expData, [name]: type === 'checkbox' ? checked : value });
  };

  const saveToDatabase = async (updatedFields) => {
    try {
      const payload = { ...user, ...updatedFields };
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
      } else {
        toast.error(`Backend Error: ${await res.text()}`);
      }
    } catch (err) {
       toast.error(`Network Error: ${err.message}`);
    }
  };

  // --- LOADING SKELETON ---
  if (!user) {
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
        <SkeletonPost /><SkeletonPost />
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4 pb-12 relative px-4 md:px-0">
      
      {/* --- MODALS --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Intro & About</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase(formData); }} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleMainChange} className="w-full p-2 border rounded" placeholder="Full Name" required />
              <input type="text" name="tagline" value={formData.tagline} onChange={handleMainChange} className="w-full p-2 border rounded" placeholder="Tagline (e.g. Developer)" />
              <div className="flex gap-4">
                <input type="text" name="city" value={formData.city} onChange={handleMainChange} className="w-1/2 p-2 border rounded" placeholder="City" />
                <input type="text" name="state" value={formData.state} onChange={handleMainChange} className="w-1/2 p-2 border rounded" placeholder="State" />
              </div>
              <textarea name="bio" value={formData.bio} onChange={handleMainChange} className="w-full p-2 border rounded h-24" placeholder="About you..."></textarea>
              <input type="text" name="skills" value={formData.skills} onChange={handleMainChange} className="w-full p-2 border rounded" placeholder="Skills (comma separated)" />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Add Experience</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase({ experience: [...(user.experience || []), expData] }); }} className="space-y-4">
              <input type="text" name="title" value={expData.title} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Job Title" required />
              <input type="text" name="company" value={expData.company} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Company Name" required />
              <input type="text" name="location" value={expData.location} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Location" />
              <div className="flex gap-4 items-center">
                <input type="text" name="startDate" value={expData.startDate} onChange={handleExpChange} className="w-1/2 p-2 border rounded" placeholder="Start Date" required />
                {!expData.current && <input type="text" name="endDate" value={expData.endDate} onChange={handleExpChange} className="w-1/2 p-2 border rounded" placeholder="End Date" />}
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="current" checked={expData.current} onChange={handleExpChange} /> I currently work here
              </label>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEduModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Add Education</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveToDatabase({ education: [...(user.education || []), eduData] }); }} className="space-y-4">
              <input type="text" name="school" value={eduData.school} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="School / University" required />
              <input type="text" name="degree" value={eduData.degree} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="Degree" required />
              <input type="text" name="fieldOfStudy" value={eduData.fieldOfStudy} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="Field of Study" />
              <div className="flex gap-4">
                <input type="text" name="startYear" value={eduData.startYear} onChange={handleEduChange} className="w-1/2 p-2 border rounded" placeholder="Start Year" />
                <input type="text" name="endYear" value={eduData.endYear} onChange={handleEduChange} className="w-1/2 p-2 border rounded" placeholder="End Year" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEduModal(false)} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MAIN PROFILE HEADER --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-slate-800 relative">
           <button onClick={() => setShowEditModal(true)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-blue-600 shadow hover:bg-gray-100 transition">✏️</button>
        </div> 
        <div className="px-6 pb-6 relative">
          
          {/* ✨ DYNAMIC MAIN AVATAR ✨ */}
          <div className="w-32 h-32 bg-blue-100 text-blue-700 rounded-full border-4 border-white absolute -top-16 left-6 shadow-sm flex items-center justify-center text-4xl font-extrabold tracking-wide z-10">
            {getInitials(user.name)}
          </div> 
          
          <div className="pt-20 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-700 mt-1 font-medium">{user.tagline || user.jobTitle}</p>
            <p className="text-sm text-gray-500 mt-1">{user.city || 'City'}, {user.state || 'State'}, India</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">About</h2>
          <button onClick={() => setShowEditModal(true)} className="text-gray-500 hover:text-gray-700 transition">✏️</button>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{user.bio || 'Add a summary about your professional background.'}</p>
        {user.skills && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Top skills</p>
            <p className="text-sm text-gray-600 mt-1">{user.skills}</p>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex border-b mb-6">
          <button onClick={() => setActiveTab('my_posts')} className={`pb-3 px-4 font-semibold transition text-sm ${activeTab === 'my_posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
            📝 My Activity
          </button>
          <button onClick={() => setActiveTab('saved_posts')} className={`pb-3 px-4 font-semibold transition text-sm ${activeTab === 'saved_posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
            🔖 Saved Notices
          </button>
        </div>
        
        <div className="space-y-4">
          {activeTab === 'my_posts' ? (
            userPosts.length > 0 ? (
              userPosts.map(post => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    {/* ✨ DYNAMIC POST AVATAR ✨ */}
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm hover:text-blue-600 cursor-pointer">{user.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{user.tagline || 'GovNetwork Member'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content || post.title}</p>
                </div>
              ))
            ) : <p className="text-sm text-gray-500 italic text-center py-6">You haven't posted anything yet.</p>
          ) : (
            savedPosts.length > 0 ? (
              savedPosts.map(post => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                  <div className="flex items-start gap-3 mb-3">
                    {/* ✨ DYNAMIC SAVED POST AVATAR ✨ */}
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0">
                      {getInitials(post.user?.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm hover:text-blue-600 cursor-pointer">{post.user?.name || "Unknown User"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{post.page ? `🏢 ${post.page.name}` : (post.user?.tagline || 'GovNetwork Member')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Saved Recently'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content || post.title}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <span className="text-3xl block mb-2">🔖</span>
                <p className="text-sm font-medium text-gray-700">No Saved Notices</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          <button onClick={() => setShowExpModal(true)} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">➕</button>
        </div>
        {user.experience?.length > 0 ? (
          user.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-sm text-gray-700">{exp.company} • {exp.location}</p>
              <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
            </div>
          ))
        ) : <p className="text-sm text-gray-500">Add your work experience here.</p>}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          <button onClick={() => setShowEduModal(true)} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">➕</button>
        </div>
        {user.education?.length > 0 ? (
          user.education.map((edu, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-sm text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
            </div>
          ))
        ) : <p className="text-sm text-gray-500">Add your educational background.</p>}
      </div>

    </div>
  );
}