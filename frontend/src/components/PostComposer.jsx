import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostComposer({ onPostSuccess }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [userName, setUserName] = useState('User');
  const token = localStorage.getItem('token');

  // Fetch log-in user initialization layout details
  useEffect(() => {
    const fetchUserInitials = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || 'User');
        }
      } catch (err) {
        console.error("Avatar fallback resolve error:", err);
      }
    };
    if (token) fetchUserInitials();
  }, [token]);

  const getInitials = (nameStr) => {
    if (!nameStr) return "SH";
    const clean = nameStr.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content, category }) 
      });
      
      if (res.ok) {
        const newPostData = await res.json(); 
        onPostSuccess(newPostData); 
        setContent('');
        toast.success("Post published successfully! 🚀");
      } else {
        toast.error("Failed to publish post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm mb-6 text-left">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {/* ✨ FIXED AVATAR INITIALS: Replaced buggy SVG layout with clean alphabetic circle */}
          <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm tracking-wide shadow-sm uppercase">
            {getInitials(userName)}
          </div>
          <textarea 
            placeholder={`Share an update, ${userName.split(' ')[0]}...`} 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full bg-transparent border border-slate-150 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-gray-700 text-sm placeholder-gray-400 resize-none p-3 h-14 transition-all outline-none" 
            required 
          />
        </div>
        
        <div className="flex justify-between items-center pt-2 pl-[56px]">
          <div className="flex gap-4 items-center">
            <button type="button" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Media
            </button>
            
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="text-xs font-extrabold text-slate-600 bg-slate-100 border-none rounded-lg px-2.5 py-1.5 focus:ring-0 cursor-pointer outline-none uppercase tracking-wide"
            >
              <option value="General">General</option>
              <option value="Exam update">Exam update</option>
              <option value="Study material">Study material</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={!content.trim()} 
            className={`px-5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-sm ${
              content.trim() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}