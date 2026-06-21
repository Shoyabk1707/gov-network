require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http'); // ✨ INJECTED: Standard HTTP module for Socket infrastructure
const { Server } = require('socket.io'); // ✨ INJECTED: Socket.io Server class
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app); // ✨ UPDATED: Express app mapped into HTTP Server instance

// Connect Database
connectDB();

// 🌐 PREMIUM CONFIGURATION FOR CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'https://gov-network.vercel.app',
  'https://gov-network-1m0wj5zq7-gov-network-s-projects.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:');
    const isVercel = origin.endsWith('.vercel.app');
    
    if (isLocalhost || isVercel) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/network', require('./routes/network'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('GovNetwork Backend is running with Sockets!');
});

// ==========================================
// 🔌 REAL-TIME SOCKET.IO ENGINE CONFIGURATION
// ==========================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Memory registry to track live users mapped to their socket connection IDs
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // 1. Authenticate user and map their Database User ID to their Socket ID
  socket.on('setup_session', (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      console.log(`👤 User logged online: ${userId} -> Socket: ${socket.id}`);
      io.emit('get_online_users', Array.from(onlineUsers.keys()));
    }
  });

  // 2. Join a dedicated conversation room stream channel
  socket.on('join_chat_room', (conversationId) => {
    socket.join(String(conversationId));
    console.log(`🚪 Socket ${socket.id} joined conversation pool room: ${conversationId}`);
  });

  // 3. Listen for real-time text dispatch broadcast relays
  socket.on('send_instant_message', (messageData) => {
    // messageData will contain: { conversationId, sender, text, createdAt, recipientId }
    const { conversationId, recipientId } = messageData;
    
    // Broadcast inside the room channel instantly
    socket.to(String(conversationId)).emit('receive_instant_message', messageData);
    
    // Fallback: If recipient is not currently viewing the room but is online elsewhere, ping them
    const recipientSocketId = onlineUsers.get(String(recipientId));
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('incoming_message_notification', {
        conversationId,
        text: messageData.text
      });
    }
  });

  // Handle sudden disconnections gracefully
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('get_online_users', Array.from(onlineUsers.keys()));
  });

  // ⌨️ Relay typing states across active room pools instantly
  socket.on('user_typing_state', (typingData) => {
    const { conversationId } = typingData;
    // Broadcast typing status inside the specific conversation room channel
    socket.to(String(conversationId)).emit('user_typing_state', typingData);
  });
});

const PORT = process.env.PORT || 5000;
// CRITICAL FIX: Server variable needs to listen now instead of app directly
server.listen(PORT, () => {
  console.log(`Server is running with real-time sockets on port ${PORT}`);
});