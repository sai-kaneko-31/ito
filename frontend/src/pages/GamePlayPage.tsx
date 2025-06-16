import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { socketService } from '../services/socket'

export default function GamePlayPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { gameState, currentPlayer, isConnected } = useGameStore()
  const [expression, setExpression] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null)

  useEffect(() => {
    if (!roomCode || !isConnected) {
      navigate('/')
      return
    }

    if (!gameState) {
      navigate(`/room/${roomCode}`)
      return
    }
  }, [roomCode, isConnected, gameState, navigate])

  const handleSubmitExpression = () => {
    if (currentPlayer && expression.trim()) {
      socketService.submitExpression(currentPlayer.id, expression.trim())
      setSubmitted(true)
    }
  }

  const handleRevealCards = () => {
    socketService.revealCards()
  }

  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    setDraggedPlayerId(playerId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault()
    
    if (!draggedPlayerId || draggedPlayerId === targetPlayerId) {
      setDraggedPlayerId(null)
      return
    }

    // Update positions logic would go here
    // For now, just reset the drag
    setDraggedPlayerId(null)
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>ゲームデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  const isHost = currentPlayer.id === gameState.game.hostId
  const myCard = currentPlayer.cardNumber
  const phase = gameState.phase

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            お題: {gameState.theme}
          </h1>
          <p className="text-gray-600">ルーム: {roomCode}</p>
        </div>
      </div>

      {/* My Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">あなたのカード</h2>
        <div className="text-center">
          <div className="inline-block bg-blue-500 text-white text-4xl font-bold p-8 rounded-lg">
            {myCard || '?'}
          </div>
        </div>
      </div>

      {/* Expression Phase */}
      {phase === 'expressing' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">表現を入力してください</h2>
          <div className="space-y-4">
            <textarea
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="お題に合わせて、あなたの数字を表現してください..."
              maxLength={100}
              disabled={submitted}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {expression.length}/100文字
              </span>
              <button
                onClick={handleSubmitExpression}
                disabled={!expression.trim() || submitted}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                {submitted ? '送信済み' : '送信'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players' Expressions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">プレイヤーの表現</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {gameState.players.map(player => (
            <div
              key={player.id}
              draggable={phase === 'arranging'}
              onDragStart={(e) => handleDragStart(e, player.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, player.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                player.id === currentPlayer.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              } ${
                phase === 'arranging' ? 'cursor-move' : ''
              } ${
                draggedPlayerId === player.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{player.name}</span>
                {player.expression && phase === 'expressing' && (
                  <span className="text-green-600 text-sm">✓</span>
                )}
              </div>
              <p className="text-gray-700">
                {player.expression || '表現を入力中...'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Arranging Phase */}
      {phase === 'arranging' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">並び替え</h2>
          <p className="text-gray-600 mb-4">
            カードを上からドラッグして、数字の小さい順に並び替えてください
          </p>
          {isHost && (
            <div className="text-center">
              <button
                onClick={handleRevealCards}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                カードを公開
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back to Room */}
      <div className="text-center">
        <button
          onClick={() => navigate(`/room/${roomCode}`)}
          className="text-gray-500 hover:text-gray-700"
        >
          ← ルームに戻る
        </button>
      </div>
    </div>
  )
}