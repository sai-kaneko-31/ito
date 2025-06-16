import { Router } from 'express';
import Game from '../models/Game';
import Player from '../models/Player';
import { getRandomTheme, getThemeById } from '../data/themes';
import { CreateGameRequest, JoinGameRequest, ApiResponse } from '../../../shared/types';

const router = Router();

// Create a new game
router.post('/', async (req, res) => {
  try {
    const { hostName, maxPlayers, themeId }: CreateGameRequest = req.body;

    if (!hostName || !hostName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Host name is required'
      } as ApiResponse<null>);
    }

    const theme = themeId ? getThemeById(themeId) : getRandomTheme();
    if (!theme) {
      return res.status(400).json({
        success: false,
        error: 'Invalid theme ID'
      } as ApiResponse<null>);
    }

    const roomCode = await (Game as any).generateRoomCode();
    
    const game = new Game({
      roomCode,
      hostId: '', // Will be set when host joins via socket
      theme: theme.name,
      maxPlayers: maxPlayers || 6
    });

    await game.save();

    res.json({
      success: true,
      data: {
        gameId: game._id,
        roomCode: game.roomCode,
        theme: theme
      }
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    } as ApiResponse<null>);
  }
});

// Get game by room code
router.get('/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;

    const game = await Game.findOne({ roomCode: roomCode.toUpperCase() });
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      } as ApiResponse<null>);
    }

    const players = await Player.find({ gameId: game._id.toString() });

    res.json({
      success: true,
      data: {
        game: {
          id: game._id.toString(),
          roomCode: game.roomCode,
          hostId: game.hostId,
          status: game.status,
          theme: game.theme,
          maxPlayers: game.maxPlayers,
          currentRound: game.currentRound,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt
        },
        players: players.map(player => ({
          id: player._id.toString(),
          gameId: player.gameId,
          name: player.name,
          socketId: player.socketId,
          cardNumber: player.cardNumber,
          expression: player.expression,
          position: player.position,
          isReady: player.isReady,
          joinedAt: player.createdAt
        }))
      }
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game'
    } as ApiResponse<null>);
  }
});

// Join game
router.post('/:roomCode/join', async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { playerName }: { playerName: string } = req.body;

    if (!playerName || !playerName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      } as ApiResponse<null>);
    }

    const game = await Game.findOne({ roomCode: roomCode.toUpperCase() });
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      } as ApiResponse<null>);
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'Game has already started'
      } as ApiResponse<null>);
    }

    const existingPlayers = await Player.find({ gameId: game._id.toString() });
    if (existingPlayers.length >= game.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'Game is full'
      } as ApiResponse<null>);
    }

    // Check if name is already taken
    const nameExists = existingPlayers.some(player => 
      player.name.toLowerCase() === playerName.trim().toLowerCase()
    );
    if (nameExists) {
      return res.status(400).json({
        success: false,
        error: 'Player name already taken'
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: {
        gameId: game._id.toString(),
        message: 'Ready to join game'
      }
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join game'
    } as ApiResponse<null>);
  }
});

export default router;