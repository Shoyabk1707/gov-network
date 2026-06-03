import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', department: '', jobTitle: '', bio: '', skills: ''
  });

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormData({
          name: data.name || '',
          department: data.department || '',
          jobTitle: data.jobTitle || '',
          bio: data.bio || '',
          skills: data.skills || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsEditing(false);
        fetchProfile(); 
      }
    } catch (err) {
      console.error('Update failed');
    }
  };

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Full Name" required />
          <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Department" />
          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Job Title" />
          <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Short Bio"></textarea>
          <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Skills (e.g., React, Node, Marketing)" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Changes</button>
        </form>
      ) : (
        <div className="space-y-4">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Job Title:</strong> {user.jobTitle}</p>
          <p><strong>Bio:</strong> {user.bio || 'No bio added yet.'}</p>
          <p><strong>Skills:</strong> {user.skills || 'No skills added yet.'}</p>
        </div>
      )}
    </div>
  );
}