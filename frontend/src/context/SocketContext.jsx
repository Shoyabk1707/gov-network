import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // 🚀 NEW: Message counter state
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      if (socket) socket.disconnect();
      return;
    }

    const socketInstance = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket']
    });

    setSocket(socketInstance);

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      const userId = payload.id || payload._id;
      if (userId) socketInstance.emit('setup_session', userId);

      // A. Fetch Initial Unread Notification Count
      fetch(`${API_BASE_URL}/api/notifications/unread-counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.unreadNotifications !== undefined) setUnreadCount(data.unreadNotifications);
      }).catch(err => console.error("Notification count error:", err));

      // 🚀 B. NEW: Initial Unread Messages Count Fetch (Agar aapke paas endpoint hai, nahi toh ye background me handle hoga)
      // fetch(`${API_BASE_URL}/api/chat/unread-count`, { ... })

    } catch (e) {
      console.error("Session token validation broken:", e);
    }

    // 📡 NOTIFICATION LISTENERS
    socketInstance.on('new_notification', () => {
      setUnreadCount(prev => prev + 1);
    });

    socketInstance.on('delete_notification', () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // 🚀 📥 NEW: LIVE INCOMING MESSAGE LISTENERS (Feed ya kisi bhi page par kaam karega)
    socketInstance.on('incoming_message_notification', (data) => {
      // Agar user pehle se hi us specific chat room me nahi hai, tabhi badge badhao aur toast dikhao
      const currentPath = window.location.pathname;
      if (currentPath !== '/messages') {
        setUnreadMessagesCount(prev => prev + 1);
        
        // 💬 Realtime Alert popup on Feed!
        toast(`💬 Naya Message: ${data.text}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#1e293b',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          },
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      unreadCount, 
      setUnreadCount, 
      unreadMessagesCount, // 🚀 Export messages count
      setUnreadMessagesCount 
    }}>
      {children}
    </SocketContext.Provider>
  );
};