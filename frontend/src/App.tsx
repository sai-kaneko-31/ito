import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateGamePage from './pages/CreateGamePage'
import JoinGamePage from './pages/JoinGamePage'
import GameRoomPage from './pages/GameRoomPage'
import GamePlayPage from './pages/GamePlayPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateGamePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/room/:roomCode" element={<GameRoomPage />} />
          <Route path="/game/:roomCode" element={<GamePlayPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
