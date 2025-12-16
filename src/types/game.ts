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
  position?: number; // Board index for turn-based play
  isBot?: boolean; // Mark computer-controlled players
  // Track jailed state for bots later
  inJail?: boolean;
  jailTurns?: number;
  botAutoPlay?: boolean; // If false, host/user drives the bot manually
}

export interface GameConfig {
  startingMoney: number;
  passGoAmount: number;
  freeParkingJackpot: boolean;
  doubleGoOnLanding: boolean;
  auctionProperties: boolean;
  speedDie: boolean;
}

export interface AuctionBid {
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: number;
}

export interface AuctionState {
  active: boolean;
  propertyName: string;
  propertyPrice: number;
  startedBy: string;
  bids: AuctionBid[];
  dropouts: string[];
  startedAt?: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type:
    | "dice"
    | "transaction"
    | "property"
    | "passGo"
    | "auction"
    | "tax"
    | "freeParking";
  message: string;
  playerName?: string;
}

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offerMoney: number;
  offerProperties: string[];
  requestMoney: number;
  requestProperties: string[];
  status: "pending" | "accepted" | "rejected" | "countered";
  timestamp: number;
  isCounterOffer?: boolean;
}

export interface Game {
  id: string;
  code: string; // 5-digit code
  hostId: string;
  status: "lobby" | "playing" | "ended";
  config: GameConfig;
  createdAt: number;
  lastActivity: number;
  activeTurnIndex: number; // Index of the player whose turn it is
  lastDiceRoll?: number; // For utility rent calculations
  freeParkingBalance?: number; // Free Parking jackpot (if enabled)
  auction?: AuctionState;
  history?: HistoryEntry[]; // Game history for all players
  tradeOffer?: TradeOffer; // Active trade offer
}

export interface GameEvent {
  id: string;
  type: "transaction" | "property" | "dice" | "passGo";
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
  { id: "car", name: "Car", icon: "/images/Racecar.svg" },
  { id: "ship", name: "Ship", icon: "/images/Battleship.svg" },
  { id: "cat", name: "Cat", icon: "/images/cat.svg" },
  { id: "dog", name: "Dog", icon: "/images/Scottie.svg" },
  { id: "boot", name: "Boot", icon: "/images/Wheelbarrow.svg" },
  { id: "hat", name: "Hat", icon: "/images/Top_Hat.svg" },
  { id: "thimble", name: "Sewing", icon: "/images/Thimble.svg" },
  { id: "iron", name: "Iron", icon: "/images/Iron.svg" },
];
