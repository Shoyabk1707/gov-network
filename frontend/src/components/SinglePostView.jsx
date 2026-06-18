import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

function SinglePostView() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const token = localStorage.getItem('token');

  // Token decode layer
  let currentUserId = null;
  try {
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenPayload = JSON.parse(window.atob(base64));
      currentUserId = tokenPayload?._id || tokenPayload?.id;
    }
  } catch (err) {
    console.error("Token decoding fault:", err);
  }

  const fetchSinglePost = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, { headers });
      
      if (!res.ok) {
        throw new Error("Notice not found or deleted by admin.");
      }
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error("Single Post Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSinglePost();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-red-50 p-6 rounded-2xl text-center border border-red-200">
        <p className="text-red-600 font-semibold">⚠️ {error || "Notice not found"}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition">
          Go Back to Feed
        </button>
      </div>
    );
  }

  // ✨ SECURE OBJECT EXTRACTION: Safeguard logic for Page vs User post mappings
  const isPagePost = post.page !== null && post.page !== undefined;
  const authorName = isPagePost ? post.page?.name : post.user?.name || "User Node";
  const authorSubtext = isPagePost 
    ? `${post.page?.category === 'Coaching Institute' ? 'Institute Update' : 'Content Creator'}`
    : post.user?.jobTitle || "Member";

  const getAvatarInitials = (nameString) => {
    if (!nameString) return "KB";
    const clean = nameString.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  // 🔥 FIXES USER ROUTING REDIRECTIONS ALWAYS
  const handleAuthorClick = () => {
    if (isPagePost) {
      const pageId = post.page?._id || post.page;
      if (pageId) navigate(`/page/${pageId}`);
    } else {
      // Extract target string ID safely from populated object or direct field
      const authorId = post.user?._id || post.user;
      const parsedCurrentUserId = String(currentUserId || '');
      const parsedAuthorId = String(authorId || '');

      if (!parsedAuthorId) {
        toast.error("User identity not found.");
        return;
      }

      if (parsedAuthorId === parsedCurrentUserId) {
        navigate('/profile');
      } else {
        navigate(`/user/${parsedAuthorId}`);
      }
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSinglePost();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Link copied! 🔗");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: commentText.trim() })
      });

      if (res.ok) {
        const updatedCommentsArray = await res.json();
        setPost(prev => ({ ...prev, comments: updatedCommentsArray }));
        commentText('');
        toast.success("Comment added! 💬");
      } else {
        toast.error("Failed to submit reply.");
      }
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  const hasLiked = post.likes && post.likes.some(id => String(id) === String(currentUserId));

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 text-left">
      <Helmet>          
        <meta property="og:description" content={post.content ? post.content.substring(0, 120) + '...' : 'Check out this notice on GovNetwork'} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <button 
        onClick={() => navigate('/')} 
        className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
      >
        ← Back to Main Network
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
        
        <div className="p-5 pb-3 flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={handleAuthorClick}
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm tracking-wide shrink-0 cursor-pointer ${
                isPagePost ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {getAvatarInitials(authorName)}
            </div>
            
            <div>
              <h4 
                onClick={handleAuthorClick}
                className="font-bold text-slate-900 text-[15px] leading-tight tracking-tight hover:text-blue-600 cursor-pointer transition-colors"
              >
                {authorName}
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
        </div>

        <div className="px-5 pb-5">
          <p className="text-slate-800 text-[15px] font-normal whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        <div className="flex items-center gap-6 px-5 py-3 border-t border-gray-100 bg-slate-50/50 text-slate-500 font-medium text-xs">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
          >
            <svg className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span>{post.likes?.length || 0} Likes</span>
          </button>

          <button 
            onClick={handleShare} 
            className="flex items-center gap-1.5 hover:text-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            <span>{isCopied ? "Copied" : "Share link"}</span>
          </button>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Discussion ({post.comments?.length || 0})
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="bg-white p-3 rounded-xl border border-slate-150 text-xs shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">
                      {comment.user?.name || "Anonymous User"} 
                      <span className="text-slate-400 font-medium ml-1">
                        ({comment.user?.jobTitle || "Aspirant"})
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line mt-1 font-normal leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                No dynamic replies yet.
              </p>
            )}
          </div>

          {token ? (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
              <input 
                type="text" 
                placeholder="Share your response or reply..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                required 
              />
              <button 
                type="submit" 
                className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
              >
                Comment
              </button>
            </form>
          ) : (
            <p className="text-xs text-center text-slate-400 bg-white p-3 rounded-xl border border-dashed border-slate-200 font-medium">
              🔒 Link through WhatsApp open huyi hai. Reply karne ke liye please account login karein.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default SinglePostView;