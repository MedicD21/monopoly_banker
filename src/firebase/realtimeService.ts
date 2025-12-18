import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, onDisconnect, set, onValue } from 'firebase/database';
import { db, realtimeDb } from './config';
import { Game, Player, GameEvent } from '../types/game';

// Listen to game updates
export function subscribeToGame(
  gameId: string,
  callback: (game: Game) => void
): Unsubscribe {
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Game);
    }
  });
}

// Listen to players in a game
export function subscribeToPlayers(
  gameId: string,
  callback: (players: Player[]) => void
): Unsubscribe {
  const playersRef = collection(db, 'games', gameId, 'players');
  const q = query(playersRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const players: Player[] = [];
    snapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() } as Player);
    });
    callback(players);
  });
}

// Listen to game events
export function subscribeToEvents(
  gameId: string,
  callback: (events: GameEvent[]) => void
): Unsubscribe {
  const eventsRef = collection(db, 'games', gameId, 'events');
  const q = query(eventsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const events: GameEvent[] = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as GameEvent);
    });
    callback(events);
  });
}

// Set up presence detection for a player
export function setupPresence(gameId: string, playerId: string): void {
  const presenceRef = ref(realtimeDb, `games/${gameId}/players/${playerId}/presence`);

  // Set up disconnect handler
  onDisconnect(presenceRef).set({
    isConnected: false,
    lastSeen: Date.now(),
  });

  // Set player as connected
  set(presenceRef, {
    isConnected: true,
    lastSeen: Date.now(),
  });

  // Update presence periodically
  const interval = setInterval(() => {
    set(presenceRef, {
      isConnected: true,
      lastSeen: Date.now(),
    });
  }, 30000); // Update every 30 seconds

  // Clean up interval when page unloads
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
  });
}
