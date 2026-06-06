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
  const tabs = ['All', 'Job Updates', 'Networking', 'Study Resources'];
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
      if (res.ok) fetchPosts(); // Re-fetch to get updated likes
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FILTER LOGIC
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Job Updates' && post.category === 'Official Circular') return true;
    if (activeTab === 'Networking' && post.category === 'Networking') return true;
    if (activeTab === 'Study Resources' && post.category === 'Study Resources') return true;
    return post.category === activeTab; 
  });
  
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Naya Component 1 */}
      <PostComposer onPostSuccess={(newPost) => setPosts([newPost, ...posts])} />

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === tab ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loading ? (
          <><SkeletonPost /><SkeletonPost /></>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow-sm border border-gray-200">
            No updates found. Be the first to post!
          </div>
        ) : (
          filteredPosts.map(post => (
            // Naya Component 2
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