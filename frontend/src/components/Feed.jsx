import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import SkeletonPost from './SkeletonPost';
import PostComposer from './PostComposer';
import PostCard from './PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // ✨ UPDATED: Pure platform ke liye simplified unified tabs list
  const tabs = ['All', 'General', 'Exam update', 'Study material'];
  const token = localStorage.getItem('token');

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts((prev) => prev.filter(post => post._id !== postId));
        toast.success("Deleted successfully!");
      }
    } catch (err) {
      toast.error("Network error.");
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

  // 🔥 UPDATED FILTER LOGIC: Exact database schema values matching system
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'All') return true;
    
    const postCategory = post.category || 'General';
    return postCategory.trim().toLowerCase() === activeTab.trim().toLowerCase();
  });
  
  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Post Creator Box */}
      <PostComposer onPostSuccess={(newPost) => setPosts([newPost, ...posts])} />

      {/* Dynamic Tabs Panel */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Live Stream List */}
      <div className="space-y-4">
        {loading ? (
          <><SkeletonPost /><SkeletonPost /></>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 text-xs font-medium py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            No updates found under "{activeTab}" yet. Be the first to post!
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onDelete={handleDelete} 
              onLike={handleLike}
              onUpdateComments={(id, newComments) => {
                setPosts(prev => prev.map(p => p._id === id ? { ...p, comments: newComments } : p));
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}