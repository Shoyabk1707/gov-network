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

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'All') return true;
    const postCategory = post.category || 'General';
    return postCategory.trim().toLowerCase() === activeTab.trim().toLowerCase();
  });
  
  return (
    // 🚀 LINKEDIN TIGHT GRID: Reduced parent spaces from space-y-6 down to tight mobile margin flows
    <div className="space-y-2 md:space-y-3 animate-fadeIn text-left w-full">
      
      {/* Post Creator Box */}
      <PostComposer onPostSuccess={(newPost) => setPosts([newPost, ...posts])} />

      {/* Dynamic Tabs Panel: Trimmed padding down to 1px and corner layout into static rounded-md */}
      <div className="flex bg-white p-2 rounded-md border border-gray-200 shadow-xs overflow-x-auto hide-scrollbar mx-0 md:mx-0">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Live Stream List: Tight gap spacing mirroring the mobile LinkedIn timeline view */}
      <div className="space-y-2 w-full">
        {loading ? (
          <><SkeletonPost /><SkeletonPost /></>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 text-xs font-medium py-10 bg-white rounded-md shadow-xs border border-gray-200">
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