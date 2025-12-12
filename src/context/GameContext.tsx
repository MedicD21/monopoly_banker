import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createGame,
  joinGameByCode,
  addPlayer,
  updatePlayer,
  startGame as startGameService,
  getGame
} from '../firebase/gameService';
import { subscribeToGame, subscribeToPlayers, setupPresence } from '../firebase/realtimeService';

interface Player {
  id: string;
  name: string;
  pieceId: string;
  color: string;
  balance: number;
  properties: any[];
  isReady?: boolean;
  isHost?: boolean;
  isConnected: boolean;
  lastSeen: number;
}

interface GameConfig {
  startingMoney: number;
  passGoAmount: number;
  freeParkingJackpot: boolean;
  doubleGoOnLanding: boolean;
  auctionProperties: boolean;
  speedDie: boolean;
}

interface Game {
  id: string;
  code: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  config: GameConfig;
  currentTurn?: string;
  createdAt: number;
}

interface GameContextType {
  game: Game | null;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;

  // Actions
  hostGame: (config: GameConfig) => Promise<void>;
  joinGame: (code: string) => Promise<void>;
  updatePlayerSettings: (name: string, pieceId: string, color: string) => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const navigate = useNavigate();

  const isHost = game?.hostId === currentPlayerId;

  // Subscribe to game updates
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);

      // Navigate to game screen when game starts
      if (updatedGame.status === 'playing') {
        navigate(`/game/${updatedGame.id}`);
      }
    });

    return () => unsubscribe();
  }, [game?.id, navigate]);

  // Subscribe to players updates
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToPlayers(game.id, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => unsubscribe();
  }, [game?.id]);

  // Setup presence detection
  useEffect(() => {
    if (!game?.id || !currentPlayerId) return;

    setupPresence(game.id, currentPlayerId);
  }, [game?.id, currentPlayerId]);

  const hostGame = async (config: GameConfig) => {
    try {
      // Generate a temporary player ID for the host
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentPlayerId(playerId);

      // Create the game
      const gameId = await createGame(playerId, config);

      // Add host as first player
      await addPlayer(gameId, {
        id: playerId,
        name: '',
        pieceId: '',
        color: '',
        balance: config.startingMoney,
        properties: [],
        isReady: false,
        isHost: true,
        isConnected: true,
        lastSeen: Date.now(),
      });

      // Navigate to lobby
      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error('Error hosting game:', error);
      alert('Failed to create game. Please try again.');
    }
  };

  const joinGame = async (code: string) => {
    try {
      // Generate a temporary player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentPlayerId(playerId);

      // Find game by code
      const gameId = await joinGameByCode(code);

      if (!gameId) {
        alert('Game not found. Please check the code and try again.');
        return;
      }

      // Get game config
      const gameData = await getGame(gameId);
      const config = gameData?.config || {
        startingMoney: 1500,
        passGoAmount: 200,
        freeParkingJackpot: false,
        doubleGoOnLanding: false,
        auctionProperties: false,
        speedDie: false,
      };

      // Add player to game
      await addPlayer(gameId, {
        id: playerId,
        name: '',
        pieceId: '',
        color: '',
        balance: config.startingMoney,
        properties: [],
        isReady: false,
        isHost: false,
        isConnected: true,
        lastSeen: Date.now(),
      });

      // Navigate to lobby
      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
    }
  };

  const updatePlayerSettings = async (name: string, pieceId: string, color: string) => {
    if (!game?.id || !currentPlayerId) return;

    try {
      await updatePlayer(game.id, currentPlayerId, { name, pieceId, color });
    } catch (error) {
      console.error('Error updating player settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  const toggleReady = async () => {
    if (!game?.id || !currentPlayerId) return;

    try {
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      await updatePlayer(game.id, currentPlayerId, { isReady: !currentPlayer?.isReady });
    } catch (error) {
      console.error('Error toggling ready:', error);
      alert('Failed to toggle ready status. Please try again.');
    }
  };

  const startGame = async () => {
    if (!game?.id || !isHost) return;

    try {
      await startGameService(game.id);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const leaveGame = () => {
    setGame(null);
    setCurrentPlayerId(null);
    navigate('/');
  };

  const value: GameContextType = {
    game,
    players,
    currentPlayerId,
    isHost,
    hostGame,
    joinGame,
    updatePlayerSettings,
    toggleReady,
    startGame,
    leaveGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
