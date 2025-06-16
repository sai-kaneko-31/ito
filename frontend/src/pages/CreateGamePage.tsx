import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socketService } from '../services/socket'

interface Theme {
  id: string
  name: string
  description: string
}

export default function CreateGamePage() {
  const navigate = useNavigate()
  const [hostName, setHostName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hostName.trim()) {
      setError('名前を入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create game via API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostName: hostName.trim(),
          maxPlayers
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'ゲームの作成に失敗しました')
      }

      // Connect to socket and join room
      await socketService.connect()
      socketService.joinRoom(data.data.roomCode, hostName.trim())
      
      // Navigate to room
      navigate(`/room/${data.data.roomCode}`)

    } catch (error) {
      console.error('Error creating game:', error)
      setError(error instanceof Error ? error.message : 'ゲームの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ゲームを作成
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-2">
              あなたの名前
            </label>
            <input
              type="text"
              id="hostName"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名前を入力"
              maxLength={20}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2">
              最大プレイヤー数
            </label>
            <select
              id="maxPlayers"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}人</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            {loading ? '作成中...' : 'ゲームを作成'}
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