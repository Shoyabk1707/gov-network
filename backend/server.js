require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http'); // ✨ Standard HTTP module for Socket infrastructure
const { Server } = require('socket.io'); // ✨ Socket.io Server class
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path'); // 🚀 INJECTED for static folders rendering management
const fs = require('fs'); // 🚀 INJECTED to auto-verify uploads directory path

const app = express();
const server = http.createServer(app); // ✨ Express app mapped into HTTP Server instance

// Connect Database
connectDB();

// 🚀 CRITICAL SECURITY CHECK: Ensure uploads/ directory physically exists before serving static paths
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🌐 PREMIUM CONFIGURATION FOR CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'https://gov-network.vercel.app',
  'https://gov-network-1m0wj5zq7-gov-network-s-projects.vercel.app' // 👈 Fixed trailing slash
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:');
    const isVercel = origin.endsWith('.vercel.app');
    const isAllowedArray = allowedOrigins.includes(origin);
    
    if (isLocalhost || isVercel || isAllowedArray) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 👈 Added PATCH & OPTIONS for binary/pre-flight handshakes
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'] // 👈 Extended for multipart boundary support
};

// 🚀 CRITICAL OVERRIDE: Global pre-flight pre-route engine mapping for attachments
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🚀 INJECTED to handle extended multipart form fields parsing safely

// 🚀 INJECTED STATIC ROUTE: Serves the uploads directory files context to prevent 404 image loops
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
      console.log(`👤 User logged online: ${userId}`);
      
      // ✨ BROADCAST: Saare users ko live active status sync karo instantly
      io.emit('update_online_users', Array.from(onlineUsers.keys()));
    }
  });

  // 2. Join a dedicated conversation room stream channel
  socket.on('join_chat_room', (conversationId) => {
    socket.join(String(conversationId));
    console.log(`🚪 Socket ${socket.id} joined conversation pool room: ${conversationId}`);
  });

  // 3. Listen for real-time text dispatch broadcast relays
  socket.on('send_instant_message', (messageData) => {
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
    // ✨ BROADCAST: User ke jate hi list refresh karo live users ki
    io.emit('update_online_users', Array.from(onlineUsers.keys()));
  });

  // ⌨️ Relay typing states across active room pools instantly
  socket.on('user_typing_state', (typingData) => {
    const { conversationId } = typingData;
    socket.to(String(conversationId)).emit('user_typing_state', typingData);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server is running with real-time sockets on port ' + PORT);
});