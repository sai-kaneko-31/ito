import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './database';
import { handleGameEvents } from './socket/gameEvents';
import gamesRouter from './routes/games';
import themesRouter from './routes/themes';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000"
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/games', gamesRouter);
app.use('/api/themes', themesRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle game events
  handleGameEvents(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Cleanup old games every hour
setInterval(async () => {
  try {
    const Game = (await import('./models/Game')).default;
    await (Game as any).cleanupOldGames();
    console.log('Old games cleaned up');
  } catch (error) {
    console.error('Error cleaning up old games:', error);
  }
}, 60 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});