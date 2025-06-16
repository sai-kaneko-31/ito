import { Socket, Server } from 'socket.io';
import Game from '../models/Game';
import Player from '../models/Player';
import { SocketEvents, GameState, PlayerPosition } from '../../../shared/types';

export const handleGameEvents = (io: Server, socket: Socket) => {
  
  // Join room
  socket.on('join-room', async (data: SocketEvents['join-room']) => {
    try {
      const { roomCode, playerName } = data;
      
      const game = await Game.findOne({ roomCode: roomCode.toUpperCase() });
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (game.status !== 'waiting') {
        socket.emit('error', { message: 'Game has already started' });
        return;
      }

      const existingPlayers = await Player.find({ gameId: game._id.toString() });
      if (existingPlayers.length >= game.maxPlayers) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }

      // Check if name is already taken
      const nameExists = existingPlayers.some(player => 
        player.name.toLowerCase() === playerName.trim().toLowerCase()
      );
      if (nameExists) {
        socket.emit('error', { message: 'Player name already taken' });
        return;
      }

      // Create player
      const player = new Player({
        gameId: game._id.toString(),
        name: playerName.trim(),
        socketId: socket.id
      });
      await player.save();

      // Set host if this is the first player
      if (existingPlayers.length === 0) {
        game.hostId = player._id.toString();
        await game.save();
      }

      // Join socket room
      socket.join(roomCode);

      // Get updated game state
      const updatedPlayers = await Player.find({ gameId: game._id.toString() });
      const gameState: GameState = {
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
        players: updatedPlayers.map(p => ({
          id: p._id.toString(),
          gameId: p.gameId,
          name: p.name,
          socketId: p.socketId,
          cardNumber: p.cardNumber,
          expression: p.expression,
          position: p.position,
          isReady: p.isReady,
          joinedAt: p.createdAt
        })),
        theme: game.theme,
        phase: 'waiting'
      };

      // Notify player they joined
      socket.emit('room-joined', { gameState });

      // Notify others in the room
      socket.to(roomCode).emit('player-joined', { 
        player: {
          id: player._id.toString(),
          gameId: player.gameId,
          name: player.name,
          socketId: player.socketId,
          cardNumber: player.cardNumber,
          expression: player.expression,
          position: player.position,
          isReady: player.isReady,
          joinedAt: player.createdAt
        }
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Player ready
  socket.on('player-ready', async (data: SocketEvents['player-ready']) => {
    try {
      const { playerId } = data;
      
      const player = await Player.findById(playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      player.isReady = true;
      await player.save();

      const game = await Game.findById(player.gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if all players are ready
      const allPlayers = await Player.find({ gameId: game._id.toString() });
      const allReady = allPlayers.length >= 2 && allPlayers.every(p => p.isReady);

      if (allReady) {
        // Start game
        game.status = 'expressing';
        await game.save();

        // Assign cards to all players
        await (Player as any).assignCards(game._id.toString());

        // Get updated game state with cards
        const updatedPlayers = await Player.find({ gameId: game._id.toString() });
        const gameState: GameState = {
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
          players: updatedPlayers.map(p => ({
            id: p._id.toString(),
            gameId: p.gameId,
            name: p.name,
            socketId: p.socketId,
            cardNumber: p.cardNumber,
            expression: p.expression,
            position: p.position,
            isReady: p.isReady,
            joinedAt: p.createdAt
          })),
          theme: game.theme,
          phase: 'expressing'
        };

        io.to(game.roomCode).emit('game-started', { gameState });
      }

    } catch (error) {
      console.error('Error setting player ready:', error);
      socket.emit('error', { message: 'Failed to set ready status' });
    }
  });

  // Submit expression
  socket.on('submit-expression', async (data: SocketEvents['submit-expression']) => {
    try {
      const { playerId, expression } = data;
      
      const player = await Player.findById(playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      player.expression = expression.trim();
      await player.save();

      const game = await Game.findById(player.gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Notify room that expression was submitted
      io.to(game.roomCode).emit('expression-submitted', { playerId });

      // Check if all players have submitted expressions
      const allPlayers = await Player.find({ gameId: game._id.toString() });
      const allSubmitted = allPlayers.every(p => p.expression && p.expression.trim() !== '');

      if (allSubmitted) {
        game.status = 'arranging';
        await game.save();

        const gameState: GameState = {
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
          players: allPlayers.map(p => ({
            id: p._id.toString(),
            gameId: p.gameId,
            name: p.name,
            socketId: p.socketId,
            cardNumber: p.cardNumber,
            expression: p.expression,
            position: p.position,
            isReady: p.isReady,
            joinedAt: p.createdAt
          })),
          theme: game.theme,
          phase: 'arranging'
        };

        io.to(game.roomCode).emit('game-started', { gameState });
      }

    } catch (error) {
      console.error('Error submitting expression:', error);
      socket.emit('error', { message: 'Failed to submit expression' });
    }
  });

  // Update positions
  socket.on('update-positions', async (data: SocketEvents['update-positions']) => {
    try {
      const { positions } = data;
      
      // Update player positions
      const updates = positions.map(pos => ({
        updateOne: {
          filter: { _id: pos.playerId },
          update: { position: pos.position }
        }
      }));

      await Player.bulkWrite(updates);

      // Get the game from first player's position
      const firstPlayer = await Player.findById(positions[0].playerId);
      if (!firstPlayer) return;

      const game = await Game.findById(firstPlayer.gameId);
      if (!game) return;

      // Notify room of position updates
      io.to(game.roomCode).emit('positions-updated', { positions });

    } catch (error) {
      console.error('Error updating positions:', error);
      socket.emit('error', { message: 'Failed to update positions' });
    }
  });

  // Reveal cards
  socket.on('reveal-cards', async () => {
    try {
      const player = await Player.findOne({ socketId: socket.id });
      if (!player) return;

      const game = await Game.findById(player.gameId);
      if (!game) return;

      // Only host can reveal cards
      if (game.hostId !== player._id.toString()) {
        socket.emit('error', { message: 'Only host can reveal cards' });
        return;
      }

      game.status = 'finished';
      await game.save();

      // Get all players with their final positions
      const allPlayers = await Player.find({ gameId: game._id.toString() })
        .sort({ position: 1 });

      // Check if positions are correct
      const correctOrder = [...allPlayers].sort((a, b) => (a.cardNumber || 0) - (b.cardNumber || 0));
      const playerOrder = [...allPlayers].sort((a, b) => (a.position || 0) - (b.position || 0));
      
      const success = playerOrder.every((player, index) => 
        player._id.toString() === correctOrder[index]._id.toString()
      );

      const result = {
        success,
        correctOrder: correctOrder.map(p => ({
          name: p.name,
          cardNumber: p.cardNumber || 0,
          expression: p.expression || '',
          finalPosition: p.position || 0
        })),
        playerOrder: playerOrder.map(p => ({
          name: p.name,
          cardNumber: p.cardNumber || 0,
          expression: p.expression || '',
          finalPosition: p.position || 0
        }))
      };

      io.to(game.roomCode).emit('game-finished', { result });

    } catch (error) {
      console.error('Error revealing cards:', error);
      socket.emit('error', { message: 'Failed to reveal cards' });
    }
  });

  // Leave room
  socket.on('disconnect', async () => {
    try {
      const player = await Player.findOne({ socketId: socket.id });
      if (!player) return;

      const game = await Game.findById(player.gameId);
      if (!game) return;

      // Remove player
      await Player.findByIdAndDelete(player._id);

      // Notify room
      io.to(game.roomCode).emit('player-left', { playerId: player._id.toString() });

      // If this was the host, transfer host to another player
      if (game.hostId === player._id.toString()) {
        const remainingPlayers = await Player.find({ gameId: game._id.toString() });
        if (remainingPlayers.length > 0) {
          game.hostId = remainingPlayers[0]._id.toString();
          await game.save();
        } else {
          // No players left, delete the game
          await Game.findByIdAndDelete(game._id);
        }
      }

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
};