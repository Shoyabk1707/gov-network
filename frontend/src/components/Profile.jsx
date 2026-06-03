import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const token = localStorage.getItem('token');

  const fetchProfileData = async () => {
    try {
      // Fetch Profile
      const resProfile = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resProfile.ok) setUser(await resProfile.json());

      // Fetch User's Posts (Activity)
      const resPosts = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPosts.ok) {
        const allPosts = await resPosts.json();
        // Filter only posts made by this user
        setUserPosts(allPosts.filter(post => post.user === user?._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?._id]);

  if (!user) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4 pb-12">
      
      {/* 1. TOP SECTION: Intro & Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-slate-800"></div> {/* Cover Photo Placeholder */}
        <div className="px-6 pb-6 relative">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-white -mt-16 bg-gray-300"></div> {/* Avatar */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-700 mt-1">{user.tagline || user.jobTitle}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user.city || 'Kota'}, {user.state || 'Rajasthan'}, India • <a href="#" className="text-blue-600 hover:underline">Contact info</a>
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium hover:bg-blue-700">Open to</button>
            <button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-full font-medium hover:bg-blue-50">Add section</button>
            <button className="border border-gray-500 text-gray-600 px-4 py-1.5 rounded-full font-medium hover:bg-gray-100">Enhance profile</button>
          </div>
        </div>
      </div>

      {/* 2. ABOUT SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">About</h2>
          <button className="text-gray-500 hover:text-gray-700">✏️</button>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {user.bio || 'Add a summary about your professional background.'}
        </p>
        {user.skills && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold">Top skills</p>
            <p className="text-sm text-gray-600 mt-1">{user.skills}</p>
          </div>
        )}
      </div>

      {/* 3. ACTIVITY SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Activity</h2>
          <button className="border border-blue-600 text-blue-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50">Create a post</button>
        </div>
        {userPosts.length > 0 ? (
          <div className="space-y-3">
            {userPosts.slice(0, 2).map(post => (
              <div key={post._id} className="text-sm text-gray-700 border-b pb-2">
                <span className="font-semibold">{user.name}</span> posted: {post.content || post.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You haven't posted anything yet.</p>
        )}
      </div>

      {/* 4. EXPERIENCE SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          <div className="flex gap-4 text-gray-500">
            <button className="hover:text-gray-700">➕</button>
            <button className="hover:text-gray-700">✏️</button>
          </div>
        </div>
        {user.experience && user.experience.length > 0 ? (
          user.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-sm text-gray-700">{exp.company}</p>
              <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Add your work experience here.</p>
        )}
      </div>

      {/* 5. EDUCATION SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          <div className="flex gap-4 text-gray-500">
            <button className="hover:text-gray-700">➕</button>
            <button className="hover:text-gray-700">✏️</button>
          </div>
        </div>
        {user.education && user.education.length > 0 ? (
          user.education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-sm text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
            </div>
          ))
        ) : (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Example University</h3>
            <p className="text-sm text-gray-700">B.Tech Computer Science and Engineering</p>
            <p className="text-sm text-gray-500">Add your educational background.</p>
          </div>
        )}
      </div>

    </div>
  );
}