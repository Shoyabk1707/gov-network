import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { SocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // 🚀 CENTRALIZED CONTEXT HOOK: Extracted layers without duplicate scope identifiers
  const { socket, setUnreadCount } = useContext(SocketContext);

  // --- 📡 FETCH NOTIFICATIONS FROM BACKEND ---
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        
        // 🚀 UI RESET LAYER: Instantly clear counter dot badge globally
        setUnreadCount(0); 

        // 🚀 BACKEND FLUSH: Bulk update read states silently on server collection
        await fetch(`${API_BASE_URL}/api/notifications/mark-as-read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [token]);

  // --- 🚀 ATTACH STEALTH ENGINE ACTION LISTENERS ---
  useEffect(() => {
    if (!socket) return;

    // A. New Notification Appends Realtime
    socket.on('new_notification', (newLog) => {
      setNotifications(prev => [newLog, ...prev]);
    });

    // B. Stealth Mode Active: Unfollow event catches and completely wipes the row instantly
    socket.on('delete_notification', (data) => {
      setNotifications(prev => prev.filter(n => {
        const matchSender = (n.fromUser?._id || n.fromUser) === data.fromUser;
        const matchType = n.type === data.type;
        return !(matchSender && matchType); // Drops only targeted index
      }));
    });

    return () => {
      socket.off('new_notification');
      socket.off('delete_notification');
    };
  }, [socket]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_accepted':
      case 'mentorship_request':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'like':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'follow':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#1e293b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString([], {day: 'numeric', month: 'short'});
  };

  const handleProfileClick = (e, userId) => {
    e.stopPropagation(); 
    if (userId) navigate(`/user/${userId}`);
  };

  const handleRowClick = (n) => {
    if (n.postId) {
      navigate(`/post/${n.postId}`);
    } else if (n.fromUser?._id || n.fromUser) {
      const targetId = n.fromUser?._id || n.fromUser;
      navigate(`/user/${targetId}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-2 p-4 space-y-3 text-left">
        <div className="bg-white p-5 rounded-md border border-gray-200 shadow-xs animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-2 p-0 md:p-4 space-y-2 text-left animate-fadeIn">
      <div className="bg-white p-4 rounded-none md:rounded-md border border-gray-200 shadow-xs">
        <h1 className="text-base font-bold text-[#0f172a] tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-500 mt-0.5">Recent activity from your network updates channel.</p>
      </div>

      <div className="bg-white rounded-none md:rounded-md border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No recent activity found.
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id}
              onClick={() => handleRowClick(n)}
              className="p-4 flex gap-4 items-start hover:bg-slate-50/70 transition-all cursor-pointer group animate-fadeIn"
            >
              <div className="p-2 bg-slate-50 rounded-md flex-shrink-0 group-hover:bg-white border border-gray-100">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 space-y-0.5 pt-0.5">
                <div className="text-xs text-slate-700 leading-normal">
                  {n.fromUser ? (
                    <>
                      <span 
                        onClick={(e) => handleProfileClick(e, n.fromUser._id || n.fromUser)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer mr-1"
                      >
                        {n.fromUser.name || "A member"}
                      </span>
                      <span className="text-slate-600 font-medium">{n.message}</span>
                    </>
                  ) : (
                    <span className="text-slate-800 font-semibold">{n.message}</span>
                  )}
                </div>
                
                <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                  {formatTime(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}