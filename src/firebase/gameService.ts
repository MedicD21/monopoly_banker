import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";
import { Game, GameConfig, Player, GameEvent } from "../types/game";

// Generate a unique 5-digit game code
export async function generateGameCode(): Promise<string> {
  let code: string;
  let exists = true;

  while (exists) {
    code = Math.floor(10000 + Math.random() * 90000).toString();
    const q = query(collection(db, "games"), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    exists = !querySnapshot.empty;
  }

  return code!;
}

// Create a new game
export async function createGame(
  hostId: string,
  config: GameConfig
): Promise<string> {
  const code = await generateGameCode();
  const gameRef = doc(collection(db, "games"));
  const gameId = gameRef.id;

  const gameData: Omit<Game, "id"> = {
    code,
    hostId,
    status: "lobby",
    config,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  await setDoc(gameRef, gameData);
  return gameId;
}

// Join a game by code
export async function joinGameByCode(code: string): Promise<string | null> {
  const q = query(collection(db, "games"), where("code", "==", code));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const gameDoc = querySnapshot.docs[0];
  const game = gameDoc.data() as Game;

  if (game.status !== "lobby") {
    throw new Error("Game has already started");
  }

  return gameDoc.id;
}

// Add a player to a game
export async function addPlayer(
  gameId: string,
  playerData: Player
): Promise<void> {
  const playerRef = doc(db, "games", gameId, "players", playerData.id);

  // Get current player count to assign order
  const playersRef = collection(db, "games", gameId, "players");
  const playersSnap = await getDocs(playersRef);
  const playerCount = playersSnap.size;

  await setDoc(playerRef, {
    ...playerData,
    isConnected: true,
    lastSeen: Date.now(),
    position: playerData.position ?? 0,
    order: (playerData as any).order ?? playerCount, // Ensure order field exists
  });
}

// Update player data
export async function updatePlayer(
  gameId: string,
  playerId: string,
  updates: Partial<Player>
): Promise<void> {
  const playerRef = doc(db, "games", gameId, "players", playerId);
  await updateDoc(playerRef, {
    ...updates,
    lastSeen: Date.now(),
  });
}

// Remove a player (used for removing bots)
export async function removePlayer(
  gameId: string,
  playerId: string
): Promise<void> {
  const playerRef = doc(db, "games", gameId, "players", playerId);
  await deleteDoc(playerRef);
}

// Get game data
export async function getGame(gameId: string): Promise<Game | null> {
  const gameRef = doc(db, "games", gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    return null;
  }

  return { id: gameSnap.id, ...gameSnap.data() } as Game;
}

// Update game status
export async function updateGameStatus(
  gameId: string,
  status: "lobby" | "playing" | "ended"
): Promise<void> {
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    status,
    lastActivity: Date.now(),
  });
}

// Update game
export async function updateGame(
  gameId: string,
  updates: Partial<Game>
): Promise<void> {
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    ...updates,
    lastActivity: Date.now(),
  });
}

// Log a game event
export async function logEvent(
  gameId: string,
  event: Omit<GameEvent, "id" | "timestamp">
): Promise<void> {
  const eventsRef = collection(db, "games", gameId, "events");
  await addDoc(eventsRef, {
    ...event,
    timestamp: Date.now(),
  });
}

// Update dice roll (for utility rent calculations)
export async function updateLastDiceRoll(
  gameId: string,
  total: number
): Promise<void> {
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    lastDiceRoll: total,
    lastActivity: Date.now(),
  });
}

// Start the game
export async function startGame(gameId: string): Promise<void> {
  await updateGameStatus(gameId, "playing");
}

// Get a player document
export async function getPlayer(
  gameId: string,
  playerId: string
): Promise<Player | null> {
  const playerRef = doc(db, "games", gameId, "players", playerId);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) return null;
  return { id: playerSnap.id, ...playerSnap.data() } as Player;
}
