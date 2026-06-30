require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http'); // ✨ Standard HTTP module for Socket infrastructure
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path'); // 🚀 INJECTED for static folders rendering management
const fs = require('fs'); // 🚀 INJECTED to auto-verify uploads directory path
const socketService = require('./services/socketService');

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
  'https://gov-network-1m0wj5zq7-gov-network-s-projects.vercel.app'
];

// 🚀 INITIALIZE CENTRALIZED ENTERPRISE SOCKET SERVICE
socketService.init(server, allowedOrigins);

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static route for serving file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Matrix
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/network', require('./routes/network'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('GovNetwork Backend is running with Enterprise Sockets!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server is running with centralized architecture on port ' + PORT);
});