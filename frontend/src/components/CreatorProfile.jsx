import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function CreatorProfile({ userId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      console.log("🕵️ 1. Fetching Profile for ID:", userId); 
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/network/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("🕵️ 2. Backend Status Code:", res.status); 

        if (res.ok) {
          const fetchedData = await res.json();
          console.log("🕵️ 3. Success! Data received:", fetchedData);
          setData(fetchedData);
        } else {
          const errorData = await res.text();
          console.log("🕵️ 3. Backend Error Message:", errorData);
        }
      } catch (err) {
        console.error("🕵️ Fetch completely failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [userId]);

  if (loading) return <div className="text-center p-10 text-gray-500">Loading Profile...</div>;
  if (!data || !data.profile) return <div className="text-center p-10 text-red-500">Profile not found.</div>;

  const { profile, posts } = data;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      {/* Back Button */}
      <button onClick={onBack} className="text-blue-600 hover:underline mb-6 flex items-center gap-2 font-medium">
        ← Back to Network
      </button>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8 text-center">
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
        <p className="text-gray-500 mt-1">{profile.tagline || profile.department || 'GovNetwork Member'}</p>
        
        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
          profile.role === 'official' ? 'bg-blue-100 text-blue-800' : 
          profile.role === 'creator' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
        }`}>
          {profile.role.toUpperCase()}
        </span>
      </div>

      {/* Creator's Posts Feed */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Posts by {profile.name}</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          No posts published yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1 inline-block mb-3">
                {post.category || 'Update'}
              </span>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}