import mongoose, { Schema, Document } from 'mongoose';
import { Game as IGame } from '../../../shared/types';

export interface GameDocument extends Omit<IGame, 'id'>, Document {
  _id: string;
}

const GameSchema = new Schema<GameDocument>({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    length: 6,
    uppercase: true
  },
  hostId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'expressing', 'arranging', 'finished'],
    default: 'waiting'
  },
  theme: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 10,
    default: 6
  },
  currentRound: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Generate unique room code
GameSchema.statics.generateRoomCode = async function(): Promise<string> {
  let roomCode: string;
  let exists: boolean;
  
  do {
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingGame = await this.findOne({ roomCode });
    exists = !!existingGame;
  } while (exists);
  
  return roomCode;
};

// Clean up old games
GameSchema.statics.cleanupOldGames = async function(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await this.deleteMany({
    updatedAt: { $lt: oneDayAgo }
  });
};

export default mongoose.model<GameDocument>('Game', GameSchema);