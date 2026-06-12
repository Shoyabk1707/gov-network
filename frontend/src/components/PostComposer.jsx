import { useState } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostComposer({ onPostSuccess }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General'); // ✨ Default category synchronized to General

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
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
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 text-left">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm">
            <svg width="256px" height="256px" viewBox="-5.12 -5.12 26.24 26.24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#000000"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg>
          </div>
          <textarea 
            placeholder="Share an update, ask a question, or post news..." 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full bg-transparent border border-gray-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-gray-700 text-sm placeholder-gray-500 resize-none p-3 h-14 transition-all" 
            required 
          />
        </div>
        
        <div className="flex justify-between items-center pt-2 pl-[60px]">
          <div className="flex gap-4 items-center">
            <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Media
            </button>
            
            {/* ✨ UPDATED: Unified Options Selector Menu */}
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="text-sm font-bold text-slate-600 bg-slate-100 border-none rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="General">General</option>
              <option value="Exam update">Exam update</option>
              <option value="Study material">Study material</option>
            </select>
          </div>
          
          {/* ✨ Premium Active/Disabled State Styling Button Layout */}
          <button 
            type="submit" 
            disabled={!content.trim()} 
            className={`px-5 py-2 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 text-white ${
              content.trim() ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#8392AB] opacity-60 cursor-not-allowed'
            }`}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}