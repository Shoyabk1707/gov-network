import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [results, setResults] = useState({ users: [], posts: [], pages: [] });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query, token]);

  

 {/* if (loading) return <div className="text-center py-10 text-gray-500 mt-10">Searching across GovNetwork...</div>; */}

 if (loading) return (
  <div className="max-w-3xl mx-auto mt-6 px-4 space-y-4">
    <SkeletonPost />
    <SkeletonPost />
    <SkeletonPost />
  </div>
);

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Search results for "{query}"
      </h2>

      {/* 🔖 TABS */}
      <div className="flex border-b mb-6 space-x-2">
        {['posts', 'people', 'pages'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-5 font-semibold capitalize transition duration-200 text-sm rounded-t-lg ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 📋 RESULTS LIST */}
      <div className="space-y-4 mb-10">
        
        {/* --- POSTS TAB --- */}
        {activeTab === 'posts' && (
          results.posts.length > 0 ? (
            results.posts.map(post => (
              <div key={post._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/post/${post._id}`)}>
                <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  By {post.user?.name} {post.page ? `in ${post.page.name}` : ''}
                </p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{post.content}</p>
              </div>
            ))
          ) : <p className="text-gray-500 text-center py-10">No posts found.</p>
        )}

        {/* --- PEOPLE TAB --- */}
        {activeTab === 'people' && (
          results.users.length > 0 ? (
            results.users.map(user => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/creator/${user._id}`)}>
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500">{user.tagline || user.jobTitle}</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/creator/${user._id}`)} className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1 rounded-full hover:bg-blue-50 transition">
                  View
                </button>
              </div>
            ))
          ) : <p className="text-gray-500 text-center py-10">No people found.</p>
        )}

        {/* --- PAGES TAB --- */}
        {activeTab === 'pages' && (
          results.pages.length > 0 ? (
            results.pages.map(page => (
              <div key={page._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center font-bold text-xl">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.name}</h3>
                    <p className="text-xs text-gray-500">{page.category}</p>
                  </div>
                </div>
              </div>
            ))
          ) : <p className="text-gray-500 text-center py-10">No pages found.</p>
        )}

      </div>
    </div>
  );
}