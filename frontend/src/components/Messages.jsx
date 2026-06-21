import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'; // ✨ INJECTED: Socket Client package

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // ✨ INJECTED: Safe reference point for global socket instance

  // Token decoding layer to track logged-in identity tracking metrics
  let currentUserId = null;
  try {
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenPayload = JSON.parse(window.atob(base64));
      currentUserId = tokenPayload?._id || tokenPayload?.id;
    }
  } catch (err) {
    console.error("Token decoding fault in messaging dashboard:", err);
  }

  // 🔌 1. INITIALIZE REAL-TIME WEBSOCKET CONNECTION
  useEffect(() => {
    // API_BASE_URL ko link karke connection initiate karo
    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket']
    });

    // Server par apni login session identity register karo
    if (currentUserId) {
      socketRef.current.emit('setup_session', currentUserId);
    }

    // 📡 LISTEN FOR INCOMING INSTANT MESSAGES
    socketRef.current.on('receive_instant_message', (incomingMessage) => {
      // Agar incoming message usi conversation ka hai jo abhi screen par open hai
      if (activeChat && String(incomingMessage.conversationId) === String(activeChat._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
      // Recent chats preview update karo background mein automatically
      fetchConversations();
    });

    // Cleanup tunnel on component unmount lifecycle
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [activeChat]); // Re-subscribe handlers when context shifts to new channels

  // 🚪 2. JOIN CHAT ROOM WHEN ACTIVE CHAT CHANGES
  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_chat_room', activeChat._id);
    }
  }, [activeChat]);

  // 📡 3. Saare Active Conversations Fetch Karo (HTTP REST Fallback)
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoadingChats(false); }
  };

  // 📡 4. Fetch Message History Chronologically
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
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  // 📜 Auto-scroll container to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 📤 5. REAL-TIME SEND MESSAGE PIPELINE
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    const targetRecipient = getRecipientUser(activeChat);
    const textPayload = newMessageText.trim();

    try {
      // Step A: Database log registry lock (HTTP Post)
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
        
        // Step B: Instantly push inside own UI array container state
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessageText('');

        // Step C: Emit via socket pipe channel to target node instantly!
        socketRef.current.emit('send_instant_message', {
          ...savedMsg,
          recipientId: targetRecipient._id || targetRecipient
        });

        fetchConversations(); // Sidebar notification tracking synchronizer
      }
    } catch (err) { toast.error("Failed to route network packet."); }
  };

  const getRecipientUser = (chatItem) => {
    return chatItem.participants?.find(p => String(p._id || p) !== String(currentUserId)) || {};
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const clean = name.trim().split(' ');
    return clean.length >= 2 ? (clean[0][0] + clean[1][0]).toUpperCase() : clean[0][0].toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] grid grid-cols-1 md:grid-cols-12 overflow-hidden animate-fadeIn text-left">
      
      {/* LEFT SIDE PANEL: Index Items */}
      <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Messaging Streams</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 pr-1">
          {loadingChats ? (
            <div className="p-4 text-xs font-semibold text-slate-400 text-center animate-pulse">Loading active channels...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
               No active conversations yet. Reach out to verified officials or peers from their profiles!
            </div>
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
                    <h4 className="font-bold text-slate-900 text-sm truncate leading-snug">{targetUser.name || "Network Node"}</h4>
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

      {/* RIGHT SIDE PANEL: Main Messaging logs panel view */}
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

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {loadingMessages ? (
                <div className="text-center text-xs font-semibold text-slate-400 animate-pulse pt-6">Pulling ledger logs...</div>
              ) : (
                messages.map((msg) => {
                  const isOwn = String(msg.sender) === String(currentUserId);
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                        isOwn ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-gray-150 rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[9px] block text-right mt-1 opacity-60 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
              <input 
                type="text" 
                placeholder="Write a message response..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
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