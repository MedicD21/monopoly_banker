import { randomizePlayerOrder } from "../firebase/randomizePlayerOrder";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  createGame,
  joinGameByCode,
  addPlayer,
  removePlayer,
  updatePlayer,
  startGame as startGameService,
  getGame,
  getPlayer,
  updateGame,
} from "../firebase/gameService";
import {
  subscribeToGame,
  subscribeToPlayers,
  setupPresence,
} from "../firebase/realtimeService";
import {
  Game,
  GameConfig,
  Player,
  GAME_PIECES,
  PLAYER_COLORS,
} from "../types/game";

interface GameContextType {
  game: Game | null;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  addBot?: () => Promise<void>;
  removeBot?: () => Promise<void>;
  setBotAutoPlay?: (playerId: string, auto: boolean) => Promise<void>;

  // Actions
  hostGame: (config: GameConfig) => Promise<void>;
  joinGame: (code: string) => Promise<void>;
  updatePlayerSettings: (
    name: string,
    pieceId: string,
    color: string
  ) => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  leaveGame: () => void;
  updateGameSettings?: (config: Partial<GameConfig>) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const location = useLocation();

  // Store a playerId per game in localStorage: key = digitalbanker_playerId_{gameId}
  const [currentPlayerId, setCurrentPlayerIdState] = useState<string | null>(
    null
  );

  // Helper to get playerId for a game from localStorage
  const getStoredPlayerId = (gameId: string) => {
    return localStorage.getItem(`digitalbanker_playerId_${gameId}`);
  };
  // Helper to set playerId for a game in localStorage
  const setStoredPlayerId = (gameId: string, playerId: string | null) => {
    if (playerId) {
      localStorage.setItem(`digitalbanker_playerId_${gameId}`, playerId);
    } else {
      localStorage.removeItem(`digitalbanker_playerId_${gameId}`);
    }
  };
  const navigate = useNavigate();

  // Set currentPlayerId and persist for a specific game
  const setCurrentPlayerId = (id: string | null, gameId?: string) => {
    setCurrentPlayerIdState(id);
    if (id && gameId) {
      setStoredPlayerId(gameId, id);
    } else if (gameId) {
      setStoredPlayerId(gameId, null);
    }
  };

  const isHost = game?.hostId === currentPlayerId;

