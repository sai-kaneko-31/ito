import mongoose, { Schema, Document } from 'mongoose';
import { Player as IPlayer } from '../../../shared/types';

export interface PlayerDocument extends Omit<IPlayer, 'id'>, Document {
  _id: string;
}

const PlayerSchema = new Schema<PlayerDocument>({
  gameId: {
    type: String,
    required: true,
    ref: 'Game'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 20
  },
  socketId: {
    type: String,
    required: true
  },
  cardNumber: {
    type: Number,
    min: 1,
    max: 100
  },
  expression: {
    type: String,
    maxLength: 100,
    trim: true
  },
  position: {
    type: Number,
    min: 1
  },
  isReady: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
PlayerSchema.index({ gameId: 1 });
PlayerSchema.index({ socketId: 1 });

// Static method to get players by game
PlayerSchema.statics.getByGameId = async function(gameId: string): Promise<PlayerDocument[]> {
  return this.find({ gameId }).sort({ joinedAt: 1 });
};

// Static method to assign cards to all players in a game
PlayerSchema.statics.assignCards = async function(gameId: string): Promise<void> {
  const players = await this.find({ gameId });
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  
  // Shuffle the numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  // Assign cards to players
  const updates = players.map((player, index) => ({
    updateOne: {
      filter: { _id: player._id },
      update: { cardNumber: numbers[index] }
    }
  }));
  
  await this.bulkWrite(updates);
};

export default mongoose.model<PlayerDocument>('Player', PlayerSchema);