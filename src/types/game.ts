export interface GamePiece {
  id: string;
  name: string;
  icon: string;
}

export interface Property {
  name: string;
  houses: number;
  hotel: boolean;
  mortgaged?: boolean;
}

export interface Player {
  id: string;
  name: string;
  pieceId: string;
  color: string;
  balance: number;
  properties: Property[];
  isReady?: boolean; // For lobby
  isConnected: boolean;
  lastSeen: number;
  doublesCount?: number; // Track consecutive doubles for jail rule
  isBankrupt?: boolean; // Track if player is bankrupt
}

export interface GameConfig {
  startingMoney: number;
  passGoAmount: number;
  freeParkingJackpot: boolean;
  doubleGoOnLanding: boolean;
  auctionProperties: boolean;
  speedDie: boolean;
}

export interface Game {
  id: string;
  code: string; // 5-digit code
  hostId: string;
  status: 'lobby' | 'playing' | 'ended';
  config: GameConfig;
  createdAt: number;
  lastActivity: number;
  lastDiceRoll?: number; // For utility rent calculations
  freeParkingBalance?: number; // Free Parking jackpot (if enabled)
}

export interface GameEvent {
  id: string;
  type: 'transaction' | 'property' | 'dice' | 'passGo';
  playerId: string;
  data: any;
  timestamp: number;
}

export interface PropertyDefinition {
  name: string;
  price: number;
  rent: number[];
  color: string;
  group: string;
}

export const PLAYER_COLORS = [
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-500",
  "bg-purple-600",
  "bg-pink-600",
  "bg-orange-600",
  "bg-teal-600",
];

export const GAME_PIECES: GamePiece[] = [
  { id: "car", name: "Racecar", icon: "/images/Racecar.svg" },
  { id: "ship", name: "Battleship", icon: "/images/Battleship.svg" },
  { id: "cat", name: "Cat", icon: "/images/cat.svg" },
  { id: "dog", name: "Dog", icon: "/images/Scottie.svg" },
  { id: "boot", name: "Boot", icon: "/images/Wheelbarrow.svg" },
  { id: "hat", name: "Top Hat", icon: "/images/Top_Hat.svg" },
  { id: "thimble", name: "Thimble", icon: "/images/Thimble.svg" },
  { id: "iron", name: "Iron", icon: "/images/Iron.svg" },
];
