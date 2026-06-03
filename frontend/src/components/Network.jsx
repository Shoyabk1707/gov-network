import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Network() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDiscoverUsers();
  }, []);

  const fetchDiscoverUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/network/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
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
        alert('Successfully followed!');
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
        alert('Guidance request sent!');
      } else {
        alert(`⚠️ ${data.msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Discover Connections</h1>
      
      {users.length === 0 ? (
        <p className="text-gray-500">No users found to connect with.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
              
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <h2 className="font-bold text-lg text-gray-900">{u.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{u.tagline || 'GovNetwork Member'}</p>
              
              {/* Role Badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-5 ${
                u.role === 'official' ? 'bg-blue-100 text-blue-800' : 
                u.role === 'creator' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {u.role.toUpperCase()}
              </span>
              
              <div className="flex flex-col gap-2 px-4">
                <button 
                  onClick={() => handleFollow(u._id)}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition"
                >
                  Follow
                </button>
                
                {/* Only show Guidance button for Officials */}
                {u.role === 'official' && (
                  <button 
                    onClick={() => handleRequestGuidance(u._id)}
                    className="w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium transition"
                  >
                    Request Guidance
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}