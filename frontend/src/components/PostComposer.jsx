import { useState } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostComposer({ onPostSuccess }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Networking');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      // 🚀 CLEAN PAYLOAD: Koi dummy title nahi bhejenge ab
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
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-[#3b5998] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
            SH
          </div>
          <textarea 
            placeholder="Share an update, Shoyab..." 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full bg-transparent border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm placeholder-gray-500 resize-none p-3 h-14 transition-all" 
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
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="text-sm font-medium text-slate-600 bg-slate-100 border-none rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer"
            >
              <option value="Networking">Networking</option>
              <option value="Job Updates">Job Updates</option>
              <option value="Study Resources">Study Resources</option>
            </select>
          </div>
          <button type="submit" className="bg-[#8392AB] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-500 transition shadow-sm flex items-center gap-2">
            Post
          </button>
        </div>
      </form>
    </div>
  );
}