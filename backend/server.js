require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// 🌐 PREMIUM CONFIGURATION FOR CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'https://gov-network.vercel.app',
  'https://gov-network-1m0wj5zq7-gov-network-s-projects.vercel.app/'
];


app.use(cors({
  // Is function se local localhost aur Vercel ke saare subdomains/preview links automatic allow ho jayenge
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

app.get('/', (req, res) => {
  res.send('GovNetwork Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});