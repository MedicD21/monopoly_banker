import { Player } from "../types/game";
import { PROPERTIES } from "../constants/monopolyData";

export interface WinProbability {
  playerId: string;
  playerName: string;
  percentage: number;
  netWorth: number;
}

/**
 * Calculate each player's win probability based on current game state
 * Factors:
 * - Cash on hand (40% weight)
 * - Property value (30% weight)
 * - Monopolies owned (15% weight)
 * - Houses/Hotels (15% weight)
 */
export function calculateWinProbabilities(players: Player[]): WinProbability[] {
  // Filter out bankrupt players
  const activePlayers = players.filter(p => !p.isBankrupt);

  if (activePlayers.length === 0) {
    return [];
  }

  const playerScores = activePlayers.map(player => {
    // 1. Cash value (direct money)
    const cash = player.balance || 0;

    // 2. Property values (realistic - properties are worth what you can get for them)
    const propertyValue = player.properties.reduce((total, prop) => {
      const propertyData = PROPERTIES.find(p => p.name === prop.name);
      if (!propertyData) return total;

      // Properties are only worth their mortgage value (50% of purchase price)
      // This is what you'd actually get if you needed to liquidate
      let value = propertyData.price * 0.5;

      // If already mortgaged, it's worth even less (you owe money to unmortgage)
      if (prop.mortgaged) {
        value = 0; // Mortgaged properties provide no immediate value
      } else {
        // Add house/hotel value at 50% (you sell them back at half price)
        if (prop.hotel) {
          value += 125; // Hotel sells back for half of $250
        } else {
          value += prop.houses * 25; // Each house sells back for $25 (half of $50)
        }
      }

      return total + value;
    }, 0);

    // 3. Calculate monopolies owned
    const colorGroups: { [key: string]: number } = {};
    player.properties.forEach(prop => {
      const propertyData = PROPERTIES.find(p => p.name === prop.name);
      if (propertyData && !prop.mortgaged) {
        colorGroups[propertyData.group] = (colorGroups[propertyData.group] || 0) + 1;
      }
    });

    // Count complete monopolies (excluding utilities and railroads)
    const monopolies = Object.entries(colorGroups).filter(([group, count]) => {
      if (group === 'utility' || group === 'railroad') return false;

      // Different groups have different property counts
      if (group === 'purple' || group === 'darkblue') return count >= 2;
      return count >= 3;
    }).length;

    // 4. Count total buildings (indicator of income potential)
    const totalHouses = player.properties.reduce((sum, prop) =>
      sum + (prop.hotel ? 0 : prop.houses), 0);
    const totalHotels = player.properties.reduce((sum, prop) =>
      sum + (prop.hotel ? 1 : 0), 0);

    // Calculate weighted score
    const cashScore = cash;
    const propertyScore = propertyValue;
    const monopolyScore = monopolies * 400; // Each monopoly adds significant value
    const buildingScore = (totalHouses * 50) + (totalHotels * 250);

    const totalScore =
      (cashScore * 0.40) +
      (propertyScore * 0.30) +
      (monopolyScore * 0.15) +
      (buildingScore * 0.15);

    return {
      playerId: player.id,
      playerName: player.name,
      netWorth: cash + propertyValue,
      score: totalScore,
    };
  });

  // Calculate total score
  const totalScore = playerScores.reduce((sum, p) => sum + p.score, 0);

  // Convert to percentages
  return playerScores.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    netWorth: p.netWorth,
    percentage: totalScore > 0 ? Math.round((p.score / totalScore) * 100) : 0,
  })).sort((a, b) => b.percentage - a.percentage);
}
