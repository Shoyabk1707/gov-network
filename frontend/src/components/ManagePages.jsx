import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPageCard from './SkeletonPageCard';
import toast from 'react-hot-toast';

export default function ManagePages({ onBack }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coaching Institute');
  const [bio, setBio] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const navigate = useNavigate();

  // --- 🌟 HELPER: GET INITIALS FOR PAGE LOGO ---
  const getInitials = (pageName) => {
    if (!pageName) return "P";
    const parts = pageName.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  // 1. Fetch user's managed pages
  useEffect(() => {
    const fetchMyPages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/pages/my-pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPages(data);
        }
      } catch (err) {
        console.error("Error fetching pages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPages();
  }, []);

  // 2. Handle creating a new page
  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, category, bio })
      });

      if (res.ok) {
        const newPage = await res.json();
        setPages([...pages, newPage]); 
        setName('');
        setBio('');
        setShowForm(false);
        toast.success("Page created successfully!");
      } else {
        const errorText = await res.text();
        toast.error(`Backend Error: ${errorText}`);
      }
    } catch (err) {
      alert("Network error: Could not reach the backend server.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <button onClick={onBack} className="text-blue-600 hover:underline mb-6 flex items-center gap-2 font-medium">
        ← Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Your Pages</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Create a Page'}
        </button>
      </div>

      {/* Create Page Form */}
      {showForm && (
        <form onSubmit={handleCreatePage} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-800">New Institute / Brand Page</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded" placeholder="e.g., Kota Tech Academy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded">
              <option value="Coaching Institute">Coaching Institute</option>
              <option value="Job Aggregator">Job Aggregator</option>
              <option value="Official Department">Official Department</option>
              <option value="Individual Educator">Individual Educator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border p-2 rounded" rows="3" placeholder="Describe your institute or brand..."></textarea>
          </div>
          <button type="submit" className="bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">Create Page</button>
        </form>
      )}

      {/* Pages List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonPageCard />
          <SkeletonPageCard />
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          You don't own or manage any pages yet. Click "+ Create a Page" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map(page => (
            <div 
              key={page._id} 
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/page/${page._id}`)}
              title="Click to view Page Profile"
            >
              <div>
                <div className="flex gap-3 items-start mb-3">
                  {/* ✨ DYNAMIC PAGE LOGO (Initials) ✨ */}
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {getInitials(page.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{page.name}</h3>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold mt-1 inline-block uppercase tracking-wide">
                      {page.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{page.bio || 'No description provided.'}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium">{page.followers?.length || 0} Followers</span>
                <span className="text-blue-600 hover:underline font-semibold">View Page →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}