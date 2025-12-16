const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "stocksync_jwt_secret_2024";

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name, role = 'warehouse-staff' } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // In production, store in database
    const user = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      name,
      role
    };

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Demo user for testing
    if (username === 'demo' && password === 'demo') {
      const user = {
        id: 'demo',
        username: 'demo',
        name: 'Demo User',
        role: 'warehouse-staff'
      };

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user
      });
    }

    // In production, verify against database
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/movements", stockRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join rooms for targeted updates
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  // Handle stock updates
  socket.on('updateStock', (data) => {
    console.log('Stock update received:', data);
    // Broadcast to all clients except sender
    socket.broadcast.emit('stockUpdate', data);
  });

  // Handle barcode scans
  socket.on('barcodeScan', (data) => {
    console.log('Barcode scan received:', data);
    // Broadcast barcode scan to all clients
    io.emit('barcodeScan', data);
  });

  // Handle low stock alerts
  socket.on('lowStockAlert', (data) => {
    console.log('Low stock alert:', data);
    // Broadcast to managers/supervisors
    socket.broadcast.to('managers').emit('lowStockAlert', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to emit stock updates from API routes
app.set('io', io);

// Default route
app.get("/", (req, res) => {
  res.send("StockSync Backend with WebSocket Running");
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("WebSocket server ready");
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
