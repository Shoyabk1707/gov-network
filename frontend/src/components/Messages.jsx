import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const autoSelectChatId = location.state?.autoSelectChatId;

  const [conversations, setConversations] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
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
  
  // 🔍 LIGHTBOX MODAL STATE FOR FULLSCREEN IMAGE VIEW
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);

  // ↩️ THREADING SYSTEM STATE HOOKS
  const [replyingToMessage, setReplyingToMessage] = useState(null);

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
        
        if (socketRef.current) {
          socketRef.current.emit('mark_conversation_read', { conversationId, readerId: currentUserId });
        }

        setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
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
      setReplyingToMessage(null);
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
        
        socketRef.current.emit('mark_conversation_read', { conversationId: currentActive._id, readerId: currentUserId });

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

    socketRef.current.on('message_status_updated_direct', (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, status: data.status } : m));
    });

    socketRef.current.on('message_read_realtime', (data) => {
      const currentActive = activeChatRef.current;
      if (currentActive && String(data.conversationId) === String(currentActive._id)) {
        setMessages(prev => prev.map(m => m.sender === currentUserId ? { ...m, status: 'read' } : m));
      }
    });

    socketRef.current.on('message_deleted_realtime', (data) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, isDeleted: true, text: "This message was deleted", mediaUrl: "", fileType: "text" } : m));
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
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isRecipientTyping]);

  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);
    if (!socketRef.current || !activeChat) return;

    socketRef.current.emit('user_typing_state', { conversationId: activeChat._id, senderId: currentUserId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && activeChatRef.current) {
        socketRef.current.emit('user_typing_state', { conversationId: activeChatRef.current._id, senderId: currentUserId, isTyping: false });
      }
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size limits exceeded (Max 10MB).");
        return;
      }
      setSelectedImage(file);
      const ext = file.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        setImagePreviewUrl("document_placeholder"); 
      }
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
        if (replyingToMessage) {
          formData.append('replyTo', replyingToMessage._id);
        }

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
          body: JSON.stringify({ 
            conversationId: activeChat._id, 
            text: textPayload,
            replyTo: replyingToMessage ? replyingToMessage._id : null 
          })
        });
        if (res.ok) savedMsg = await res.json();
      }

      if (savedMsg) {
        const isOnline = onlineUsersList.includes(String(targetRecipient._id || targetRecipient));
        if (isOnline) savedMsg.status = 'delivered';

        setMessages((prev) => [...prev, savedMsg]);
        setNewMessageText('');
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setShowEmojiPicker(false);
        setReplyingToMessage(null); 
        
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

  const handleDeleteAction = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/message/delete/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m._id === messageId ? updatedMsg : m));
        socketRef.current.emit('delete_message_trigger', { conversationId: activeChat._id, messageId });
        toast.success("Message deleted successfully.");
      } else {
        toast.error("Unauthorized delete operation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSecureDownload = async (url, originalName) => {
    try {
      toast.loading("Downloading document...", { id: "doc-dl" });
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network security block.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = originalName || "attachment-file.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("File downloaded successfully!", { id: "doc-dl" });
    } catch (err) {
      toast.error("Secure link blocked. Opening via backup portal instead.", { id: "doc-dl" });
      window.open(url, "_blank");
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

  const renderTicks = (status) => {
    if (status === 'read') return <span className="text-blue-500 font-bold ml-1 text-[11px]">✓✓</span>;
    if (status === 'delivered') return <span className="text-gray-400 font-bold ml-1 text-[11px]">✓✓</span>;
    return <span className="text-gray-400 font-bold ml-1 text-[11px]">✓</span>;
  };

  const checkIsDocumentType = (msg) => {
    if (msg.fileType === 'document') return true;
    if (!msg.mediaUrl) return false;
    const urlParts = msg.mediaUrl.toLowerCase().split('?')[0].split('.');
    const ext = urlParts[urlParts.length - 1];
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext);
  };

  const redirectToUserProfile = (targetId) => {
    if (targetId) navigate(`/user/${targetId}`);
  };

  const popularEmojis = ["👍", "❤️", "👏", "🔥", "😂", "😮", "🎉", "🙏", "💡", "💯", "✅", "✨"];
  const currentRecipient = activeChat ? getRecipientUser(activeChat) : {};

  const filteredConversations = conversations.filter(chat => {
    const targetUser = getRecipientUser(chat);
    return targetUser?.name?.toLowerCase().includes(chatSearchQuery.toLowerCase());
  });

  return (
    // 🚀 NEW IMMERSIVE VIEWPORT CONFIG: Set to absolute 100% inner viewport limits for both web & mobile layouts safely
    <div className="fixed inset-0 z-50 md:relative md:inset-auto bg-white border-0 md:border border-gray-200 shadow-none md:shadow-sm h-[calc(100vh-52px)] md:h-[calc(100vh-140px)] flex overflow-hidden text-left w-full">
      
      {/* 📁 1. LEFT SIDE INBOX PANEL */}
      <div className={`md:w-80 lg:w-[360px] border-r border-gray-100 flex flex-col h-full bg-white shrink-0 w-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-gray-100 bg-white shrink-0 space-y-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Messages</h2>
          
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search chats by name..." 
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full bg-[#f1f5f9] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-800 transition-all placeholder-gray-400 outline-none font-medium"
            />
            {chatSearchQuery && (
              <button 
                type="button" 
                onClick={() => setChatSearchQuery('')} 
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loadingChats ? (
            <div className="p-4 text-xs font-semibold text-slate-400 text-center animate-pulse">Loading channels...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">No matching conversations.</div>
          ) : (
            filteredConversations.map((chat) => {
              const targetUser = getRecipientUser(chat);
              const isActive = activeChat?._id === chat._id;
              const isUserOnline = onlineUsersList.includes(String(targetUser._id || targetUser));
              const hasUnread = chat.unreadCount > 0;

              return (
                <div key={chat._id} onClick={() => setActiveChat(chat)} className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200 ${isActive ? 'bg-slate-50 border-l-4 border-slate-900' : 'hover:bg-slate-50/60'}`}>
                  <div className="relative shrink-0" onClick={(e) => { e.stopPropagation();   }}>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden hover:opacity-90 transition-opacity">
                      {targetUser.avatar ? <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" /> : getInitials(targetUser.name)}
                    </div>
                    {isUserOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 onClick={(e) => { e.stopPropagation(); redirectToUserProfile(targetUser._id || targetUser); }} className={`text-sm truncate hover:text-blue-600 transition-colors ${hasUnread ? 'font-extrabold text-slate-950' : 'font-bold text-slate-800'}`}>{targetUser.name}</h4>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                          {new Date(chat.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{targetUser.jobTitle || "Member"}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className={`text-xs truncate flex-1 ${hasUnread ? 'font-bold text-slate-950' : 'text-slate-500'}`}>
                        {chat.lastMessage?.sender === currentUserId ? 'You: ' : ''}{chat.lastMessage?.text || (chat.lastMessage?.mediaUrl ? '📁 Attachment File' : 'New Bridge')}
                      </p>
                      {hasUnread && <span className="bg-slate-950 text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center shrink-0">{chat.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 💬 2. RIGHT CONVERSATION MODULE */}
      <div className={`flex-1 flex flex-col h-full bg-slate-50 w-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          // 🚀 REFRACTORED FLEX COMPONENT DESIGN: Standard fluid display framework to avoid cutting elements on screens
          <div className="flex flex-col h-full w-full bg-[#f8fafc]">
            
            {/* 🛑 A. PREMIUM FIXED HEADER */}
            <div className="h-14 border-b border-gray-200/85 flex items-center px-4 bg-white shrink-0 z-20 select-none">
              <button type="button" onClick={() => setActiveChat(null)} className="text-slate-800 hover:text-slate-900 mr-3 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div onClick={() => redirectToUserProfile(currentRecipient._id || currentRecipient)} className="relative mr-3 shrink-0 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden hover:opacity-90 transition-opacity border border-gray-200">
                  {currentRecipient.avatar ? <img src={currentRecipient.avatar} className="w-full h-full object-cover" /> : getInitials(currentRecipient.name || "User")}
                </div>
                {onlineUsersList.includes(String(currentRecipient._id || currentRecipient)) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              
              <div className="min-w-0">
                <h4 onClick={() => redirectToUserProfile(currentRecipient._id || currentRecipient)} className="font-bold text-slate-900 text-sm leading-tight cursor-pointer hover:text-blue-600 transition-colors truncate">
                  {currentRecipient.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                  {isRecipientTyping ? <span className="text-emerald-600 font-bold animate-pulse">typing...</span> : (currentRecipient.jobTitle || 'Active Connection')}
                </p>
              </div>
            </div>

            {/* 📜 B. MESSAGES CONTENT AUTO FEED SCROLLER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc] w-full z-10 min-h-0">
              {loadingMessages ? (
                <div className="text-center text-xs font-semibold text-slate-400 animate-pulse pt-6">Pulling logs...</div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isOwn = String(msg.sender) === String(currentUserId);
                    const currentMsgDate = formatMessageGroupDate(msg.createdAt);
                    const showDateDivider = index === 0 || currentMsgDate !== formatMessageGroupDate(messages[index - 1].createdAt);
                    const isDocFile = checkIsDocumentType(msg);

                    return (
                      <div key={msg._id || index} className="space-y-3">
                        {showDateDivider && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-gray-200/70 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{currentMsgDate}</span>
                          </div>
                        )}
                        
                        <div className={`flex group items-center gap-2 w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          
                          <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 ${isOwn ? 'order-1' : 'order-3'}`}>
                            {!msg.isDeleted && (
                              <button type="button" onClick={() => setReplyingToMessage(msg)} className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-transform active:scale-95 shadow-2xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                              </button>
                            )}
                            {isOwn && !msg.isDeleted && (
                              <button type="button" onClick={() => handleDeleteAction(msg._id)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg shadow-2xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>

                          <div className={`max-w-[80%] md:max-w-[65%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs order-2 flex flex-col text-left ${
                            msg.isDeleted 
                              ? 'bg-slate-100 text-slate-400 italic rounded-2xl border border-slate-200 shadow-none' 
                              : isOwn ? 'bg-[#1e293b] text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                          }`}>
                            
                            {msg.replyTo && (
                              <div className={`mb-2 p-2 rounded-lg border-l-4 text-[11px] truncate max-w-full flex flex-col text-left ${isOwn ? 'bg-white/10 text-slate-200 border-white/40' : 'bg-slate-50 text-slate-600 border-slate-400'}`}>
                                <span className="font-extrabold block text-[10px] mb-0.5 opacity-80 text-left">Ref: Reply to {String(msg.replyTo.sender) === String(currentUserId) ? "You" : currentRecipient.name}</span>
                                {msg.replyTo.isDeleted ? <span className="italic">This message was deleted</span> : <span className="truncate block opacity-90 text-left">{msg.replyTo.text || '📁 Shared Media'}</span>}
                              </div>
                            )}

                            {msg.mediaUrl && !msg.isDeleted && (
                              isDocFile ? (
                                <div onClick={() => handleSecureDownload(msg.mediaUrl, msg.mediaUrl.split('/').pop().split('-').pop())} className={`p-3 rounded-xl flex items-center gap-3 border mb-1.5 cursor-pointer transition-all ${isOwn ? 'bg-white/15 border-white/20 text-white hover:bg-white/25' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'}`}>
                                  <span className="text-xl shrink-0">📄</span>
                                  <div className="min-w-0 flex-1 text-left">
                                    <p className="font-bold truncate text-[11px] mb-0.5">{msg.mediaUrl.split('/').pop().split('-').pop() || "view_document.pdf"}</p>
                                    <p className="text-[9px] opacity-70 uppercase tracking-wider">Click to Download File</p>
                                  </div>
                                  <span className="text-sm shrink-0 opacity-70">📥</span>
                                </div>
                              ) : (
                                <div onClick={() => setZoomedImageUrl(msg.mediaUrl)} className="mb-2 rounded-lg overflow-hidden border border-slate-100 max-h-48 bg-black/5 cursor-zoom-in transition-transform hover:scale-[1.01]">
                                  <img src={msg.mediaUrl} alt="Shared asset" className="w-full h-auto object-cover" />
                                </div>
                              )
                            )}
                            
                            {msg.text && <p className="whitespace-pre-wrap break-words text-left">{msg.text}</p>}
                            
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                              <span className="text-[9px] block font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isOwn && !msg.isDeleted && renderTicks(msg.status)}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}

                  {isRecipientTyping && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white border border-gray-200 text-slate-500 px-3.5 py-2 rounded-2xl rounded-bl-none text-xs font-semibold flex items-center gap-1 shadow-2xs">
                        <span>{currentRecipient.name || "Connection"} typing</span>
                        <span className="flex gap-0.5 ml-1">
                          <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></span>
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 🛑 C. ANCHORED ACTION INPUT FOOTER CONTAINER */}
            <div className="border-t border-gray-200 p-2.5 bg-white shrink-0 z-20 relative w-full mb-0 md:mb-0 ">
              
              {replyingToMessage && (
                <div className="absolute left-0 right-0 bottom-full mb-0 bg-slate-50 border-t border-b border-gray-200 px-4 py-2 flex items-center justify-between animate-fadeIn text-xs shadow-md z-30">
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-extrabold text-slate-900">Replying to {String(replyingToMessage.sender) === String(currentUserId) ? "yourself" : currentRecipient.name}</p>
                    <p className="text-slate-500 truncate text-[11px] mt-0.5">{replyingToMessage.text || '📁 Shared Media'}</p>
                  </div>
                  <button type="button" onClick={() => setReplyingToMessage(null)} className="text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}

              {imagePreviewUrl && (
                <div className="absolute left-0 right-0 bottom-full mb-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between animate-fadeIn z-30 shadow-md">
                  <div className="flex items-center gap-3">
                    {imagePreviewUrl === "document_placeholder" ? <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-lg text-white font-bold animate-pulse">📄</div> : <img src={imagePreviewUrl} alt="Upload thumbnail" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs" />}
                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-[180px]">{selectedImage?.name}</span>
                  </div>
                  <button type="button" onClick={() => { setSelectedImage(null); setImagePreviewUrl(null); }} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}

              {showEmojiPicker && (
                <div ref={emojiMenuRef} className="absolute bottom-full mb-2 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn grid grid-cols-6 gap-2 w-48">
                  {popularEmojis.map(emoji => (
                    <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)} className="text-lg hover:bg-slate-100 p-1 rounded-lg transition-transform active:scale-95 text-center">{emoji}</button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-0.5 shrink-0">
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={handleImageChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl hover:bg-slate-50 transition-colors ${showEmojiPicker ? 'text-slate-950 bg-slate-50' : 'text-slate-400 hover:text-slate-900'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                </div>

                <input 
                  ref={inputFieldRef} 
                  type="text" 
                  placeholder={replyingToMessage ? "Write a reply response..." : "Write a message response..."} 
                  value={newMessageText} 
                  onChange={handleInputChange} 
                  className="flex-1 p-2 md:p-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-gray-300 rounded-full text-xs font-semibold outline-none transition-all block w-full pl-4" 
                />
                <button type="submit" className="bg-[#1e293b] hover:bg-slate-800 text-white h-8 w-8 rounded-full flex items-center justify-center transition shrink-0 shadow-xs"><svg className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
              </form>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 bg-white h-full">
            <span className="text-4xl mb-2 opacity-50">💬</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Chat Selected</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium text-center">Pick a thread from the left index panel to open secure real-time streams.</p>
          </div>
        )}
      </div>

      {/* 🚀 LIGHTBOX OVERLAY SCREEN INTERFACE */}
      {zoomedImageUrl && (
        <div onClick={() => setZoomedImageUrl(null)} className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out animate-fadeIn">
          <button type="button" onClick={() => setZoomedImageUrl(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors duration-150"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <img src={zoomedImageUrl} alt="Fullscreen preview asset" className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl select-none" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
}