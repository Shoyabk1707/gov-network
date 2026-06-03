import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({});
  const [expData, setExpData] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', current: false });
  const [eduData, setEduData] = useState({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
  
  const token = localStorage.getItem('token');

  const fetchProfileData = async () => {
    try {
      const resProfile = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resProfile.ok) {
        const data = await resProfile.json();
        setUser(data);
        setFormData({
          name: data.name || '', tagline: data.tagline || '', city: data.city || '', 
          state: data.state || '', bio: data.bio || '', skills: data.skills || ''
        });
      }

      const resPosts = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPosts.ok) {
        const allPosts = await resPosts.json();
        setUserPosts(allPosts.filter(post => post.user === user?._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProfileData(); }, [user?._id]);

  // Handlers for typing in forms
  const handleMainChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEduChange = (e) => setEduData({ ...eduData, [e.target.name]: e.target.value });
  const handleExpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpData({ ...expData, [name]: type === 'checkbox' ? checked : value });
  };

  // Generic Save Function to Database
  const saveToDatabase = async (updatedFields) => {
    try {
      const payload = {
        name: user.name, tagline: user.tagline, city: user.city, state: user.state,
        bio: user.bio, skills: user.skills, experience: user.experience, education: user.education,
        ...updatedFields
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // 1. Get the newly updated user directly from this response
        const updatedUserData = await res.json();
        
        // 2. Instantly update the UI state (bypasses browser caching!)
        setUser(updatedUserData); 
        
        // 3. Close Modals & Clear Forms
        setShowEditModal(false); 
        setShowExpModal(false); 
        setShowEduModal(false);
        setExpData({ title: '', company: '', location: '', startDate: '', endDate: '', current: false });
        setEduData({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
        
      } else {
        const errorText = await res.text();
        alert(`⚠️ Backend Error (${res.status}): ${errorText}`);
      }
    } catch (err) {
       alert(`⚠️ Network Error: ${err.message}`);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4 pb-12 relative">
      
      {/* --- MODALS --- */}
      
      {/* 1. Main Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Experience</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              saveToDatabase({ experience: [...(user.experience || []), expData] }); 
            }} className="space-y-4">
              <input type="text" name="title" value={expData.title} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Job Title" required />
              <input type="text" name="company" value={expData.company} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Company Name" required />
              <input type="text" name="location" value={expData.location} onChange={handleExpChange} className="w-full p-2 border rounded" placeholder="Location (e.g. Remote, Mumbai)" />
              <div className="flex gap-4 items-center">
                <input type="text" name="startDate" value={expData.startDate} onChange={handleExpChange} className="w-1/2 p-2 border rounded" placeholder="Start Date (e.g. Jan 2023)" required />
                {!expData.current && (
                  <input type="text" name="endDate" value={expData.endDate} onChange={handleExpChange} className="w-1/2 p-2 border rounded" placeholder="End Date" />
                )}
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="current" checked={expData.current} onChange={handleExpChange} /> I currently work here
              </label>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Education Modal */}
      {showEduModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Education</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              saveToDatabase({ education: [...(user.education || []), eduData] }); 
            }} className="space-y-4">
              <input type="text" name="school" value={eduData.school} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="School / University" required />
              <input type="text" name="degree" value={eduData.degree} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="Degree (e.g. B.Tech, MBA)" required />
              <input type="text" name="fieldOfStudy" value={eduData.fieldOfStudy} onChange={handleEduChange} className="w-full p-2 border rounded" placeholder="Field of Study" />
              <div className="flex gap-4">
                <input type="text" name="startYear" value={eduData.startYear} onChange={handleEduChange} className="w-1/2 p-2 border rounded" placeholder="Start Year" />
                <input type="text" name="endYear" value={eduData.endYear} onChange={handleEduChange} className="w-1/2 p-2 border rounded" placeholder="End Year" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEduModal(false)} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFILE UI --- */}
      
      {/* Top Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-slate-800 relative">
           <button onClick={() => setShowEditModal(true)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-blue-600 shadow hover:bg-gray-100">✏️</button>
        </div> 
        <div className="px-6 pb-6 relative">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-white -mt-16 bg-gray-300"></div> 
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-700 mt-1">{user.tagline || user.jobTitle}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user.city || 'City'}, {user.state || 'State'}, India
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">About</h2>
          <button onClick={() => setShowEditModal(true)} className="text-gray-500 hover:text-gray-700">✏️</button>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{user.bio || 'Add a summary about your professional background.'}</p>
        {user.skills && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold">Top skills</p>
            <p className="text-sm text-gray-600 mt-1">{user.skills}</p>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
        {userPosts.length > 0 ? (
          <div className="space-y-3">
            {userPosts.slice(0, 2).map(post => (
              <div key={post._id} className="text-sm text-gray-700 border-b pb-2">
                <span className="font-semibold">{user.name}</span> posted: {post.content || post.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You haven't posted anything yet.</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          <button onClick={() => setShowExpModal(true)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">➕</button>
        </div>
        {user.experience && user.experience.length > 0 ? (
          user.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-sm text-gray-700">{exp.company} • {exp.location}</p>
              <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Add your work experience here.</p>
        )}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          <button onClick={() => setShowEduModal(true)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">➕</button>
        </div>
        {user.education && user.education.length > 0 ? (
          user.education.map((edu, idx) => (
            <div key={idx} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-sm text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Add your educational background.</p>
        )}
      </div>

    </div>
  );
}