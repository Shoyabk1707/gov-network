import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import SkeletonNetworkCard from './SkeletonNetworkCard';

export default function Network({ onViewProfile }) { 
  const [users, setUsers] = useState([]);
  
  // State to track which buttons we've clicked during this session
  const [followedUsers, setFollowedUsers] = useState([]);
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');

  // --- 🌟 HELPER: GET INITIALS FOR AVATAR ---
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    fetchDiscoverUsers();
  }, []);

  const fetchDiscoverUsers = async () => {
    try {
      // 1. Fetch the currently logged-in user to see their existing connections
      const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await resMe.ok ? await resMe.json() : null;

      if (meData) {
        // Pre-fill the followed buttons using the actual database!
        setFollowedUsers(meData.following || []);
      }

      // 2. Fetch the list of users to discover
      const res = await fetch(`${API_BASE_URL}/api/network/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok && meData) {
        const data = await res.json();
        setUsers(data);

        // 3. Pre-fill the requested guidance buttons
        const alreadyRequested = [];
        data.forEach(user => {
          const requested = user.mentorshipRequests?.some(
            req => String(req.fromUser) === String(meData._id)
          );
          if (requested) alreadyRequested.push(user._id);
        });
        setRequestedUsers(alreadyRequested);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // API call pass ho ya fail, loading band kar do
      setLoading(false);
    }
  };

  const handleFollow = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/follow/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Instantly update the UI without reloading
        setFollowedUsers(prev => [...prev, id]); 
      } else {
        alert(`⚠️ ${data.msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestGuidance = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/request-guidance/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: "I would like to request your professional guidance." })
      });
      const data = await res.json();
      if (res.ok) {
        // Instantly update the UI without reloading
        setRequestedUsers(prev => [...prev, id]);
      } else {
        alert(`⚠️ ${data.msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Discover Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
          <SkeletonNetworkCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Discover Connections</h1>
      
      {users.length === 0 ? (
        <p className="text-gray-500">No users found to connect with.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              
              {/* ✨ DYNAMIC AVATAR ✨ */}
              <div className="w-16 h-16 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full mx-auto mb-4 text-2xl font-bold tracking-wide">
                {getInitials(u.name)}
              </div>
              
              <h2 className="font-bold text-lg text-gray-900">{u.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{u.tagline || 'GovNetwork Member'}</p>
              
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-5 ${
                u.role === 'official' ? 'bg-blue-100 text-blue-800' : 
                u.role === 'creator' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {u.role.toUpperCase()}
              </span>

              <div className="mb-4">
                <button onClick={() => onViewProfile(u._id)} className="text-blue-600 hover:underline text-sm font-medium">
                    View Full Profile
                </button>
              </div>
              
              <div className="flex flex-col gap-2 px-4">
                {/* DYNAMIC FOLLOW BUTTON */}
                {followedUsers.includes(u._id) ? (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded text-sm font-medium cursor-not-allowed border border-gray-200">
                    Following
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFollow(u._id)}
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition"
                  >
                    Follow
                  </button>
                )}
                
                {/* DYNAMIC GUIDANCE BUTTON */}
                {u.role === 'official' && (
                  requestedUsers.includes(u._id) ? (
                     <button disabled className="w-full py-2 border border-gray-200 text-gray-400 rounded bg-gray-50 text-sm font-medium cursor-not-allowed">
                      Guidance Requested
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRequestGuidance(u._id)}
                      className="w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium transition"
                    >
                      Request Guidance
                    </button>
                  )
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}