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
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
  randomizePlayerOrder: () => Promise<void>;
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
      const sorted = [...updatedPlayers].sort((a, b) => {
        const aOrder =
          typeof (a as any).order === "number" ? (a as any).order : Number.MAX_SAFE_INTEGER;
        const bOrder =
          typeof (b as any).order === "number" ? (b as any).order : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });
      setPlayers(sorted);
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
        getOutOfJailFree: 0,
      });

      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error("Error hosting game:", error);
      alert("Failed to create game. Please try again.");
    }
  };

  const joinGame = async (code: string) => {
    try {
      // Trim/normalize code
      const normalizedCode = (code || "").trim();

      // Find game by code
      const gameId = await joinGameByCode(normalizedCode);

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
          getOutOfJailFree: 0,
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
    if (!game?.id || !currentPlayerId) {
      alert("Player not identified. Please rejoin the lobby and try again.");
      return;
    }

    try {
      const playerRef = doc(db, "games", game.id, "players", currentPlayerId);
      const snap = await getDoc(playerRef);
      const now = Date.now();
      const startingMoney = game?.config?.startingMoney ?? 1500;
      const isHostFlag = game?.hostId === currentPlayerId;
      const currentIsReady = snap.exists() ? Boolean(snap.data()?.isReady) : false;
      const newValue = !currentIsReady;

      // Use setDoc with merge to avoid precondition failures
      await setDoc(
        playerRef,
        {
          id: currentPlayerId,
          name: snap.data()?.name ?? "",
          pieceId: snap.data()?.pieceId ?? "",
          color: snap.data()?.color ?? "",
          balance: snap.data()?.balance ?? startingMoney,
          properties: snap.data()?.properties ?? [],
          isReady: newValue,
          isHost: snap.data()?.isHost ?? isHostFlag,
          isConnected: true,
          lastSeen: now,
          order: snap.data()?.order ?? null,
          getOutOfJailFree: snap.data()?.getOutOfJailFree ?? 0,
        },
        { merge: true }
      );

      // Optimistically update local state so the UI reflects readiness immediately
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentPlayerId ? { ...p, isReady: newValue } : p
        )
      );
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
    randomizePlayerOrder: handleRandomizePlayerOrder,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
