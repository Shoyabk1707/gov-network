import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function ManagePages({ onBack }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coaching Institute');
  const [bio, setBio] = useState('');
  const [showForm, setShowForm] = useState(false);

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
    console.log("🚀 1. Sending Page Data to Backend:", { name, category, bio });

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

      console.log("📡 2. Response Status Received:", res.status);

      if (res.ok) {
        const newPage = await res.json();
        console.log("✅ 3. Success! New Page Created:", newPage);
        setPages([...pages, newPage]); 
        setName('');
        setBio('');
        setShowForm(false); 
      } else {
        const errorText = await res.text();
        console.error("❌ 3. Backend Rejected Request:", errorText);
        toast.error(`Backend Error! Status Code: ${res.status}\nMessage: ${errorText || 'Check server logs'}`);
      }
    } catch (err) {
      console.error("💥 3. Network Connection Failed:", err);
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
        <div>Loading your pages...</div>
      ) : pages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          You don't own or manage any pages yet. Click "+ Create a Page" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map(page => (
            <div key={page._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{page.name}</h3>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                  {page.category}
                </span>
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">{page.bio || 'No description provided.'}</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                <span>{page.followers?.length || 0} Followers</span>
                <button className="text-blue-600 hover:underline font-medium">Open Admin View →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}