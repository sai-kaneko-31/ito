import { create } from 'zustand'
import { GameState, Player, Game } from '../../../shared/types'

interface GameStore {
  // State
  currentGame: Game | null
  currentPlayer: Player | null
  players: Player[]
  gameState: GameState | null
  isConnected: boolean
  error: string | null
  
  // Actions
  setCurrentGame: (game: Game | null) => void
  setCurrentPlayer: (player: Player | null) => void
  setPlayers: (players: Player[]) => void
  setGameState: (gameState: GameState | null) => void
  setIsConnected: (connected: boolean) => void
  setError: (error: string | null) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentGame: null,
  currentPlayer: null,
  players: [],
  gameState: null,
  isConnected: false,
  error: null,

  // Actions
  setCurrentGame: (game) => set({ currentGame: game }),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  setPlayers: (players) => set({ players }),
  
  setGameState: (gameState) => {
    set({ gameState })
    if (gameState) {
      set({ 
        currentGame: gameState.game,
        players: gameState.players
      })
    }
  },
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  setError: (error) => set({ error }),
  
  addPlayer: (player) => {
    const { players } = get()
    set({ players: [...players, player] })
  },
  
  removePlayer: (playerId) => {
    const { players } = get()
    set({ players: players.filter(p => p.id !== playerId) })
  },
  
  updatePlayer: (playerId, updates) => {
    const { players } = get()
    set({
      players: players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      )
    })
  },
  
  reset: () => set({
    currentGame: null,
    currentPlayer: null,
    players: [],
    gameState: null,
    isConnected: false,
    error: null
  })
}))