  // Subscribe to game updates
  // Restore game state on mount if gameId is in URL and currentPlayerId is set
  useEffect(() => {
    // Try to extract gameId from URL (e.g., /lobby/:gameId or /game/:gameId)
    const match = location.pathname.match(/\/(lobby|game)\/(\w+)/);
    const urlGameId = match ? match[2] : null;
    if (!game && urlGameId) {
      // Fetch game and set in state so subscriptions can start
      getGame(urlGameId).then((fetchedGame) => {
        if (fetchedGame) {
          setGame(fetchedGame);

          // Restore playerId from localStorage for this game
          const storedPlayerId = getStoredPlayerId(urlGameId);
          if (storedPlayerId && !currentPlayerId) {
            setCurrentPlayerIdState(storedPlayerId);
          }
        }
      });
    }
  }, [location.pathname, game, currentPlayerId]);

  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);

      // Navigate to game screen when game starts
      if (updatedGame.status === "playing") {
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
      // Generate a new player ID for the host
      const playerId = `player_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create the game with this playerId as host
      const gameId = await createGame(playerId, config);

      // Store this playerId for this game
      setStoredPlayerId(gameId, playerId);
      setCurrentPlayerId(playerId, gameId);

      // Add host as first player
      await addPlayer(gameId, {
        id: playerId,
        name: "",
        pieceId: "",
        color: "",
        balance: config.startingMoney,
        properties: [],
        isReady: false,
        isHost: true,
        isConnected: true,
        lastSeen: Date.now(),
      });

      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error("Error hosting game:", error);
      alert("Failed to create game. Please try again.");
    }
  };

  const joinGame = async (code: string) => {
    try {
      // Find game by code
      const gameId = await joinGameByCode(code);

      if (!gameId) {
        alert("Game not found. Please check the code and try again.");
        return;
      }

      // Use or generate a playerId for this game
      let playerId = getStoredPlayerId(gameId);
      if (!playerId) {
        playerId = `player_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setStoredPlayerId(gameId, playerId);
      }
      setCurrentPlayerId(playerId, gameId);

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

      // Only add player if not already present
      const existingPlayer = await getPlayer(gameId, playerId);
      if (!existingPlayer) {
        await addPlayer(gameId, {
          id: playerId,
          name: "",
          pieceId: "",
          color: "",
          balance: config.startingMoney,
          properties: [],
          isReady: false,
          isHost: false,
          isConnected: true,
          lastSeen: Date.now(),
        });
      }

      // Navigate to lobby
      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
      alert("Failed to join game. Please try again.");
    }
  };

  const updatePlayerSettings = async (
    name: string,
    pieceId: string,
    color: string
  ) => {
    if (!game?.id || !currentPlayerId) return;

    try {
      await updatePlayer(game.id, currentPlayerId, { name, pieceId, color });
    } catch (error) {
      console.error("Error updating player settings:", error);
      alert("Failed to update settings. Please try again.");
    }
  };

  const toggleReady = async () => {
    if (!game?.id || !currentPlayerId) return;

    try {
      // Fetch the latest player state from Firebase to avoid race conditions
      const currentPlayerData = await getPlayer(game.id, currentPlayerId);
      const currentIsReady = currentPlayerData?.isReady || false;

      await updatePlayer(game.id, currentPlayerId, {
        isReady: !currentIsReady,
      });
    } catch (error) {
      console.error("Error toggling ready:", error);
      alert("Failed to toggle ready status. Please try again.");
    }
  };

  const startGame = async () => {
    if (!game?.id || !isHost) return;

    try {
      await startGameService(game.id);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  const leaveGame = () => {
    if (game?.id) {
      setStoredPlayerId(game.id, null);
    }
    setGame(null);
    setCurrentPlayerId(null);
    navigate("/");
  };

  const updateGameSettings = async (config: Partial<GameConfig>) => {
    if (!game?.id || !isHost) return;

    try {
      await updateGame(game.id, {
        config: { ...game.config, ...config },
      });
    } catch (error) {
      console.error("Error updating game settings:", error);
      alert("Failed to update game settings. Please try again.");
    }
  };

  // Host-only: randomize player order
  const handleRandomizePlayerOrder = async () => {
    if (!isHost || !game?.id) return;
    await randomizePlayerOrder(game.id);
  };

  // Host-only: add a bot player with auto-assigned name/piece/color and auto-ready
  const addBot = async () => {
    if (!isHost || !game?.id) return;

    const botId = `bot_${Date.now()}`;
    const botNames = [
      "CPU Banker",
      "Robo Tycoon",
      "AI Investor",
      "Bot Wheeler",
      "Auto Mogul",
    ];
    const name = botNames[Math.floor(Math.random() * botNames.length)];

    const usedPieces = new Set(players.map((p) => p.pieceId));
    const usedColors = new Set(players.map((p) => p.color));

    const availablePieces = GAME_PIECES.filter((p) => !usedPieces.has(p.id));
    const availableColors = PLAYER_COLORS.filter((c) => !usedColors.has(c));

    const pieceId =
      (availablePieces[0] && availablePieces[0].id) || GAME_PIECES[0].id;
    const color =
      availableColors[0] ||
      PLAYER_COLORS[players.length % PLAYER_COLORS.length] ||
      PLAYER_COLORS[0];

    await addPlayer(game.id, {
      id: botId,
      name,
      pieceId,
      color,
      balance: game.config.startingMoney,
      properties: [],
      isReady: true,
      isHost: false,
      isConnected: true,
      lastSeen: Date.now(),
      isBot: true,
      position: 0,
      botAutoPlay: true,
    });
  };

  // Host-only: remove the most recently added bot
  const removeBot = async () => {
    if (!isHost || !game?.id) return;
    const bot = [...players].reverse().find((p) => p.isBot);
    if (!bot) return;
    await removePlayer(game.id, bot.id);
  };

  const setBotAutoPlay = async (playerId: string, auto: boolean) => {
    if (!isHost || !game?.id) return;
    await updatePlayer(game.id, playerId, { botAutoPlay: auto });
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
    updateGameSettings,
    addBot,
    removeBot,
    setBotAutoPlay,
    randomizePlayerOrder: handleRandomizePlayerOrder,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
