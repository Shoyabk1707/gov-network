import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function Messages() {
  const location = useLocation();
  const autoSelectChatId = location.state?.autoSelectChatId;

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [onlineUsersList, setOnlineUsersList] = useState([]);

  // 🚀 PROFESSIONAL SUITE INTERNALS
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputFieldRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiMenuRef = useRef(null);

  const activeChatRef = useRef(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  let currentUserId = null;
  try {
    if (token) {
      const tokenPayload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      currentUserId = tokenPayload?._id || tokenPayload?.id;
    }
  } catch (err) {
    console.error("Token decoding fault:", err);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRecipientUser = (chatItem) => {
    if (!chatItem || !chatItem.participants) return {};
    return chatItem.participants.find(p => String(p._id || p) !== String(currentUserId)) || {};
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const chatLists = await res.json();
        setConversations(chatLists);
        if (autoSelectChatId) {
          const matchedChat = chatLists.find(c => String(c._id) === String(autoSelectChatId));
          if (matchedChat) setActiveChat(matchedChat);
        }
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
        await fetch(`${API_BASE_URL}/api/chat/seen/${conversationId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [autoSelectChatId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setShowEmojiPicker(false);
    }
  }, [activeChat]);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, { auth: { token }, transports: ['websocket'] });
    if (currentUserId) socketRef.current.emit('setup_session', currentUserId);

    socketRef.current.on('receive_instant_message', async (incomingMessage) => {
      const currentActive = activeChatRef.current;

      if (currentActive && String(incomingMessage.conversationId) === String(currentActive._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
        await fetch(`${API_BASE_URL}/api/chat/seen/${currentActive._id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setConversations(prev => prev.map(c => 
          String(c._id) === String(incomingMessage.conversationId)
            ? { ...c, lastMessage: incomingMessage, unreadCount: 0 }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      } else {
        setConversations(prev => prev.map(c => 
          String(c._id) === String(incomingMessage.conversationId)
            ? { ...c, lastMessage: incomingMessage, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }
    });

    socketRef.current.on('user_typing_state', (data) => {
      const currentActive = activeChatRef.current;
      if (currentActive && String(data.conversationId) === String(currentActive._id) && String(data.senderId) !== String(currentUserId)) {
        setIsRecipientTyping(data.isTyping);
      }
    });

    socketRef.current.on('update_online_users', (users) => {
      setOnlineUsersList(users);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_chat_room', activeChat._id);
      setIsRecipientTyping(false);
      const timer = setTimeout(() => inputFieldRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecipientTyping]);

  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);
    if (!socketRef.current || !activeChat) return;

    socketRef.current.emit('user_typing_state', { conversationId: activeChat._id, senderId: currentUserId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('user_typing_state', { conversationId: activeChat._id, senderId: currentUserId, isTyping: false });
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size limits exceeded (Max 5MB).");
        return;
      }
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessageText(prev => prev + emoji);
    inputFieldRef.current?.focus();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() && !selectedImage) return;
    if (!activeChat) return;

    const targetRecipient = getRecipientUser(activeChat);
    const textPayload = newMessageText.trim();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('user_typing_state', { conversationId: activeChat._id, senderId: currentUserId, isTyping: false });

    try {
      let savedMsg;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('conversationId', activeChat._id);
        formData.append('text', textPayload);
        formData.append('chatMedia', selectedImage);

        const res = await fetch(`${API_BASE_URL}/api/chat/message/media`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (res.ok) savedMsg = await res.json();
      } else {
        const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ conversationId: activeChat._id, text: textPayload })
        });
        if (res.ok) savedMsg = await res.json();
      }

      if (savedMsg) {
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessageText('');
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setShowEmojiPicker(false);
        
        socketRef.current.emit('send_instant_message', { ...savedMsg, recipientId: targetRecipient._id || targetRecipient });
        setConversations(prev => prev.map(c => 
          String(c._id) === String(activeChat._id) ? { ...c, lastMessage: savedMsg } : c
        ));
      } else {
        toast.error("Server rejected message transmission.");
      }
    } catch (err) {
      toast.error("Message broadcasting failed.");
    }
  };

  const getInitials = (name) => name ? name.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : "U";

  const formatMessageGroupDate = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today).setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === new Date(yesterday).toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const popularEmojis = ["👍", "❤️", "👏", "🔥", "😂", "😮", "🎉", "🙏", "💡", "💯", "✅", "✨"];
  const currentRecipient = activeChat ? getRecipientUser(activeChat) : {};

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-145px)] md:h-[calc(100vh-140px)] flex overflow-hidden animate-fadeIn text-left w-full">
      
      {/* 📁 1. LEFT SIDE INBOX PANEL */}
      <div className={`md:w-80 lg:w-[360px] border-r border-gray-100 flex flex-col h-full bg-slate-50/50 shrink-0 w-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white">
          {loadingChats ? (
            <div className="p-4 text-xs font-semibold text-slate-400 text-center animate-pulse">Loading channels...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">No active conversations.</div>
          ) : (
            conversations.map((chat) => {
              const targetUser = getRecipientUser(chat);
              const isActive = activeChat?._id === chat._id;
              const isUserOnline = onlineUsersList.includes(String(targetUser._id || targetUser));
              const hasUnread = chat.unreadCount > 0;

              return (
                <div key={chat._id} onClick={() => setActiveChat(chat)} className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200 ${isActive ? 'bg-slate-50 border-l-4 border-slate-900' : 'hover:bg-slate-50/60'}`}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {targetUser.avatar ? (
                        <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(targetUser.name)
                      )}
                    </div>
                    {isUserOnline && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm truncate ${hasUnread ? 'font-extrabold text-slate-950' : 'font-bold text-slate-800'}`}>{targetUser.name}</h4>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                          {new Date(chat.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{targetUser.jobTitle || "Member"}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className={`text-xs truncate flex-1 ${hasUnread ? 'font-bold text-slate-950' : 'text-slate-500'}`}>
                        {chat.lastMessage?.sender === currentUserId ? 'You: ' : ''}{chat.lastMessage?.text || (chat.lastMessage?.mediaUrl ? '🖼️ Attachment' : 'New Bridge')}
                      </p>
                      {hasUnread && (
                        <span className="bg-slate-950 text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center tracking-tighter shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 💬 2. RIGHT CONVERSATION MODULE */}
      <div className={`flex-1 flex flex-col h-full bg-white w-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex flex-col h-full w-full justify-between overflow-hidden">
            
            {/* Header Stream Panel */}
            <div className="p-4 border-b border-slate-100 flex items-center bg-white shrink-0">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-500 hover:text-slate-900 mr-2 p-1 rounded-full hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="relative mr-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {currentRecipient.avatar ? <img src={currentRecipient.avatar} className="w-full h-full object-cover" /> : getInitials(currentRecipient.name || "User")}
                </div>
                {onlineUsersList.includes(String(currentRecipient._id || currentRecipient)) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{currentRecipient.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {isRecipientTyping ? <span className="text-emerald-600 font-bold animate-pulse">typing...</span> : (currentRecipient.jobTitle || 'Active Connection')}
                </p>
              </div>
            </div>

            {/* Message Feed Scroller Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 min-h-0">
              {loadingMessages ? (
                <div className="text-center text-xs font-semibold text-slate-400 animate-pulse pt-6">Pulling logs...</div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = String(msg.sender) === String(currentUserId);
                  const currentMsgDate = formatMessageGroupDate(msg.createdAt);
                  const showDateDivider = index === 0 || currentMsgDate !== formatMessageGroupDate(messages[index - 1].createdAt);

                  return (
                    <div key={msg._id || index} className="space-y-3">
                      {showDateDivider && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-slate-200/60 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{currentMsgDate}</span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${isOwn ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-150 rounded-bl-none'}`}>
                          {msg.mediaUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-slate-100 max-h-48 bg-black/5">
                              <img src={msg.mediaUrl} alt="Shared asset" className="w-full h-auto object-cover" />
                            </div>
                          )}
                          {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                          <span className="text-[9px] block text-right mt-1 opacity-60 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input Action Module Frame */}
            <div className="border-t border-gray-100 p-3 bg-white shrink-0 relative z-30">
              
              {/* Media File Attachment Preview Card */}
              {imagePreviewUrl && (
                <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <img src={imagePreviewUrl} alt="Upload thumbnail" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs" />
                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-[180px]">{selectedImage?.name}</span>
                  </div>
                  <button type="button" onClick={() => { setSelectedImage(null); setImagePreviewUrl(null); }} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              {/* Floating Emojis Matrix Menu Overlay */}
              {showEmojiPicker && (
                <div ref={emojiMenuRef} className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn grid grid-cols-6 gap-2 w-48">
                  {popularEmojis.map(emoji => (
                    <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)} className="text-lg hover:bg-slate-100 p-1 rounded-lg transition-transform active:scale-95 text-center">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Master Input Control Elements Bar Row */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex items-center gap-1 shrink-0">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors" title="Attach Image">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </button>

                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl hover:bg-slate-50 transition-colors ${showEmojiPicker ? 'text-slate-950 bg-slate-50' : 'text-slate-400 hover:text-slate-900'}`} title="Add Emoji">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>

                <input 
                  ref={inputFieldRef} 
                  type="text" 
                  placeholder="Write a message response..." 
                  value={newMessageText} 
                  onChange={handleInputChange} 
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all block w-full" 
                />
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shrink-0">Send</button>
              </form>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
            <span className="text-4xl mb-2 opacity-50">💬</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Chat Selected</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Pick a thread from the left index panel to open secure real-time streams.</p>
          </div>
        )}
      </div>

    </div>
  );
}