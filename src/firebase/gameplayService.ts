import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './config';
import { updatePlayer, logEvent, updateLastDiceRoll } from './gameService';
import { Property } from '../types/game';

// Update player balance
export async function updatePlayerBalance(
  gameId: string,
  playerId: string,
  newBalance: number
): Promise<void> {
  await updatePlayer(gameId, playerId, { balance: newBalance });
}

// Transfer money between players
export async function transferMoney(
  gameId: string,
  fromPlayerId: string,
  toPlayerId: string,
  amount: number,
  reason?: string
): Promise<void> {
  // This will be handled optimistically - update both players
  // The actual balance calculation should be done before calling this
  await logEvent(gameId, {
    type: 'transaction',
    playerId: fromPlayerId,
    data: {
      from: fromPlayerId,
      to: toPlayerId,
      amount,
      reason: reason || 'payment',
    },
  });
}

// Add property to player
export async function addPropertyToPlayer(
  gameId: string,
  playerId: string,
  property: Property
): Promise<void> {
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  await updateDoc(playerRef, {
    properties: arrayUnion(property),
    lastSeen: Date.now(),
  });

  await logEvent(gameId, {
    type: 'property',
    playerId,
    data: {
      action: 'buy',
      property: property.name,
    },
  });
}

// Remove property from player
export async function removePropertyFromPlayer(
  gameId: string,
  playerId: string,
  propertyName: string
): Promise<void> {
  // Note: arrayRemove requires exact match, so we need to find and remove the property object
  await logEvent(gameId, {
    type: 'property',
    playerId,
    data: {
      action: 'sell',
      property: propertyName,
    },
  });
}

// Update property (add/remove houses, hotel)
export async function updatePropertyOnPlayer(
  gameId: string,
  playerId: string,
  propertyName: string,
  updates: Partial<Property>
): Promise<void> {
  // This requires getting current properties, updating the specific one, and saving back
  // For now, log the event - the actual update will be handled by re-syncing properties
  await logEvent(gameId, {
    type: 'property',
    playerId,
    data: {
      action: 'update',
      property: propertyName,
      updates,
    },
  });
}

// Record dice roll
export async function recordDiceRoll(
  gameId: string,
  playerId: string,
  dice: number[]
): Promise<void> {
  const total = dice.reduce((sum, die) => sum + die, 0);

  await updateLastDiceRoll(gameId, total);

  await logEvent(gameId, {
    type: 'dice',
    playerId,
    data: {
      dice,
      total,
    },
  });
}

// Pass GO - collect money
export async function passGo(
  gameId: string,
  playerId: string,
  amount: number
): Promise<void> {
  await logEvent(gameId, {
    type: 'passGo',
    playerId,
    data: {
      amount,
    },
  });
}

// Reset game
export async function resetGame(gameId: string, startingBalance: number): Promise<void> {
  await logEvent(gameId, {
    type: 'transaction',
    playerId: 'system',
    data: {
      action: 'reset',
      startingBalance,
    },
  });
}
