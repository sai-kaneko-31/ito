import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socketService } from '../services/socket'

export default function JoinGamePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!roomCode.trim()) {
      setError('ルームコードを入力してください')
      return
    }
    
    if (!playerName.trim()) {
      setError('名前を入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const code = roomCode.trim().toUpperCase()
      
      // Check if game exists via API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/games/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerName: playerName.trim()
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'ゲームへの参加に失敗しました')
      }

      // Connect to socket and join room
      await socketService.connect()
      socketService.joinRoom(code, playerName.trim())
      
      // Navigate to room
      navigate(`/room/${code}`)

    } catch (error) {
      console.error('Error joining game:', error)
      setError(error instanceof Error ? error.message : 'ゲームへの参加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setRoomCode(value)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ゲームに参加
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              ルームコード
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-wider font-mono"
              placeholder="ABC123"
              maxLength={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">6文字のコードを入力してください</p>
          </div>

          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              あなたの名前
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名前を入力"
              maxLength={20}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || roomCode.length !== 6}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            {loading ? '参加中...' : 'ゲームに参加'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}