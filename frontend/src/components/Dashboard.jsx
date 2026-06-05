import { useState, useEffect } from 'react';
import Feed from './Feed';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          onLogout(); // Log out if token is invalid
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, [onLogout]);

if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        {/* 1. Dashboard Profile Card Skeleton */}
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md flex flex-col items-center animate-pulse mb-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div> {/* Welcome Name */}
          <div className="h-5 bg-blue-200 rounded w-1/2 mb-3"></div> {/* Job Title */}
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div> {/* Department */}
          <div className="w-full border-t pt-4 flex flex-col items-center">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div> {/* Email */}
          </div>
        </div>

        {/* 2. Feed Posts Skeleton (Neeche ka space fill karne ke liye) */}
        <div className="max-w-3xl mx-auto px-4">
          <SkeletonPost />
          <SkeletonPost />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Profile Card */}
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome, {user.name}!</h2>
        <p className="text-blue-600 font-semibold mb-1">Title : {user.jobTitle}</p>
        <p className="text-gray-500 text-sm mb-6">Department : {user.department}</p>
        <div className="border-t pt-4">
          <p className="text-xs text-gray-400 mb-4">Official Email: {user.email}</p>
          {/*<button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-semibold">
            Logout
          </button>*/}
        </div>
      </div>

      {/* Shared Timeline Feed */}
      <Feed />
    </div>
  );
}