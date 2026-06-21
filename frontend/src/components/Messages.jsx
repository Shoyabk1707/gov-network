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
  
  // Real-time tracking structures
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputFieldRef = useRef(null); // Focus handler target point

  let currentUserId = null;
  try {
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenPayload = JSON.parse(window.atob(base64));
      currentUserId = tokenPayload?._id || tokenPayload?.id;
    }
  } catch (err) {
    console.error("Token decoding fault:", err);
  }

  // 🔌 1. INITIALIZE REAL-TIME WEBSOCKET TUNNEL
  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket']
    });

    if (currentUserId) {
      socketRef.current.emit('setup_session', currentUserId);
    }

    socketRef.current.on('receive_instant_message', (incomingMessage) => {
      if (activeChat && String(incomingMessage.conversationId) === String(activeChat._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
      fetchConversations();
    });

    // 📡 LISTEN FOR USER TYPING DISPATCH RELAYS
    socketRef.current.on('user_typing_state', (data) => {
      if (activeChat && String(data.conversationId) === String(activeChat._id) && String(data.senderId) !== String(currentUserId)) {
        setIsRecipientTyping(data.isTyping);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [activeChat]);

  // 🚪 2. JOIN CHAT ROOM & MANAGE FOCUS INJECTIONS
  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_chat_room', activeChat._id);
      setIsRecipientTyping(false); // Reset typing screen state cleanly
      
      // Auto focus entry field cursor
      setTimeout(() => {
        inputFieldRef.current?.focus();
      }, 50);
    }
  }, [activeChat]);

  // 📡 3. Saare Conversations Fetch & Auto-Select Selection Handler
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const chatLists = await res.json();
        setConversations(chatLists);

        // Check if coming from a dynamic direct redirect trigger map
        if (autoSelectChatId) {
          const matchedChat = chatLists.find(c => String(c._id) === String(autoSelectChatId));
          if (matchedChat) setActiveChat(matchedChat);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoadingChats(false); }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoadingMessages(false); }
  };

  useEffect(() => {
    fetchConversations();
  }, [autoSelectChatId]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat._id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecipientTyping]);

  // ⌨️ 6. TYPING ENGINE DEBOUNCE TRACKER
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);
    if (!socketRef.current || !activeChat) return;

    // Send instant event to signal typing started
    socketRef.current.emit('user_typing_state', {
      conversationId: activeChat._id,
      senderId: currentUserId,
      isTyping: true
    });

    // Clear old existing stopwatch logs
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop signaling after 2 seconds of zero typing activity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('user_typing_state', {
        conversationId: activeChat._id,
        senderId: currentUserId,
        isTyping: false
      });
    }, 2000);
  };

  // 📤 7. SEND PACKET DISPATCH
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    const targetRecipient = getRecipientUser(activeChat);
    const textPayload = newMessageText.trim();

    // Turn off active typing immediately on commit submit
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('user_typing_state', {
      conversationId: activeChat._id,
      senderId: currentUserId,
      isTyping: false
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId: activeChat._id, text: textPayload })
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessageText('');

        socketRef.current.emit('send_instant_message', {
          ...savedMsg,
          recipientId: targetRecipient._id || targetRecipient
        });
        fetchConversations();
      }
    } catch (err) { toast.error("Failed to send text."); }
  };

  const getRecipientUser = (chatItem) => {
    return chatItem.participants?.find(p => String(p._id || p) !== String(currentUserId)) || {};
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const clean = name.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  // 🗓️ PREMIUM FUNCTION: CHRONOLOGICAL CALENDAR SEPARATOR MAPPING
  const formatMessageGroupDate = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] grid grid-cols-1 md:grid-cols-12 overflow-hidden animate-fadeIn text-left">
      
      {/* LEFT SIDE PANEL */}
      <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Messaging Streams</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 pr-1">
          {loadingChats ? (
            <div className="p-4 text-xs font-semibold text-slate-400 text-center animate-pulse">Loading active channels...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">No active conversations.</div>
          ) : (
            conversations.map((chat) => {
              const targetUser = getRecipientUser(chat);
              const isActive = activeChat?._id === chat._id;
              return (
                <div 
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    isActive ? 'bg-white border-l-4 border-slate-900 shadow-sm' : 'hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                    {targetUser.avatar ? <img src={targetUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : getInitials(targetUser.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate leading-snug">{targetUser.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{targetUser.jobTitle || "Member"}</p>
                    <p className="text-xs text-slate-500 truncate mt-1 font-normal">
                      {chat.lastMessage?.sender === currentUserId ? 'You: ' : ''}{chat.lastMessage?.text || 'Started a new bridge.'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="md:col-span-8 flex flex-col h-full bg-white">
        {activeChat ? (
          <>
            <div className="p-3.5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {getRecipientUser(activeChat).avatar ? <img src={getRecipientUser(activeChat).avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : getInitials(getRecipientUser(activeChat).name)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-[14px] leading-tight">{getRecipientUser(activeChat).name}</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{getRecipientUser(activeChat).jobTitle || "Active Node"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
              {loadingMessages ? (
                <div className="text-center text-xs font-semibold text-slate-400 animate-pulse pt-6">Pulling logs...</div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = String(msg.sender) === String(currentUserId);
                  
                  // Chronological group date injection calculation segment
                  const currentMsgDate = formatMessageGroupDate(msg.createdAt);
                  const prevMsgDate = index > 0 ? formatMessageGroupDate(messages[index - 1].createdAt) : null;
                  const showDateDivider = currentMsgDate !== prevMsgDate;

                  return (
                    <div key={msg._id || index} className="space-y-3">
                      {showDateDivider && (
                        <div className="flex justify-center my-4 animate-fadeIn">
                          <span className="px-3 py-1 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            {currentMsgDate}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                          isOwn ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-gray-150 rounded-bl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className="text-[9px] block text-right mt-1 opacity-60 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* ⌨️ LIVE TYPING BUBBLE INDICATOR LAYER */}
              {isRecipientTyping && (
                <div className="flex justify-start items-center gap-1.5 animate-fadeIn">
                  <div className="bg-white border border-gray-150 text-slate-500 px-3.5 py-2 rounded-2xl rounded-bl-none text-xs font-semibold tracking-wide flex items-center gap-1 shadow-xs">
                    <span>{getRecipientUser(activeChat).name} is typing</span>
                    <span className="flex items-center gap-0.5 ml-0.5 pt-1">
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
              <input 
                ref={inputFieldRef} // Reference attached
                type="text" 
                placeholder="Write a message response..."
                value={newMessageText}
                onChange={handleInputChange} // Hook up typing tracking handler
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                required
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shrink-0">
                Send
              </button>
            </form>
          </>
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