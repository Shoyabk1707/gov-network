import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete, onLike, onUpdateComments }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false); 
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  let currentUserId = null;
  try {
    const tokenPayload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    currentUserId = tokenPayload?._id || tokenPayload?.id;
  } catch (err) {
    console.error("Token translation issue:", err);
  }

  const isPagePost = post.page !== null && post.page !== undefined;
  const authorName = isPagePost ? post.page.name : post.user?.name || "User Node";
  const authorSubtext = isPagePost 
    ? `${post.page.category === 'Coaching Institute' ? 'Institute Update' : 'Content Creator'}`
    : post.user?.jobTitle || "Member";

  const getAvatarInitials = (nameString) => {
    if (!nameString) return "KB";
    const clean = nameString.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  const postAuthorId = post.user?._id || post.user;
  const pageManagerId = post.page?.owner?._id || post.page?.owner;

  const isPostAuthor = !isPagePost && postAuthorId && String(postAuthorId) === String(currentUserId);
  const isPageManager = isPagePost && pageManagerId && String(pageManagerId) === String(currentUserId);
  const canDelete = isPostAuthor || isPageManager;

  const hasLiked = post.likes && post.likes.some(id => String(id) === String(currentUserId));

  useEffect(() => {
    if (window.location.pathname.includes('profile') && !window.location.pathname.includes('user')) {
      setHasSaved(true);
    } else {
      const savedRegistry = JSON.parse(localStorage.getItem(`saved_node_${currentUserId}`)) || {};
      setHasSaved(!!savedRegistry[post._id]);
    }
  }, [post._id, currentUserId]);

  const handleShare = async (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Link copied! 🔗");
    } catch (err) {
      toast.error("Failed to copy link.");
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
      
      if (res.ok) {
        const savedRegistry = JSON.parse(localStorage.getItem(`saved_node_${currentUserId}`)) || {};
        const nextState = !hasSaved;
        
        if (nextState) {
          savedRegistry[post._id] = true;
          toast.success("Post saved successfully! 🔖");
        } else {
          delete savedRegistry[post._id];
          toast.success("Post removed from saved bookmarks.");
        }
        
        localStorage.setItem(`saved_node_${currentUserId}`, JSON.stringify(savedRegistry));
        setHasSaved(nextState);
        
        // 🔥 REMOVED THE WRONG onLike TRiGGER FROM HERE TO STOP THE RENDERING LOOP FLAG
      } else {
        toast.error(data.message || "Could not complete save action.");
      }
    } catch (err) {
      toast.error("Error processing save request.");
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
        if (typeof onUpdateComments === 'function') {
          onUpdateComments(post._id, updatedComments);
        }
        setCommentText('');
        toast.success("Comment added! 💬");
      }
    } catch (err) {
      toast.error("Comment submission failed.");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/post/${post._id}`)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-left overflow-hidden"
    >
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm tracking-wide shrink-0 overflow-hidden border ${
              isPagePost ? 'bg-slate-900 text-white border-slate-950' : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {!isPagePost && post.user?.avatar ? (
                <img src={post.user.avatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                getAvatarInitials(authorName)
              )}
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 text-[15px] leading-tight tracking-tight flex items-center gap-1.5">
                {authorName}
                {post.user?.role === 'official' && !isPagePost && (
                  <span className="bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider scale-90">Official</span>
                )}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {authorSubtext}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-slate-800 font-bold">{post.category || 'General'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
        
        <p className="text-slate-800 text-[15px] font-normal whitespace-pre-wrap leading-relaxed pt-0.5">
          {post.content}
        </p>
      </div>

      {post.image && (
        <div className="px-5 pb-4" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => setIsZoomed(true)}
            className="rounded-xl overflow-hidden border border-gray-100 bg-slate-50 max-h-[450px] flex items-center justify-center cursor-zoom-in group relative"
          >
            <img 
              src={post.image} 
              alt="Post attachment" 
              className="w-full h-auto max-h-[450px] object-contain transition-transform duration-200 group-hover:scale-[1.005]"
              loading="lazy"
            />
          </div>

          {isZoomed && (
            <div 
              className="fixed inset-0 bg-black/90 z-[9999] flex flex-col justify-center items-center p-4 cursor-zoom-out select-none"
              onClick={() => setIsZoomed(false)}
            >
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <button 
                  onClick={() => setIsZoomed(false)}
                  className="text-white bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-full transition-all border border-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <img 
                src={post.image} 
                alt="Enlarged visualization viewport" 
                className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {post.content && (
                <p className="text-gray-200 text-xs font-semibold mt-4 max-w-2xl text-center line-clamp-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
                  {post.content}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div 
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-slate-50/50 text-slate-500 font-medium text-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => typeof onLike === 'function' && onLike(post._id)} 
          className={`flex items-center gap-1.5 transition-colors duration-200 ${
            hasLiked ? 'text-red-500 font-bold' : 'hover:text-red-500 text-slate-500'
          }`}
        >
          <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <span>{post.likes?.length || 0}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>

        <button 
          onClick={handleShare} 
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
          <span>{isCopied ? "Copied" : "Share"}</span>
        </button>

        {!canDelete && (
          <button 
            onClick={handleSave} 
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              hasSaved ? 'text-blue-600 font-bold' : 'hover:text-blue-500 text-slate-500'
            }`}
          >
            <svg className="w-5 h-5" fill={hasSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            <span>{hasSaved ? "Saved" : "Save"}</span>
          </button>
        )}
      </div>

      {showComments && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/30 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                <span className="font-bold text-slate-900 text-xs block">{comment.user?.name || "User"}</span>
                <p className="text-slate-700 text-xs mt-0.5 whitespace-pre-wrap font-medium">{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-medium"
              required 
            />
            <button type="submit" className="text-slate-950 font-bold text-xs px-3 hover:text-slate-700 transition">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}