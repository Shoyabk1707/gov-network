import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const token = localStorage.getItem('token');

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
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Handle publishing a new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category })
      });
      if (res.ok) {
        setTitle(''); setContent('');
        fetchPosts(); // Refresh timeline instantly
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPosts(); // Refresh timeline to update count
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      {/* Create Post Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
        <h3 className="text-lg font-bold text-gray-700">Broadcast an Official Notice</h3>
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
        {posts.map(post => (
          <div key={post._id} className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{post.title}</h4>
                <p className="text-xs text-gray-500">By {post.user?.name} ({post.user?.jobTitle}) • {post.user?.department}</p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{post.category}</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-line">{post.content}</p>
            <div className="mt-4 pt-3 border-t flex items-center">
              <button 
                onClick={() => handleLike(post._id)}
                className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition space-x-1"
              >
                <span>👍</span>
                <span>{post.likes?.length || 0} Likes</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}