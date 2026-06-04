import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SinglePostView() {
  const { id } = useParams(); // URL se post ID extract karega -> /post/:id
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  const token = localStorage.getItem('token');
  const API_BASE_URL = "https://gov-network-backend.vercel.app"; // Apne exact backend domain se match kar lena bhai

  // 📡 FETCH THE SINGLE TARGETED POST
// 📡 FETCH THE SINGLE TARGETED POST
  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, { headers });
        
        if (!res.ok) {
          throw new Error("Notice not found or deleted by admin.");
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Single Post Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSinglePost();
    }
  }, [id, token]);

  // 💬 HANDLER FOR DIRECT COMMENTING FROM THIS VIEW
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: commentText.trim() })
      });

      if (res.ok) {
        const updatedCommentsArray = await res.json();
        // State update instantly
        setPost(prev => ({ ...prev, comments: updatedCommentsArray }));
        setCommentText('');
      } else {
        alert("Failed to submit reply. Please login first.");
      }
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-red-50 p-6 rounded-lg text-center border border-red-200">
        <p className="text-red-600 font-semibold">⚠️ {error}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm font-bold text-blue-600 underline">
          Go Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Back to Home Navigator */}
      <button 
        onClick={() => navigate('/')} 
        className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
      >
        ← Back to Main Network
      </button>

      {/* Main Single Post Card Structure */}
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
            {post.page ? (
              <p className="text-xs font-bold text-purple-700 mt-1">
                🏢 {post.page.name} <span className="text-gray-400 font-normal">({post.page.category})</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                By {post.user?.name} ({post.user?.jobTitle || "Member"}) • {post.user?.department || "General"}
              </p>
            )}
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
            {post.category}
          </span>
        </div>

        <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed border-b pb-4">
          {post.content}
        </p>

        {/* Total Likes Banner */}
        <div className="text-xs text-gray-500 font-semibold flex items-center gap-1">
          👍 <span>{post.likes?.length || 0} People reacted to this notice</span>
        </div>

        {/* Comment Arena Box */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Discussion ({post.comments?.length || 0})
          </h3>

          {/* Render List */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="bg-white p-3 rounded-lg border text-xs shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">
                      👤 {comment.user?.name || "Anonymous User"} 
                      <span className="text-gray-400 font-normal ml-1">
                        ({comment.user?.jobTitle || "Aspirant"})
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line mt-1">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-2">No dynamic replies yet.</p>
            )}
          </div>

          {/* Form Reply Box Input (Only if Logged In) */}
          {token ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder="Share your response or reply..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 p-2.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required 
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
              >
                Comment
              </button>
            </form>
          ) : (
            <p className="text-xs text-center text-gray-400 bg-white p-2 rounded border border-dashed">
              🔒 link through WhatsApp open huyi hai. Reply karne ke liye please account login karein.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePostView;