import { io, Socket } from 'socket.io-client'
import { SocketEvents } from '../../../shared/types'
import { useGameStore } from '../store/gameStore'

class SocketService {
  private socket: Socket | null = null
  private gameStore = useGameStore.getState()

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
        
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling']
        })

        this.socket.on('connect', () => {
          console.log('Connected to server:', this.socket?.id)
          this.gameStore.setIsConnected(true)
          this.gameStore.setError(null)
          resolve()
        })

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server')
          this.gameStore.setIsConnected(false)
        })

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error)
          this.gameStore.setError('Failed to connect to server')
          reject(error)
        })

        this.setupEventListeners()

      } catch (error) {
        reject(error)
      }
    })
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Game event listeners
    this.socket.on('room-joined', (data) => {
      console.log('Room joined:', data)
      this.gameStore.setGameState(data.gameState)
    })

    this.socket.on('player-joined', (data) => {
      console.log('Player joined:', data)
      this.gameStore.addPlayer(data.player)
    })

    this.socket.on('player-left', (data) => {
      console.log('Player left:', data)
      this.gameStore.removePlayer(data.playerId)
    })

    this.socket.on('game-started', (data) => {
      console.log('Game started:', data)
      this.gameStore.setGameState(data.gameState)
    })

    this.socket.on('expression-submitted', (data) => {
      console.log('Expression submitted:', data)
      this.gameStore.updatePlayer(data.playerId, { expression: '✓' })
    })

    this.socket.on('positions-updated', (data) => {
      console.log('Positions updated:', data)
      // Update player positions in store
      data.positions.forEach((pos: any) => {
        this.gameStore.updatePlayer(pos.playerId, { position: pos.position })
      })
    })

    this.socket.on('game-finished', (data) => {
      console.log('Game finished:', data)
      // Handle game completion
    })

    this.socket.on('error', (data) => {
      console.error('Socket error:', data)
      this.gameStore.setError(data.message)
    })
  }

  // Emit events
  joinRoom(roomCode: string, playerName: string) {
    if (!this.socket) throw new Error('Socket not connected')
    this.socket.emit('join-room', { roomCode, playerName })
  }

  setPlayerReady(playerId: string) {
    if (!this.socket) throw new Error('Socket not connected')
    this.socket.emit('player-ready', { playerId })
  }

  submitExpression(playerId: string, expression: string) {
    if (!this.socket) throw new Error('Socket not connected')
    this.socket.emit('submit-expression', { playerId, expression })
  }

  updatePositions(positions: { playerId: string; position: number }[]) {
    if (!this.socket) throw new Error('Socket not connected')
    this.socket.emit('update-positions', { positions })
  }

  revealCards() {
    if (!this.socket) throw new Error('Socket not connected')
    this.socket.emit('reveal-cards')
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.gameStore.setIsConnected(false)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()