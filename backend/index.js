require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generalLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // Local development
  process.env.FRONTEND_URL || 'https://disaster-frontend-six.vercel.app', // Frontend URL from env
  (process.env.FRONTEND_URL || 'https://disaster-frontend-six.vercel.app') + '/', // With trailing slash
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user', 'x-role']
};

app.use(cors(corsOptions));

// Socket.IO CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(express.json());

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test geocode route
app.post('/geocode-test', (req, res) => {
  res.json({ message: 'Test geocode route working' });
});

// Pass io to routes
const disasterRoutes = require('./src/routes/disasterRoutes')(io);
const geocodeRoutes = require('./src/routes/geocodeRoutes')(io);
const resourceRoutes = require('./src/routes/resourceRoutes')(io);
const reportRoutes = require('./src/routes/reportRoutes')(io);

app.use('/disasters', disasterRoutes);
app.use('/geocode', geocodeRoutes);
app.use('/resources', resourceRoutes);
app.use('/reports', reportRoutes);

// Catch-all route for debugging
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', method: req.method, url: req.originalUrl });
});

const PORT = process.env.PORT || 8002;
server.listen(PORT, () => {
  console.log(`🚀 Disaster Response Platform Server running on port ${PORT}`);
  console.log('🌐 CORS Allowed Origins:', allowedOrigins);
  console.log('📡 Available endpoints:');
  console.log('   • GET  /health');
  console.log('   • POST /geocode');
  console.log('   • GET  /disasters');
  console.log('   • POST /disasters');
  console.log('   • GET  /resources/disaster/:id');
  console.log('   • POST /resources');
  console.log('   • POST /reports');
  console.log('   • GET  /reports/disaster/:id');
  console.log('   • PUT  /reports/:id');
  console.log('   • DELETE /reports/:id');
  console.log('🔒 Rate limiting: 100 requests per 15 minutes per IP');
}); 