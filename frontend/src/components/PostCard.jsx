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

  const handleShare = async () => {
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

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/save`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      res.ok ? toast.success(data.message) : toast.error(data.message);
    } catch (err) {
      toast.error("Error saving post.");
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
        onUpdateComments(post._id, updatedComments); // Update local state in Feed
        setCommentText('');
        toast.success("Comment added! 💬");
      }
    } catch (err) {
      toast.error("Error adding comment.");
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 transition hover:shadow-md cursor-pointer" onClick={() => navigate(`/post/${post._id}`)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            {post.page ? "🏢" : "👤"}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-[15px] flex items-center gap-1">
              {post.page ? post.page.name : post.user?.name}
              {post.user?.role === 'official' && <span className="bg-blue-800 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">Official</span>}
            </h4>
            <p className="text-xs text-gray-500">
              {post.page ? "Institute Update" : `${post.user?.jobTitle || 'Member'} • ${post.category}`}
            </p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(post._id); }} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
          🗑️
        </button>
      </div>
      
      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed mt-2">{post.content}</p>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-6">
          <button onClick={() => onLike(post._id)} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition gap-1.5 group">
            <span className="group-hover:scale-110 transition-transform">👍</span><span>{post.likes?.length || 0}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition gap-1.5 group">
            <span className="group-hover:scale-110 transition-transform">💬</span><span>{post.comments?.length || 0}</span>
          </button>
          <button onClick={handleShare} className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition gap-1.5 group">
            <span className="group-hover:scale-110 transition-transform">🔗</span><span className="hidden sm:inline">{isCopied ? "Copied" : "Share"}</span>
          </button>
        </div>
        <button onClick={handleSave} className="flex items-center text-sm font-medium text-gray-500 hover:text-yellow-600 transition gap-1.5 group">
          <span className="group-hover:scale-110 transition-transform">🔖</span><span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="bg-gray-50 p-3 rounded-xl text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900 text-xs">{comment.user?.name || "User"}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line text-xs">{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-3">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 p-2 rounded-full text-xs focus:outline-none focus:border-blue-500"
              required 
            />
            <button type="submit" className="text-blue-600 font-bold text-xs px-2">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}