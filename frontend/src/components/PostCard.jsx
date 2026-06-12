import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete, onLike, onUpdateComments }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Parse logged-in user profile metrics cleanly
  let currentUserId = null;
  try {
    const tokenPayload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    currentUserId = tokenPayload?._id || tokenPayload?.id;
  } catch (err) {
    console.error("Token translation issue:", err);
  }

  const isPagePost = post.page !== null && post.page !== undefined;
  
  // Author data mapping engines
  const authorName = isPagePost ? post.page.name : post.user?.name || "User Node";
  const authorSubtext = isPagePost 
    ? `${post.page.category === 'Coaching Institute' ? 'Institute Update' : 'Content Creator'}`
    : post.user?.jobTitle || "Member";

  // Dynamic initialization generator
  const getAvatarInitials = (nameString) => {
    if (!nameString) return "KB";
    const clean = nameString.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  // 🔥 AUTHORIZATION SECURITY GATE: Validates owner status chain explicitly
  const isPostAuthor = !isPagePost && post.user && String(post.user._id || post.user) === String(currentUserId);
  const isPageManager = isPagePost && post.page.owner && String(post.page.owner._id || post.page.owner) === String(currentUserId);
  const canDelete = isPostAuthor || isPageManager;

  const handleShare = async (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Link copied to clipboard! 🔗");
    } catch (err) {
      toast.error("Failed to copy path link.");
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/save`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      res.ok ? toast.success(data.message) : toast.error(data.message);
    } catch (err) {
      toast.error("Error processing notice save loop.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const updatedComments = await res.json();
        onUpdateComments(post._id, updatedComments);
        setCommentText('');
        toast.success("Response posted! 💬");
      }
    } catch (err) {
      toast.error("Comment submission failed.");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/post/${post._id}`)}
      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-left space-y-4"
    >
      {/* HEADER CONTROLS VIEW */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          {/* Dynamic Alphabetic Letter Block */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm tracking-wide shrink-0 ${
            isPagePost ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {getAvatarInitials(authorName)}
          </div>
          
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight flex items-center gap-1.5">
              {authorName}
              {post.user?.role === 'official' && !isPagePost && (
                <span className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider scale-90">Official</span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5 tracking-wide">
              {authorSubtext} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Badge indicator on matching stream tag */}
          <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
            {post.category || 'General'}
          </span>
          
          {/* 🔥 DYNAMIC OWNER PROTECTION CHECK TRIGGER */}
          {canDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(post._id); }} 
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
              title="Delete Post"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* MIDDLE CONTAINER SLOTS FOR CONTENT INFRASTRUCTURE */}
      <p className="text-slate-800 text-[14px] font-medium whitespace-pre-wrap leading-relaxed tracking-normal pt-0.5 px-0.5">
        {post.content}
      </p>
      
      {/* FOOTER CORE ACTION BAR MECHANICS */}
      <div 
        className="pt-2 border-t border-slate-100 flex items-center justify-between" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => onLike(post._id)} 
            className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition gap-1.5 border border-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.757a2 2 0 011.708 3.033l-3.668 6.115A2 2 0 0115.086 20H9.172a2 2 0 01-1.664-.89l-3.333-5A2 2 0 015.84 11H10V4a1 1 0 011-1h2a1 1 0 011 1v6z" />
            </svg>
            <span>{post.likes?.length || 0}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)} 
            className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition gap-1.5 border border-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12Custom c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments?.length || 0}</span>
          </button>

          <button 
            onClick={handleShare} 
            className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition gap-1.5 border border-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{isCopied ? "Copied" : "Share"}</span>
          </button>
        </div>

        <button 
          onClick={handleSave} 
          className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition gap-1.5 border border-slate-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Save</span>
        </button>
      </div>

      {/* COMMENTS ENGINE INJECTION LAYOUT */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                <span className="font-extrabold text-slate-900 text-[11px] block">{comment.user?.name || "User Node"}</span>
                <p className="text-slate-700 text-xs mt-0.5 font-medium whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2">
            <input 
              type="text" 
              placeholder="Add an official response comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-medium"
              required 
            />
            <button type="submit" className="text-slate-950 font-black text-xs px-3 hover:text-slate-700 transition">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}