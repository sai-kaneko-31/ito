import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { socketService } from '../services/socket'

export default function GameRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { gameState, currentPlayer, isConnected, error } = useGameStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!roomCode) {
      navigate('/')
      return
    }

    // If not connected, redirect to join page
    if (!isConnected) {
      navigate('/join')
      return
    }

    // Listen for game start
    if (gameState?.phase === 'expressing') {
      navigate(`/game/${roomCode}`)
    }
  }, [roomCode, isConnected, gameState, navigate])

  const handleReady = () => {
    if (currentPlayer && !isReady) {
      socketService.setPlayerReady(currentPlayer.id)
      setIsReady(true)
    }
  }

  const handleLeave = () => {
    socketService.disconnect()
    navigate('/')
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>ゲームルームに接続中...</p>
        </div>
      </div>
    )
  }

  const isHost = currentPlayer.id === gameState.game.hostId
  const allPlayersReady = gameState.players.every(p => p.isReady)
  const canStart = gameState.players.length >= 2 && allPlayersReady

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ルーム: {roomCode}
          </h1>
          <p className="text-gray-600">お題: {gameState.theme}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            プレイヤー ({gameState.players.length}/{gameState.game.maxPlayers})
          </h2>
          <div className="space-y-2">
            {gameState.players.map(player => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === currentPlayer.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{player.name}</span>
                  {player.id === gameState.game.hostId && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      ホスト
                    </span>
                  )}
                  {player.id === currentPlayer.id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      あなた
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {player.isReady ? (
                    <span className="text-green-600 text-sm">✓ 準備完了</span>
                  ) : (
                    <span className="text-gray-400 text-sm">待機中</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {!isReady && (
            <button
              onClick={handleReady}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              準備完了
            </button>
          )}

          {isHost && canStart && (
            <div className="text-center">
              <p className="text-green-600 font-medium">
                全員準備完了！ゲームが自動的に開始されます...
              </p>
            </div>
          )}

          {isHost && !canStart && (
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {gameState.players.length < 2 
                  ? '最低2人のプレイヤーが必要です' 
                  : '全員の準備完了を待っています'
                }
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t flex justify-between">
          <button
            onClick={handleLeave}
            className="text-red-500 hover:text-red-700"
          >
            ゲームを退出
          </button>
          <div className="text-sm text-gray-500">
            ルームコードを他の人に共有してゲームに招待しましょう
          </div>
        </div>
      </div>
    </div>
  )
}