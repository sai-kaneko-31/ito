// Game Types
export interface Game {
  id: string;
  roomCode: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'expressing' | 'arranging' | 'finished';
  theme: string;
  maxPlayers: number;
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  socketId: string;
  cardNumber?: number;
  expression?: string;
  position?: number;
  isReady: boolean;
  joinedAt: Date;
}

export interface GameHistory {
  id: string;
  gameId: string;
  theme: string;
  players: PlayerResult[];
  success: boolean;
  completedAt: Date;
}

export interface PlayerResult {
  name: string;
  cardNumber: number;
  expression: string;
  finalPosition: number;
}

// Socket Event Types
export interface SocketEvents {
  // Client to Server
  'join-room': { roomCode: string; playerName: string };
  'player-ready': { playerId: string };
  'submit-expression': { playerId: string; expression: string };
  'update-positions': { positions: PlayerPosition[] };
  'reveal-cards': {};
  'leave-room': { playerId: string };

  // Server to Client
  'room-joined': { gameState: GameState };
  'player-joined': { player: Player };
  'player-left': { playerId: string };
  'game-started': { gameState: GameState };
  'expression-submitted': { playerId: string };
  'positions-updated': { positions: PlayerPosition[] };
  'game-finished': { result: GameResult };
  'error': { message: string };
}

export interface PlayerPosition {
  playerId: string;
  position: number;
}

export interface GameState {
  game: Game;
  players: Player[];
  theme: string;
  phase: 'waiting' | 'expressing' | 'arranging' | 'revealing' | 'finished';
}

export interface GameResult {
  success: boolean;
  correctOrder: PlayerResult[];
  playerOrder: PlayerResult[];
}

// Theme Types
export interface Theme {
  id: string;
  name: string;
  description: string;
  examples: {
    low: string;
    high: string;
  };
  category: 'temperature' | 'size' | 'speed' | 'weight' | 'height' | 'age' | 'difficulty' | 'popularity';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateGameRequest {
  hostName: string;
  maxPlayers: number;
  themeId?: string;
}

export interface JoinGameRequest {
  roomCode: string;
  playerName: string;
}