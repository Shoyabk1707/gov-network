import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import SkeletonPost from './SkeletonPost';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [myPages, setMyPages] = useState([]);
  const [selectedIdentity, setSelectedIdentity] = useState('personal');
  const token = localStorage.getItem('token');
  const [commentText, setCommentText] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null); 
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // Fetch all posts from backend
  // Fetch all posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      // 🚀 YAHAN LOADING BAND KARNI HAI
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const fetchMyPages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/pages/my-pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyPages(data);
        }
      } catch (err) {
        console.error("Error loading pages for selector:", err);
      }
    };
    fetchMyPages();
  }, []);

  // Handle publishing a new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          title,
          content,
          category,
          pageId: selectedIdentity === 'personal' ? null : selectedIdentity 
        }) 
      });
      
      if (res.ok) {
    const newPostData = await res.json(); 
    console.log("🔥 FRONTEND RECEIVED THIS NEW POST DATA:", newPostData);

    setPosts((prevPosts) => [newPostData, ...prevPosts]);

    setTitle(''); 
    setContent('');
    setSelectedIdentity('personal'); 
    }
    } catch (err) {
      console.error(err);
    }
  };
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPosts(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // 🔥 INSTANT LOCAL UPDATE: State se us post ko hata do bina refresh kiye
        setPosts((prevPosts) => prevPosts.filter(post => post._id !== postId));
        
        // ✨ NAYA: Success Toast
        toast.success("Notice deleted successfully! 🗑️");
      } else {
        toast.error("Failed to delete notice.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      // 🔴 UPDATE: Catch block me bhi error dikhao
      toast.error("Network error while deleting.");
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const textStr = commentText[postId]?.trim();
    if (!textStr) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: textStr })
      });

      if (res.ok) {
        const updatedCommentsArray = await res.json();

        // 🔥 INSTANT RE-RENDER: Find the post locally and update its comments array instantly
        setPosts((prevPosts) => 
          prevPosts.map(post => 
            post._id === postId ? { ...post, comments: updatedCommentsArray } : post
          )
        );

        // Clear the input box for this specific post
        setCommentText(prev => ({ ...prev, [postId]: '' }));

        // ✨ NAYA: Success Toast (Optional but gives good feel)
        toast.success("Comment added! 💬");
      } else {
        toast.error("Failed to add comment.");
      }
    } catch (err) {
      console.error("Comment submit error:", err);
      // 🔴 UPDATE: Catch block me bhi error dikhao
      toast.error("Network error while commenting.");
    }
  };

  const handleShare = async (post) => {
    // Generate a clean post URL based on your deployment or localhost URL
    const postUrl = `${window.location.origin}/post/${post._id}`;
    
    // Title & text payload for sharing
    const shareData = {
      title: post.title || 'Check out this notice!',
      text: post.content ? `${post.content.substring(0, 100)}...` : '',
      url: postUrl
    };

    // 1. Mobile Premium Feel: If Native Web Share API is available, use it!
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return; // Native share opened successfully
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Native share failed, falling back to clipboard:", err);
        }
      }
    }

    // 2. Universal Fallboard: Agar desktop browser hai ya native share fail hua, toh link clipboard me copy karo
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopiedPostId(post._id);
      setTimeout(() => setCopiedPostId(null), 2000);
      toast.success("Link copied to clipboard! 🔗");
    } catch (err) {
      console.error("Could not copy text to clipboard: ", err);
      toast.error("Failed to copy link.");
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 🚀 THE FIX: Data ko nikalna padega pehle!
      const data = await res.json(); 

      if (res.ok) {
        toast.success(data.message); 
      } else {
        toast.error(data.message || "Failed to save post.");
      }
    } catch (err) {
      console.error("Save Post Error:", err);
      // Catch me bhi toast laga do taaki error chup na jaye
      toast.error("Network error while saving."); 
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      {/* Create Post Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
        <h3 className="text-lg font-bold text-gray-700">Broadcast an Official Notice</h3>
        
        {/* Identity Selector Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Post As
          </label>
          <select
            value={selectedIdentity}
            onChange={(e) => setSelectedIdentity(e.target.value)}
            className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personal">👤 My Personal Profile</option>
            {myPages.map(page => (
              <option key={page._id} value={page._id}>
                🏢 {page.name} ({page.category})
              </option>
            ))}
          </select>
        </div>

        <input type="text" placeholder="Notice Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded text-sm" required />
        <textarea placeholder="Write official communication here..." value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded text-sm h-20" required />
        <div className="flex justify-between items-center">
          <select value={category} onChange={e => setCategory(e.target.value)} className="p-1.5 border rounded text-sm text-gray-600 bg-gray-50">
            <option value="General">General</option>
            <option value="Official Circular">Official Circular</option>
            <option value="Urgent Update">Urgent Update</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">Publish</button>
        </div>
      </form>

      {/* Timeline Feed */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow border border-gray-200">
            No notices published yet. Be the first to broadcast!
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500 relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="font-bold text-gray-900 text-lg cursor-pointer hover:text-blue-600 hover:underline transition"
                    title="Click to view full discussion"
                    >
                    {post.title}
                  </h4>
                  {post.page ? (
                    <p className="text-xs font-bold text-purple-700 flex items-center gap-1 mt-0.5">
                      🏢 {post.page.name} <span className="text-gray-400 font-normal">({post.page.category})</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      By {post.user?.name} ({post.user?.jobTitle}) • {post.user?.department}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{post.category}</span>
                  
                  {/* 🗑️ DELETE BUTTON */}
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="text-gray-400 hover:text-red-500 transition text-sm p-1"
                    title="Delete Notice"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm whitespace-pre-line">{post.content}</p>
              
              {/* --- ACTION BUTTONS --- */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button onClick={() => handleLike(post._id)} className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition space-x-1">
                        <span>👍</span><span>{post.likes?.length || 0} Likes</span>
                    </button>
                    <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition space-x-1">
                        <span>💬</span><span>{post.comments?.length || 0} Comments</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition space-x-1" title="Share Notice">
                        <span>🔗</span><span>{copiedPostId === post._id ? "Copied!" : "Share"}</span>
                    </button>
                  </div>

                  <button onClick={() => handleSave(post._id)} className="flex items-center text-sm font-semibold text-gray-500 hover:text-yellow-600 transition space-x-1" title="Save for later">
                    <span>🔖</span><span>Save</span>
                  </button>
              </div>

              {/* --- COLLAPSIBLE ACCORDION COMMENT SECTION --- */}
              {activeCommentPost === post._id && (
                <div className="mt-4 pt-4 border-t bg-gray-50 p-3 rounded-lg space-y-3 transition-all">
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment._id} className="bg-white p-2.5 rounded border text-xs shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-800">
                              👤 {comment.user?.name || "Unknown User"} 
                              <span className="text-gray-400 font-normal ml-1">
                                ({comment.user?.jobTitle || "Member"})
                              </span>
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-2">No comments yet. Be the first to start the discussion!</p>
                    )}
                  </div>

                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-2 mt-2">
                    <input 
                      type="text" 
                      placeholder="Write a professional reply..." 
                      value={commentText[post._id] || ''} 
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                      className="flex-1 p-2 border rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required 
                    />
                    <button 
                      type="submit" 
                      className="bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Reply
                    </button>
                  </form>

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}