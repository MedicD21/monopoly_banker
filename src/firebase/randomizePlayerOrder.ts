import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { Player } from "../types/game";

// Randomize player order in Firestore by re-writing all player docs with new order
export async function randomizePlayerOrder(gameId: string): Promise<void> {
  const playersRef = collection(db, "games", gameId, "players");
  const snapshot = await getDocs(playersRef);
  const players: Player[] = [];
  snapshot.forEach((doc) => {
    players.push({ id: doc.id, ...doc.data() } as Player);
  });
  // Shuffle players array
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  // Write new order to Firestore (add an 'order' field)
  const batch = writeBatch(db);
  players.forEach((player, idx) => {
    const playerRef = doc(db, "games", gameId, "players", String(player.id));
    batch.update(playerRef, { order: idx });
  });
  await batch.commit();
}
