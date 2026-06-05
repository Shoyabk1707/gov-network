require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// 🌐 PREMIUM CONFIGURATION FOR CORS & PREFLIGHT OPTIONS
const allowedOrigins = [
  'http://localhost:5173',          // Local frontend testing
  'https://gov-network.vercel.app'  // Aapka live vercel frontend link
];

app.use(cors({
  origin: function (origin, callback) {
    // Allows requests with no origin (like mobile apps, postman, or curls)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // OPTIONS header allow hona compulsory hai!
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✨ HANDLE PREFLIGHT REQUESTS GLOBALLY FOR ALL ROUTES
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/network', require('./routes/network'));
app.use('/api/pages', require('./routes/pageRoutes'));

app.get('/', (req, res) => {
  res.send('GovNetwork Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});