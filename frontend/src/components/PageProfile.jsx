import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';

export default function PageProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', bio: '' });

  const token = localStorage.getItem('token');

  // --- 🌟 HELPER: GET INITIALS FOR PAGE LOGO ---
  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // 1. Fetch current logged-in user (Admin check karne ke liye)
        const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resMe.ok) {
          setCurrentUser(await resMe.json());
        }

        // 2. Fetch Page Details
        const resPage = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resPage.ok) {
          const pageData = await resPage.json();
          setPage(pageData);
          setFormData({ name: pageData.name, category: pageData.category, bio: pageData.bio });
        } else {
          toast.error("Page not found!");
          navigate('/pages');
          return;
        }

        // 3. Fetch Posts and filter for this specific page
        const resPosts = await fetch(`${API_BASE_URL}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resPosts.ok) {
          const allPosts = await resPosts.json();
          // Filter: Sirf woh posts jinme post.page ID match kare
          setPosts(allPosts.filter(p => p.page && (String(p.page._id || p.page) === String(id))));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load page.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPageData();
  }, [id, token, navigate]);

  // Handle Edit Page Form Submission
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedPage = await res.json();
        setPage(updatedPage);
        setShowEditModal(false);
        toast.success("Page details updated!");
      } else {
        toast.error("Failed to update page.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  // Handle Follow / Unfollow Page
  const handleFollow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        // ✨ INSTANT UI UPDATE WITHOUT REFRESH ✨
        setPage(prevPage => {
          const isFollowing = prevPage.followers.includes(currentUser._id);
          const updatedFollowers = isFollowing
            ? prevPage.followers.filter(fId => fId !== currentUser._id) // Remove if unfollowing
            : [...prevPage.followers, currentUser._id];                 // Add if following
          
          return { ...prevPage, followers: updatedFollowers };
        });
        
        toast.success(data.msg);
      } else {
        toast.error("Action failed.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  // --- LOADING SKELETON ---
  if (loading || !page) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="h-32 bg-slate-800 rounded-t-lg"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-32 h-32 bg-gray-200 rounded-2xl border-4 border-white absolute -top-16 left-6"></div>
            <div className="pt-20 space-y-3">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <SkeletonPost />
      </div>
    );
  }

  // ✨ CHECK IF LOGGED IN USER IS THE OWNER OF THIS PAGE ✨
  // Schema ke hisaab se page.user me owner ki ID hoti hai
  const isAdmin = currentUser && page && (String(page.user?._id || page.user) === String(currentUser._id));

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-4 pb-12 relative px-4 md:px-0">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/pages')} 
        className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
      >
        ← Back to Pages
      </button>

      {/* --- EDIT MODAL (ONLY FOR ADMIN) --- */}
      {isAdmin && showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white pb-2 z-10">Edit Page Details</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded">
                  <option value="Coaching Institute">Coaching Institute</option>
                  <option value="Job Aggregator">Job Aggregator</option>
                  <option value="Official Department">Official Department</option>
                  <option value="Individual Educator">Individual Educator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-2 border rounded h-24"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-white pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Cover Photo */}
        <div className="h-32 bg-slate-800 relative">
          {/* Admin Edit Cover Button (Visual only for now) */}
          {isAdmin && (
            <button onClick={() => setShowEditModal(true)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-blue-600 shadow hover:bg-gray-100 transition" title="Edit Page Details">
              ✏️
            </button>
          )}
        </div> 
        
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end">
            <div className="w-32 h-32 bg-purple-100 text-purple-800 rounded-2xl border-4 border-white absolute -top-16 left-6 shadow-sm flex items-center justify-center text-4xl font-extrabold tracking-wide z-10">
              {getInitials(page.name)}
            </div> 
            
            {/* Follow/Admin Action Button */}
            <div className="pt-4 ml-auto">
              {isAdmin ? (
                <button onClick={() => setShowEditModal(true)} className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-md text-sm font-bold hover:bg-blue-50 transition">
                  Manage Page
                </button>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`px-5 py-1.5 rounded-md text-sm font-bold transition ${
                    page.followers?.includes(currentUser?._id)
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {page.followers?.includes(currentUser?._id) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
          
          <div className="pt-6 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold mt-1 inline-block uppercase tracking-wide">
              {page.category}
            </span>
            <p className="text-sm text-gray-500 mt-2 font-medium">{page.followers?.length || 0} followers</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{page.bio || 'No description provided.'}</p>
      </div>

      {/* Page Posts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex border-b mb-6">
          <button className="pb-3 px-4 font-semibold transition text-sm text-blue-600 border-b-2 border-blue-600">
            📢 Official Notices & Updates
          </button>
        </div>
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 text-purple-800 rounded flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {getInitials(page.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm hover:text-blue-600 cursor-pointer">{page.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{page.category}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content || post.title}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-700">No official updates yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}