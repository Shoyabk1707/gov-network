import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostComposer({ onPostSuccess }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserInitials = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || 'User');
          setUserAvatar(data.avatar || null);
        }
      } catch (err) {
        console.error("Avatar fallback error:", err);
      }
    };
    if (token) fetchUserInitials();
  }, [token]);

  const getInitials = (nameStr) => {
    if (!nameStr) return "SH";
    const clean = nameStr.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Max limit is 5MB.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage) {
      return toast.error("Please add some text or an image to post!");
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Publishing post updates...");
    
    const formData = new FormData();
    formData.append('content', content.trim());
    formData.append('category', category);
    
    if (selectedImage) {
      formData.append('postImage', selectedImage);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData 
      });
      
      // ✨ SAFE PARSING LAYER: HTML dump response text leak checker
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const rawTextError = await res.text();
        console.error("🔴 SERVER HTML LEAK TRACE:", rawTextError);
        throw new Error("Server did not return JSON response.");
      }

      const responseData = await res.json();

      if (res.ok) {
        onPostSuccess(responseData); 
        setContent('');
        handleRemoveImage();
        toast.success("Post published successfully! 🚀", { id: loadToast });
      } else {
        toast.error(responseData.message || "Failed to publish post.", { id: loadToast });
      }
    } catch (err) {
      console.error("🔥 FRONTEND SYSTEM TRACE ERROR:", err);
      toast.error("Network error submitting post.", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm mb-6 text-left">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm tracking-wide shadow-sm uppercase overflow-hidden border border-slate-200">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              getInitials(userName)
            )}
          </div>
          
          <textarea 
            placeholder={`Share an update, ${userName.split(' ')[0]}...`} 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full bg-transparent border border-slate-150 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-gray-700 text-sm placeholder-gray-400 resize-none p-3 h-14 transition-all outline-none" 
          />
        </div>

        {imagePreview && (
          <div className="pl-[56px] relative">
            <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 max-h-52 bg-gray-50">
              <img src={imagePreview} alt="Upload preview" className="max-h-52 object-contain rounded-xl" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1 shadow-md transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden" 
        />
        
        <div className="flex justify-between items-center pt-2 pl-[56px]">
          <div className="flex gap-4 items-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-950 text-xs font-bold uppercase tracking-wider transition"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            disabled={isSubmitting || (!content.trim() && !selectedImage)} 
            className={`px-5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-sm ${
              (content.trim() || selectedImage) && !isSubmitting
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? "Publishing..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}