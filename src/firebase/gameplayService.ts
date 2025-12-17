import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
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
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const playerSnap = await getDoc(playerRef);

  if (playerSnap.exists()) {
    const playerData = playerSnap.data();
    const properties = playerData.properties || [];
    const updatedProperties = properties.filter((p: Property) => p.name !== propertyName);

    await updateDoc(playerRef, {
      properties: updatedProperties,
      lastSeen: Date.now(),
    });
  }

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
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const playerSnap = await getDoc(playerRef);

  if (playerSnap.exists()) {
    const playerData = playerSnap.data();
    const properties = playerData.properties || [];
    const updatedProperties = properties.map((p: Property) =>
      p.name === propertyName ? { ...p, ...updates } : p
    );

    await updateDoc(playerRef, {
      properties: updatedProperties,
      lastSeen: Date.now(),
    });
  }

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

// Mortgage a property
export async function mortgageProperty(
  gameId: string,
  playerId: string,
  propertyName: string,
  mortgageValue: number,
  newBalance?: number
): Promise<void> {
  // Update property to mortgaged status
  await updatePropertyOnPlayer(gameId, playerId, propertyName, {
    mortgaged: true,
  });

  // Give player half the property value (absolute balance if provided, else add)
  if (typeof newBalance === 'number') {
    await updatePlayerBalance(gameId, playerId, newBalance);
  } else {
    await updatePlayerBalance(gameId, playerId, mortgageValue);
  }

  await logEvent(gameId, {
    type: 'property',
    playerId,
    data: {
      action: 'mortgage',
      property: propertyName,
      amount: mortgageValue,
    },
  });
}

// Unmortgage a property
export async function unmortgageProperty(
  gameId: string,
  playerId: string,
  propertyName: string,
  unmortgageCost: number,
  newBalance?: number
): Promise<void> {
  // Update property to unmortgaged status
  await updatePropertyOnPlayer(gameId, playerId, propertyName, {
    mortgaged: false,
  });

  // Charge player the unmortgage cost (mortgage value + 10%)
  if (typeof newBalance === 'number') {
    await updatePlayerBalance(gameId, playerId, newBalance);
  } else {
    await updatePlayerBalance(gameId, playerId, -unmortgageCost);
  }

  await logEvent(gameId, {
    type: 'property',
    playerId,
    data: {
      action: 'unmortgage',
      property: propertyName,
      amount: unmortgageCost,
    },
  });
}

// Add money to Free Parking
export async function addToFreeParking(
  gameId: string,
  amount: number
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (gameSnap.exists()) {
    const gameData = gameSnap.data();
    const currentBalance = gameData.freeParkingBalance || 0;

    await updateDoc(gameRef, {
      freeParkingBalance: currentBalance + amount,
      lastActivity: Date.now(),
    });
  }

  await logEvent(gameId, {
    type: 'transaction',
    playerId: 'system',
    data: {
      action: 'addToFreeParking',
      amount,
    },
  });
}

// Claim Free Parking money
export async function claimFreeParking(
  gameId: string,
  playerId: string
): Promise<number> {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) return 0;

  const gameData = gameSnap.data();
  const amount = gameData.freeParkingBalance || 0;

  if (amount > 0) {
    // Get current player balance
    const playerRef = doc(db, 'games', gameId, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (playerSnap.exists()) {
      const currentBalance = playerSnap.data().balance || 0;
      const newBalance = currentBalance + amount;

      // Give money to player
      await updatePlayerBalance(gameId, playerId, newBalance);
    }

    // Reset Free Parking balance
    await updateDoc(gameRef, {
      freeParkingBalance: 0,
      lastActivity: Date.now(),
    });

    await logEvent(gameId, {
      type: 'transaction',
      playerId,
      data: {
        action: 'claimFreeParking',
        amount,
      },
    });
  }

  return amount;
}

// Auction helpers
export async function startAuction(
  gameId: string,
  propertyName: string,
  propertyPrice: number,
  startedBy: string
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);

  await updateDoc(gameRef, {
    auction: {
      active: true,
      propertyName,
      propertyPrice,
      startedBy,
      bids: [],
      dropouts: [],
      startedAt: Date.now(),
    },
    lastActivity: Date.now(),
  });
}

export async function placeAuctionBid(
  gameId: string,
  bid: { playerId: string; playerName: string; amount: number; timestamp: number }
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    'auction.bids': arrayUnion(bid),
    lastActivity: Date.now(),
  });
}

export async function dropOutAuction(
  gameId: string,
  playerId: string
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    'auction.dropouts': arrayUnion(playerId),
    lastActivity: Date.now(),
  });
}

export async function endAuction(gameId: string): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    auction: {
      active: false,
    },
    lastActivity: Date.now(),
  });
}

// Add history entry
export async function addHistoryEntry(
  gameId: string,
  entry: {
    type: 'dice' | 'transaction' | 'property' | 'passGo' | 'auction' | 'tax' | 'freeParking';
    message: string;
    playerName?: string;
  }
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  const historyEntry = {
    id: `${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    ...entry,
  };

  await updateDoc(gameRef, {
    history: arrayUnion(historyEntry),
    lastActivity: Date.now(),
  });
}

// Trade offer helpers
export async function proposeTrade(
  gameId: string,
  trade: {
    fromPlayerId: string;
    toPlayerId: string;
    offerMoney: number;
    offerProperties: string[];
    requestMoney: number;
    requestProperties: string[];
    isCounterOffer?: boolean;
  }
): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  const tradeOffer = {
    id: `trade_${Date.now()}_${Math.random()}`,
    ...trade,
    status: 'pending' as const,
    timestamp: Date.now(),
  };

  await updateDoc(gameRef, {
    tradeOffer,
    lastActivity: Date.now(),
  });
}

export async function acceptTrade(gameId: string): Promise<void> {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists() || !gameSnap.data().tradeOffer) return;

  const trade = gameSnap.data().tradeOffer;

  await updateDoc(gameRef, {
    tradeOffer: {
      ...trade,
      status: 'accepted',
    },
    lastActivity: Date.now(),
  });
}

export async function rejectTrade(gameId: string): Promise<void> {
  const gameRef = doc(db, 'games', gameId);

  await updateDoc(gameRef, {
    tradeOffer: null,
    lastActivity: Date.now(),
  });
}

export async function clearTrade(gameId: string): Promise<void> {
  const gameRef = doc(db, 'games', gameId);

  await updateDoc(gameRef, {
    tradeOffer: null,
    lastActivity: Date.now(),
  });
}
