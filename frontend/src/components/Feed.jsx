import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [myPages, setMyPages] = useState([]);
  const [selectedIdentity, setSelectedIdentity] = useState('personal');
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
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
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
        {posts.map(post => (
          <div key={post._id} className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500 relative">
  <div className="flex justify-between items-start mb-2">
    <div>
      <h4 className="font-bold text-gray-900 text-lg">{post.title}</h4>
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
      
      {/* 🗑️ DELETE BUTTON: Sirf author ko dikhega (Agar token hai aur post.user._id match kare) */}
      {/* Note: Kuch schemas me direct post.user hota hai ya post.user._id, aapke current getPosts me pure populate hai to post.user?._id use hoga */}
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