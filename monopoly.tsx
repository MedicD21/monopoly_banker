import { useState, useEffect } from "react";
import {
  DollarSign,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Home,
  TrendingUp,
  RotateCcw,
  Building2,
  X,
  Banknote,
  Gavel,
  Clock,
} from "lucide-react";
import NumberPadModal from "./src/components/NumberPadModal";
import PayPlayerModal from "./src/components/PayPlayerModal";
import RentSelector from "./src/components/RentSelector";
import TradeModal from "./src/components/TradeModal";
import TradeOfferModal from "./src/components/TradeOfferModal";
import TaxModal from "./src/components/TaxModal";
import BankruptcyModal from "./src/components/BankruptcyModal";
import WinnerModal from "./src/components/WinnerModal";
import ResetModal from "./src/components/ResetModal";
import AuctionModal from "./src/components/AuctionModal";
import PropertySelectorModal from "./src/components/PropertySelectorModal";
import ToastNotification from "./src/components/ToastNotification";
import HistoryModal from "./src/components/HistoryModal";
import { HistoryEntry, TradeOffer } from "./src/types/game";
import {
  subscribeToPlayers,
  subscribeToGame,
} from "./src/firebase/realtimeService";
import {
  updatePlayerBalance,
  transferMoney as transferMoneyFirebase,
  addPropertyToPlayer,
  removePropertyFromPlayer,
  updatePropertyOnPlayer,
  recordDiceRoll,
  passGo as passGoFirebase,
  resetGame as resetGameFirebase,
  mortgageProperty as mortgagePropertyFirebase,
  unmortgageProperty as unmortgagePropertyFirebase,
  addToFreeParking,
  claimFreeParking,
  startAuction as startAuctionFirebase,
  placeAuctionBid as placeAuctionBidFirebase,
  dropOutAuction as dropOutAuctionFirebase,
  endAuction as endAuctionFirebase,
  addHistoryEntry as addHistoryEntryFirebase,
  proposeTrade,
  acceptTrade,
  rejectTrade,
  clearTrade,
} from "./src/firebase/gameplayService";
import { updatePlayer, updateGame } from "./src/firebase/gameService";

const STARTING_MONEY = 1500;
const PASS_GO_AMOUNT = 200;
const HOUSE_COST = 50;
const HOTEL_COST = 200;
const TOTAL_HOUSES = 32; // Classic house limit
const TOTAL_HOTELS = 12; // Classic hotel limit
const idsMatch = (a: string | number, b: string | number) =>
  String(a) === String(b);

const GAME_PIECES = [
  { id: "car", name: "Car", icon: "/images/Racecar.svg" },
  { id: "ship", name: "Ship", icon: "/images/Battleship.svg" },
  { id: "cat", name: "Cat", icon: "/images/cat.svg" },
  { id: "dog", name: "Dog", icon: "/images/Scottie.svg" },
  { id: "wheelbarrow", name: "Wheelbarrow", icon: "/images/Wheelbarrow.svg" },
  { id: "hat", name: "Hat", icon: "/images/Top_Hat.svg" },
  { id: "thimble", name: "Sewing", icon: "/images/Thimble.svg" },
  { id: "iron", name: "Iron", icon: "/images/Iron.svg" },
];

const PROPERTIES = [
  // Purple Properties - Low Value District
  {
    name: "Maple Lane",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    color: "bg-purple-700",
    group: "purple",
  },
  {
    name: "Oak Street",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    color: "bg-purple-700",
    group: "purple",
  },
  // Light Blue Properties - Residential Area
  {
    name: "Pine Avenue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Birch Boulevard",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Cedar Court",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  // Pink Properties - Suburban District
  {
    name: "Willow Way",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "Elm Plaza",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "Aspen Drive",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    color: "bg-pink-600",
    group: "pink",
  },
  // Orange Properties - Commercial Zone
  {
    name: "Sycamore Square",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Redwood Road",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Magnolia Mile",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    color: "bg-orange-600",
    group: "orange",
  },
  // Red Properties - Business District
  {
    name: "Hickory Heights",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Spruce Parkway",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Poplar Plaza",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    color: "bg-red-700",
    group: "red",
  },
  // Yellow Properties - Upscale Area
  {
    name: "Cypress Circle",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Juniper Junction",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Sequoia Summit",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    color: "bg-yellow-600",
    group: "yellow",
  },
  // Green Properties - Premium District
  {
    name: "Dogwood Drive",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Chestnut Center",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Laurel Landing",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    color: "bg-green-700",
    group: "green",
  },
  // Dark Blue Properties - Luxury Estates
  {
    name: "Rosewood Row",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    color: "bg-blue-800",
    group: "darkblue",
  },
  {
    name: "Diamond District",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    color: "bg-blue-800",
    group: "darkblue",
  },
  // Railroads - Transit Lines
  {
    name: "North Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "South Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "East Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "West Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  // Utilities
  {
    name: "Power Grid",
    price: 150,
    rent: [],
    color: "bg-yellow-500",
    group: "utility",
  },
  {
    name: "Water Supply",
    price: 150,
    rent: [],
    color: "bg-blue-400",
    group: "utility",
  },
];

const PLAYER_COLORS = [
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-500",
  "bg-purple-600",
  "bg-pink-600",
  "bg-orange-600",
  "bg-teal-600",
];

// Simplified board order for bot turn messaging
const BOARD_SPACES = [
  "GO",
  "Maple Lane",
  "Community Chest",
  "Oak Street",
  "Income Tax",
  "North Line",
  "Pine Avenue",
  "Chance",
  "Birch Boulevard",
  "Cedar Court",
  "Just Visiting / Jail",
  "Willow Way",
  "Power Grid",
  "Elm Plaza",
  "Aspen Drive",
  "South Line",
  "Sycamore Square",
  "Community Chest",
  "Redwood Road",
  "Magnolia Mile",
  "Free Parking",
  "Hickory Heights",
  "Chance",
  "Spruce Parkway",
  "Poplar Plaza",
  "East Line",
  "Cypress Circle",
  "Juniper Junction",
  "Water Supply",
  "Sequoia Summit",
  "Go To Jail",
  "Dogwood Drive",
  "Chestnut Center",
  "Community Chest",
  "Laurel Landing",
  "West Line",
  "Chance",
  "Rosewood Row",
  "Luxury Tax",
  "Diamond District",
];

const JAIL_INDEX = 10;

type CardType = "chance" | "community";
type CardEffect =
  | { kind: "bank"; amount: number } // positive collects, negative pays bank
  | { kind: "each"; amount: number } // collect from each (positive) or pay each (negative)
  | { kind: "move"; position: number; passGo?: boolean }
  | { kind: "gotoJail" };

interface Card {
  id: string;
  type: CardType;
  text: string;
  effect: CardEffect;
}

const CHANCE_CARDS: Card[] = [
  {
    id: "chance-go",
    type: "chance",
    text: "Advance to GO. Collect $200.",
    effect: { kind: "move", position: 0, passGo: true },
  },
  {
    id: "chance-bank-dividend",
    type: "chance",
    text: "Bank pays you dividend of $50.",
    effect: { kind: "bank", amount: 50 },
  },
  {
    id: "chance-speeding-fine",
    type: "chance",
    text: "Speeding fine $15.",
    effect: { kind: "bank", amount: -15 },
  },
  {
    id: "chance-jail",
    type: "chance",
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    effect: { kind: "gotoJail" },
  },
  {
    id: "chance-pay-each",
    type: "chance",
    text: "Pay each player $50.",
    effect: { kind: "each", amount: -50 },
  },
];

const COMMUNITY_CARDS: Card[] = [
  {
    id: "comm-bank-error",
    type: "community",
    text: "Bank error in your favor. Collect $200.",
    effect: { kind: "bank", amount: 200 },
  },
  {
    id: "comm-doctor",
    type: "community",
    text: "Doctor's fee. Pay $50.",
    effect: { kind: "bank", amount: -50 },
  },
  {
    id: "comm-go",
    type: "community",
    text: "Advance to GO. Collect $200.",
    effect: { kind: "move", position: 0, passGo: true },
  },
  {
    id: "comm-collect-each",
    type: "community",
    text: "It is your birthday. Collect $10 from every player.",
    effect: { kind: "each", amount: 10 },
  },
  {
    id: "comm-go-to-jail",
    type: "community",
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    effect: { kind: "gotoJail" },
  },
];

interface DigitalBankerProps {
  gameId?: string;
  gameCode?: string;
  initialPlayers?: any[];
  currentPlayerId?: string;
  gameConfig?: {
    startingMoney: number;
    passGoAmount: number;
    freeParkingJackpot: boolean;
    doubleGoOnLanding: boolean;
    auctionProperties: boolean;
    speedDie: boolean;
  };
}

export default function DigitalBanker({
  gameId,
  gameCode,
  initialPlayers,
  currentPlayerId: firebasePlayerId,
  gameConfig,
}: DigitalBankerProps = {}) {
  const isMultiplayer = !!gameId;

  const [screen, setScreen] = useState(isMultiplayer ? "play" : "setup");
  const [players, setPlayers] = useState(
    isMultiplayer ? initialPlayers || [] : []
  );
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [isBotTakingTurn, setIsBotTakingTurn] = useState(false);
  const [botTurnMessage, setBotTurnMessage] = useState("");
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const [botTurnLog, setBotTurnLog] = useState<string[]>([]);

  const goToNextTurn = async () => {
    if (players.length === 0) return;
    let next = activeTurnIndex;
    for (let i = 0; i < players.length; i++) {
      next = (next + 1) % players.length;
      const candidate = players[next];
      if (candidate && !candidate.isBankrupt) {
        break;
      }
    }
    if (isMultiplayer && gameId) {
      // Store the new turn index in the game document
      await updateGame(gameId, { activeTurnIndex: next });
    } else {
      setActiveTurnIndex(next);
    }
    const nextPlayer = players[next];
    if (nextPlayer) {
      const msg = `It's ${nextPlayer.name}'s turn`;
      setTurnToast(msg);
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setTurnToast(null), 2000);
    }
  };

  const updatePlayerPosition = async (
    playerId: string | number,
    newPos: number
  ) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, position: newPos } : p))
    );
    if (isMultiplayer && gameId) {
      await updatePlayer(gameId, playerId as string, { position: newPos });
    }
  };

  const updateJailStatus = async (
    playerId: string | number,
    inJail: boolean,
    jailTurns = 0,
    position?: number
  ) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              inJail,
              jailTurns,
              position: position !== undefined ? position : p.position,
            }
          : p
      )
    );
    if (isMultiplayer && gameId) {
      await updatePlayer(gameId, playerId as string, {
        inJail,
        jailTurns,
        position: position !== undefined ? position : undefined,
      });
    }
  };

  const pushBotLog = (msg: string) => {
    setBotTurnLog((prev) => [...prev.slice(-3), msg]);
  };

  const getPropertyDef = (name: string) =>
    PROPERTIES.find((p) => p.name.toLowerCase() === name.toLowerCase());

  const getOwnerOfProperty = (propertyName: string) => {
    for (const p of players) {
      if (p.properties.some((pr: any) => pr.name === propertyName)) {
        return p;
      }
    }
    return null;
  };

  const drawCard = (type: CardType): Card => {
    const pool = type === "chance" ? CHANCE_CARDS : COMMUNITY_CARDS;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  };

  const handleDrawCard = (type: CardType) => {
    const playerIdToUse = isMultiplayer
      ? firebasePlayerId
      : activePlayer?.id ?? currentPlayerId;
    if (playerIdToUse === null || playerIdToUse === undefined) {
      showError("Select a player first");
      return;
    }
    const card = drawCard(type);
    setCardModal({ open: true, card, playerId: playerIdToUse });
  };

  const applyCard = async (card: Card, playerId: string | number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const effect = card.effect;
    if (effect.kind === "bank") {
      await updateBalance(playerId, effect.amount);
      pushBotLog(
        `${player.name}: ${effect.amount >= 0 ? "+" : ""}$${Math.abs(
          effect.amount
        )}`
      );
    } else if (effect.kind === "each") {
      // positive = collect from each, negative = pay each
      const others = players.filter((p) => p.id !== playerId && !p.isBankrupt);
      for (const other of others) {
        if (effect.amount >= 0) {
          await transferMoney(other.id, playerId, effect.amount.toString());
        } else {
          await transferMoney(
            playerId,
            other.id,
            Math.abs(effect.amount).toString()
          );
        }
      }
      pushBotLog(
        `${player.name} ${effect.amount >= 0 ? "collects" : "pays"} $${Math.abs(
          effect.amount
        )} ${effect.amount >= 0 ? "from" : "to"} each`
      );
    } else if (effect.kind === "move") {
      const currentPos = player.position ?? 0;
      const boardSize = BOARD_SPACES.length;
      const wrapped = effect.position < currentPos && effect.passGo;
      if (wrapped) {
        await updateBalance(playerId, PASS_GO_AMOUNT);
      }
      await updatePlayerPosition(playerId, effect.position);
      pushBotLog(
        `${player.name} moves to ${BOARD_SPACES[effect.position] || "space"}`
      );
    } else if (effect.kind === "gotoJail") {
      await updateJailStatus(playerId, true, 0, JAIL_INDEX);
      pushBotLog(`${player.name} sent to Jail`);
    }

    setCardModal({ open: false });
  };

  const botHandleLanding = async (
    bot: any,
    propertyName: string,
    rollTotal: number
  ) => {
    const property = getPropertyDef(propertyName);
    if (!property) return;

    const owner = getOwnerOfProperty(propertyName);
    const botBalance = bot.balance ?? 0;

    // If unowned and affordable, buy
    if (!owner && botBalance >= property.price) {
      pushBotLog(`${bot.name} buys ${propertyName} for $${property.price}`);
      await buyProperty(bot.id, property);
      return;
    }

    // If owned by someone else and not mortgaged, pay rent
    if (owner && owner.id !== bot.id) {
      const ownerProp = owner.properties.find(
        (pr: any) => pr.name === propertyName
      );
      if (ownerProp?.mortgaged) {
        pushBotLog(`${propertyName} is mortgaged, no rent due`);
        return;
      }

      let rentAmount = 0;
      if (property.group === "utility") {
        const utilityCount = owner.properties.filter((pr: any) => {
          const prop = PROPERTIES.find((p: any) => p.name === pr.name);
          return prop?.group === "utility";
        }).length;
        const multiplier = utilityCount === 2 ? 10 : 4;
        rentAmount = rollTotal * multiplier;
      } else {
        rentAmount = calculateRent(owner.id, propertyName);
      }

      if (rentAmount > 0) {
        pushBotLog(`${bot.name} pays $${rentAmount} rent to ${owner.name}`);
        await transferMoney(bot.id, owner.id, rentAmount.toString());
      }
    }
  };

  const handleBotTurn = async () => {
    if (isMultiplayer) return;
    const active = players[activeTurnIndex];
    if (!active || !active.isBot || isBotTakingTurn) return;
    if (active.botAutoPlay === false) return;

    setIsBotTakingTurn(true);
    setBotTurnMessage(`${active.name} is rolling...`);
    pushBotLog(`${active.name} rolling...`);
    // Jail handling
    if (active.inJail) {
      const turns = active.jailTurns ?? 0;
      if (turns >= 2 && active.balance >= 50) {
        pushBotLog(`${active.name} pays $50 bail and leaves Jail`);
        await updateBalance(active.id, -50);
        await updateJailStatus(active.id, false, 0, JAIL_INDEX);
      } else {
        pushBotLog(`${active.name} remains in Jail (turn ${turns + 1})`);
        await updateJailStatus(active.id, true, turns + 1, JAIL_INDEX);
        setBotTurnMessage(`${active.name} ends turn`);
        await sleep(400);
        setIsBotTakingTurn(false);
        goToNextTurn();
        return;
      }
    }

    const roll = await rollDice(active.id);
    if (!roll) {
      setIsBotTakingTurn(false);
      return;
    }

    await sleep(400);

    const currentPos = active.position ?? 0;
    const boardSize = BOARD_SPACES.length;
    const newPos = (currentPos + roll.total) % boardSize;
    const passedGo = currentPos + roll.total >= boardSize;

    if (passedGo) {
      setBotTurnMessage(`${active.name} passed GO +$${PASS_GO_AMOUNT}`);
      await updateBalance(active.id, PASS_GO_AMOUNT);
      await sleep(400);
      pushBotLog(`${active.name} collected $${PASS_GO_AMOUNT} at GO`);
    }

    await updatePlayerPosition(active.id, newPos);
    const landed = getSpaceName(newPos);
    addHistoryEntry("dice", `${active.name} rolled to ${landed}`, active.name);
    pushBotLog(`${active.name} landed on ${landed}`);

    // Chance / Community draw
    if (landed === "Chance" || landed === "Community Chest") {
      const card = drawCard(landed === "Chance" ? "chance" : "community");
      pushBotLog(`${active.name} draws: ${card.text}`);
      await applyCard(card, active.id);
    } else if (
      landed !== "Luxury Tax" &&
      landed !== "Income Tax" &&
      landed !== "Free Parking" &&
      landed !== "Go To Jail" &&
      landed !== "Just Visiting / Jail"
    ) {
      // Basic property / rent handling
      await botHandleLanding(active, landed, roll.total);
    } else if (landed === "Go To Jail") {
      await updateJailStatus(active.id, true, 0, JAIL_INDEX);
      pushBotLog(`${active.name} sent to Jail`);
    }

    setBotTurnMessage(`${active.name} ends turn`);
    await sleep(400);
    setIsBotTakingTurn(false);
    goToNextTurn();
  };
  const [numPlayers, setNumPlayers] = useState(
    isMultiplayer ? initialPlayers?.length || 0 : 0
  );
  const [playerNames, setPlayerNames] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [playerPieces, setPlayerPieces] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [playerColors, setPlayerColors] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(0); // For player-specific view
  const [lastRoll, setLastRoll] = useState<{
    d1: number;
    d2: number;
    d3?: number | null;
    total: number;
    isDoubles: boolean;
  } | null>(null);
  const [transactionMode, setTransactionMode] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDice, setShowDice] = useState(false);
  // const [rentMode, setRentMode] = useState(null); // Unused
  const [showBuyProperty, setShowBuyProperty] = useState(false);
  const [utilityDiceRoll, setUtilityDiceRoll] = useState("");
  const [diceRolling, setDiceRolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // New state for enhanced pay system
  const [showPayPlayerModal, setShowPayPlayerModal] = useState(false);
  const [showRentSelector, setShowRentSelector] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [numberPadTitle, setNumberPadTitle] = useState("Enter Amount");
  const [numberPadCallback, setNumberPadCallback] = useState<
    ((amount: number) => void) | null
  >(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [freeParkingBalance, setFreeParkingBalance] = useState(0);
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [bankruptPlayer, setBankruptPlayer] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionProperty, setAuctionProperty] = useState<any>(null);
  const [showAuctionSelector, setShowAuctionSelector] = useState(false);
  const [auctionState, setAuctionState] = useState<any>(null);
  // const [resolvedAuctionKey, setResolvedAuctionKey] = useState<string | null>(null); // Unused
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [gameHistory, setGameHistory] = useState<HistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [tradeOffer, setTradeOffer] = useState<TradeOffer | null>(null);
  const activePlayer = players[activeTurnIndex] || null;
  const isActiveBot = !isMultiplayer && !!activePlayer?.isBot;
  const [cardModal, setCardModal] = useState<{
    open: boolean;
    card?: Card;
    playerId?: string | number;
  }>({ open: false });
  const getSpaceName = (index: number) =>
    BOARD_SPACES[index] || `Space ${index}`;
  const [showBotControlModal, setShowBotControlModal] = useState(false);
  // const [turnToast, setTurnToast] = useState<string | null>(null); // Unused

  // Firebase sync for multiplayer
  useEffect(() => {
    if (!isMultiplayer || !gameId) return;

    // Subscribe to player updates
    const unsubscribePlayers = subscribeToPlayers(gameId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setNumPlayers(updatedPlayers.length);
    });

    // Subscribe to game updates (for Free Parking balance, history, turn index, etc.)
    const unsubscribeGame = subscribeToGame(gameId, (gameData) => {
      if (gameData.freeParkingBalance !== undefined) {
        setFreeParkingBalance(gameData.freeParkingBalance);
      }
      if (typeof gameData.activeTurnIndex === "number") {
        setActiveTurnIndex(gameData.activeTurnIndex);
      }
      // Sync game history across all players
      if (gameData.history) {
        setGameHistory(gameData.history);
      }
      // Sync auction state across all players
      if (gameData.auction) {
        setAuctionState(gameData.auction);
        if (gameData.auction.active) {
          const propertyDef = PROPERTIES.find(
            (p) =>
              p.name.toLowerCase() ===
              gameData.auction.propertyName?.toLowerCase()
          );
          setAuctionProperty(
            propertyDef || {
              name: gameData.auction.propertyName,
              price: gameData.auction.propertyPrice,
            }
          );
          setShowAuctionModal(true);
        } else {
          setShowAuctionModal(false);
          setAuctionProperty(null);
        }
      } else {
        setAuctionState(null);
        setShowAuctionModal(false);
        setAuctionProperty(null);
      }
      // Sync trade offers across all players
      if (gameData.tradeOffer) {
        setTradeOffer(gameData.tradeOffer);
      } else {
        setTradeOffer(null);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGame();
    };
  }, [isMultiplayer, gameId]);

  // Set current player ID in multiplayer mode
  useEffect(() => {
    if (isMultiplayer && firebasePlayerId && players.length > 0) {
      const playerIndex = players.findIndex((p) => p.id === firebasePlayerId);
      if (playerIndex !== -1) {
        setCurrentPlayerId(playerIndex);
      }
    }
  }, [isMultiplayer, firebasePlayerId, players]);

  // Keep local turn pointer in range and sync currentPlayerId for local games
  useEffect(() => {
    if (isMultiplayer) return;
    if (players.length === 0) return;
    const clampedIndex = Math.min(activeTurnIndex, players.length - 1);
    if (clampedIndex !== activeTurnIndex) {
      setActiveTurnIndex(clampedIndex);
    }
    const active = players[clampedIndex];
    if (active) {
      setCurrentPlayerId(active.id);
    }
  }, [players, activeTurnIndex, isMultiplayer]);

  // Check for bankruptcy and winner
  useEffect(() => {
    if (players.length === 0) return;

    // Check each player for bankruptcy (balance <= 0 and no properties)
    players.forEach((player) => {
      if (
        !player.isBankrupt &&
        player.balance <= 0 &&
        player.properties.length === 0
      ) {
        // Mark player as bankrupt
        setBankruptPlayer(player);
        setShowBankruptcyModal(true);

        // Update player state
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, isBankrupt: true } : p))
        );

        // Update Firebase if multiplayer
        if (isMultiplayer && gameId) {
          updatePlayer(gameId, player.id, { isBankrupt: true });
        }
      }
    });

    // Check for winner (only one non-bankrupt player remaining)
    const nonBankruptPlayers = players.filter((p) => !p.isBankrupt);
    if (nonBankruptPlayers.length === 1 && players.length > 1) {
      setWinner(nonBankruptPlayers[0]);
      setShowWinnerModal(true);
    }
  }, [players, isMultiplayer, gameId]);

  // Advance bot turns automatically in local games
  useEffect(() => {
    if (isMultiplayer) return;
    const active = players[activeTurnIndex];
    if (!active || !active.isBot) return;

    handleBotTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurnIndex, players, isMultiplayer]);

  type RollResult = {
    d1: number;
    d2: number;
    d3?: number | null;
    total: number;
    isDoubles: boolean;
  };

  const rollDice = async (
    overridePlayerId?: string | number
  ): Promise<RollResult | null> => {
    const playerIdToUse =
      overridePlayerId ?? (isMultiplayer ? firebasePlayerId : currentPlayerId);
    const rollingPlayer = players.find((p) => p.id === playerIdToUse);

    if (!rollingPlayer) return null;

    const speedDieEnabled = gameConfig?.speedDie || false;

    setDiceRolling(true);
    return await new Promise<RollResult | null>((resolve) => {
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        const tempD1 = Math.floor(Math.random() * 6) + 1;
        const tempD2 = Math.floor(Math.random() * 6) + 1;
        const tempD3 = speedDieEnabled
          ? Math.floor(Math.random() * 6) + 1
          : null;
        setLastRoll({
          d1: tempD1,
          d2: tempD2,
          d3: tempD3,
          total: tempD1 + tempD2 + (tempD3 || 0),
          isDoubles: tempD1 === tempD2,
        });
        rollCount++;

        if (rollCount >= 10) {
          clearInterval(rollInterval);
          const finalD1 = Math.floor(Math.random() * 6) + 1;
          const finalD2 = Math.floor(Math.random() * 6) + 1;
          const finalD3 = speedDieEnabled
            ? Math.floor(Math.random() * 6) + 1
            : null;
          const finalRoll = {
            d1: finalD1,
            d2: finalD2,
            d3: finalD3,
            total: finalD1 + finalD2 + (finalD3 || 0),
            isDoubles: finalD1 === finalD2,
          };
          setLastRoll(finalRoll);
          setDiceRolling(false);
          setShowDice(true);
          setTimeout(() => setShowDice(false), 3000);

          // Add to history
          const diceString = finalD3
            ? `${finalD1} + ${finalD2} + ${finalD3} = ${finalRoll.total}`
            : `${finalD1} + ${finalD2} = ${finalRoll.total}`;
          addHistoryEntry(
            "dice",
            `${rollingPlayer.name} rolled ${diceString}${
              finalRoll.isDoubles ? " (Doubles!)" : ""
            }`,
            rollingPlayer.name
          );

          // Handle doubles tracking and three-doubles-in-a-row jail rule
          const currentDoublesCount = rollingPlayer.doublesCount || 0;

          if (finalRoll.isDoubles) {
            const newDoublesCount = currentDoublesCount + 1;

            if (newDoublesCount >= 3) {
              // Three doubles in a row - Go to Jail!
              alert(
                `${rollingPlayer.name} rolled doubles 3 times in a row! Go to Jail!`
              );

              // Reset this player's doubles count
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === playerIdToUse ? { ...p, doublesCount: 0 } : p
                )
              );

              if (isMultiplayer && gameId) {
                updatePlayer(gameId, playerIdToUse, { doublesCount: 0 });
              }
            } else {
              // Increment doubles count
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === playerIdToUse
                    ? { ...p, doublesCount: newDoublesCount }
                    : p
                )
              );

              if (isMultiplayer && gameId) {
                updatePlayer(gameId, playerIdToUse, {
                  doublesCount: newDoublesCount,
                });
              }
            }
          } else {
            // Not doubles - reset this player's count
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === playerIdToUse ? { ...p, doublesCount: 0 } : p
              )
            );

            if (isMultiplayer && gameId) {
              updatePlayer(gameId, playerIdToUse, { doublesCount: 0 });
            }
          }

          // Reset ALL other players' doubles counts (since a different player rolled)
          setPlayers((prev) =>
            prev.map((p) =>
              p.id !== playerIdToUse ? { ...p, doublesCount: 0 } : p
            )
          );

          if (isMultiplayer && gameId) {
            // Reset other players' doubles counts
            players.forEach((p) => {
              if (p.id !== playerIdToUse) {
                updatePlayer(gameId, p.id, { doublesCount: 0 });
              }
            });
          }

          // Sync to Firebase in multiplayer mode
          if (isMultiplayer && gameId && firebasePlayerId) {
            recordDiceRoll(gameId, firebasePlayerId, [finalD1, finalD2]);
          }

          resolve(finalRoll);
        }
      }, 100);
    });
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const addHistoryEntry = async (
    type: HistoryEntry["type"],
    message: string,
    playerName?: string
  ) => {
    const entry = {
      type,
      message,
      playerName,
    };

    // In multiplayer mode, sync to Firebase
    if (isMultiplayer && gameId) {
      await addHistoryEntryFirebase(gameId, entry);
    } else {
      // In single player mode, update local state
      const localEntry: HistoryEntry = {
        id: `${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        ...entry,
      };
      setGameHistory((prev) => [...prev, localEntry]);
    }
  };

  const startGame = () => {
    // Validate player setup
    if (numPlayers < 1 || numPlayers > 8) {
      showError("Please select 1-8 players");
      return;
    }

    // Validate player names
    const activePlayers = playerNames.slice(0, numPlayers);
    const hasEmptyNames = activePlayers.some((name) => !name.trim());
    if (hasEmptyNames) {
      showError("All players must have names");
      return;
    }

    // Validate unique names
    const uniqueNames = new Set(
      activePlayers.map((n) => n.trim().toLowerCase())
    );
    if (uniqueNames.size !== numPlayers) {
      showError("Player names must be unique");
      return;
    }

    // Validate pieces selected
    const activePieces = playerPieces.slice(0, numPlayers);
    if (activePieces.some((p) => !p)) {
      showError("All players must select a game piece");
      return;
    }

    // Validate unique pieces
    const uniquePieces = new Set(activePieces);
    if (uniquePieces.size !== numPlayers) {
      showError("Each player must have a unique game piece");
      return;
    }

    const newPlayers = [];
    for (let i = 0; i < numPlayers; i++) {
      const piece = GAME_PIECES.find((p) => p.id === playerPieces[i]);
      newPlayers.push({
        id: i,
        name: playerNames[i].trim(),
        balance: STARTING_MONEY,
        properties: [],
        color: playerColors[i],
        piece: piece,
        position: 0,
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setActiveTurnIndex(0);
    setScreen("game");
  };

  const updateBalance = async (playerId, amount) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const newBalance = Math.max(0, player.balance + amount);

    // Update local state
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, balance: newBalance } : p))
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, playerId, newBalance);
    }
  };

  const transferMoney = async (fromId, toId, amount) => {
    const amt = parseInt(amount);

    // Validation
    if (isNaN(amt) || amt <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    if (fromId === toId) {
      showError("Cannot transfer money to yourself");
      return;
    }

    const fromPlayer = players.find((p) => p.id === fromId);
    const toPlayer = players.find((p) => p.id === toId);

    if (!fromPlayer || !toPlayer) {
      showError("Invalid player selection");
      return;
    }

    if (fromPlayer.balance < amt) {
      showError(
        `${fromPlayer.name} does not have enough money ($${fromPlayer.balance} available)`
      );
      return;
    }

    // Update local state
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === fromId) return { ...p, balance: p.balance - amt };
        if (p.id === toId) return { ...p, balance: p.balance + amt };
        return p;
      })
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, fromId, fromPlayer.balance - amt);
      await updatePlayerBalance(gameId, toId, toPlayer.balance + amt);
      await transferMoneyFirebase(gameId, fromId, toId, amt);
    }

    // Add to history
    addHistoryEntry(
      "transaction",
      `${fromPlayer.name} paid ${toPlayer.name} $${amt.toLocaleString()}`,
      fromPlayer.name
    );

    setTransactionMode(null);
    setRentMode(null);
    setTransactionAmount("");
    setSelectedPlayer(null);
    setUtilityDiceRoll("");
  };

  const buyProperty = async (playerId, property) => {
    const player = players.find((p) => p.id === playerId);

    if (!player) {
      showError("Player not found");
      return;
    }

    if (player.balance < property.price) {
      showError(
        `Insufficient funds. Need $${property.price}, have $${player.balance}`
      );
      return;
    }

    const isOwned = players.some((p) =>
      p.properties.some((pr: any) => pr.name === property.name)
    );
    if (isOwned) {
      showError("Property is already owned");
      return;
    }

    const newProperty = { name: property.name, houses: 0, hotel: false };
    const newBalance = player.balance - property.price;

    // Update local state
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              balance: newBalance,
              properties: [...p.properties, newProperty],
            }
          : p
      )
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, playerId, newBalance);
      await addPropertyToPlayer(gameId, playerId, newProperty);
    }

    // Add to history
    addHistoryEntry(
      "property",
      `${player.name} bought ${
        property.name
      } for $${property.price.toLocaleString()}`,
      player.name
    );

    setTransactionMode(null);
  };

  const sellProperty = async (playerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(
      (pr: any) => pr.name === propertyName
    );
    if (!playerProp) return;
    const refund =
      property.price +
      playerProp.houses * HOUSE_COST +
      (playerProp.hotel ? HOTEL_COST : 0);

    const newBalance = player.balance + refund;

    // Update local state
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              balance: newBalance,
              properties: p.properties.filter(
                (pr: any) => pr.name !== propertyName
              ),
            }
          : p
      )
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, playerId, newBalance);
      await removePropertyFromPlayer(gameId, playerId, propertyName);
    }

    // Add to history
    addHistoryEntry(
      "property",
      `${player.name} sold ${propertyName} for $${refund.toLocaleString()}`,
      player.name
    );
  };

  const mortgageProperty = async (playerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const player = players.find((p) => p.id === playerId);
    if (!player || !property) return;

    const playerProp = player.properties.find(
      (pr: any) => pr.name === propertyName
    );
    if (!playerProp) return;

    // Can't mortgage if it has houses or hotels
    if (playerProp.houses > 0 || playerProp.hotel) {
      alert("You must sell all houses and hotels before mortgaging!");
      return;
    }

    // Can't mortgage if already mortgaged
    if (playerProp.mortgaged) {
      alert("This property is already mortgaged!");
      return;
    }

    const mortgageValue = Math.floor(property.price / 2);
    const newBalance = player.balance + mortgageValue;

    // Update local state
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              balance: newBalance,
              properties: p.properties.map((pr: any) =>
                pr.name === propertyName ? { ...pr, mortgaged: true } : pr
              ),
            }
          : p
      )
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await mortgagePropertyFirebase(
        gameId,
        playerId,
        propertyName,
        mortgageValue
      );
    }
  };

  const unmortgageProperty = async (playerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const player = players.find((p) => p.id === playerId);
    if (!player || !property) return;

    const playerProp = player.properties.find((pr) => pr.name === propertyName);
    if (!playerProp) return;

    // Can't unmortgage if not mortgaged
    if (!playerProp.mortgaged) {
      alert("This property is not mortgaged!");
      return;
    }

    // Unmortgage cost is mortgage value + 10%
    const mortgageValue = Math.floor(property.price / 2);
    const unmortgageCost = Math.floor(mortgageValue * 1.1);

    if (player.balance < unmortgageCost) {
      alert(
        `You need $${unmortgageCost.toLocaleString()} to unmortgage this property!`
      );
      return;
    }

    const newBalance = player.balance - unmortgageCost;

    // Update local state
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              balance: newBalance,
              properties: p.properties.map((pr: any) =>
                pr.name === propertyName ? { ...pr, mortgaged: false } : pr
              ),
            }
          : p
      )
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await unmortgagePropertyFirebase(
        gameId,
        playerId,
        propertyName,
        unmortgageCost
      );
    }
  };

  // Calculate total houses in use across all players
  const getHousesInUse = () => {
    let total = 0;
    players.forEach((player) => {
      player.properties.forEach((prop: any) => {
        if (!prop.hotel) {
          total += prop.houses || 0;
        }
      });
    });
    return total;
  };

  // Calculate total hotels in use across all players
  const getHotelsInUse = () => {
    let total = 0;
    players.forEach((player) => {
      player.properties.forEach((prop: any) => {
        if (prop.hotel) {
          total += 1;
        }
      });
    });
    return total;
  };

  // Get available houses and hotels
  const getAvailableBuildings = () => {
    return {
      houses: TOTAL_HOUSES - getHousesInUse(),
      hotels: TOTAL_HOTELS - getHotelsInUse(),
    };
  };

  // Check if player has a monopoly (owns all properties in a color group)
  const hasMonopoly = (player, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    if (!property) return false;

    // Can't build on railroads or utilities
    if (property.group === "railroad" || property.group === "utility") {
      return false;
    }

    // Get all properties in the same color group
    const groupProperties = PROPERTIES.filter(
      (p) => p.group === property.group
    );

    // Check if player owns all properties in the group
    const ownedInGroup = player.properties.filter((pr: any) => {
      const prop = PROPERTIES.find((p: any) => p.name === pr.name);
      return prop && prop.group === property.group;
    });

    return ownedInGroup.length === groupProperties.length;
  };

  const addHouse = async (playerId, propertyName) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(
      (pr: any) => pr.name === propertyName
    );
    if (!playerProp) return;

    // Check if player has monopoly before allowing house purchase
    if (!hasMonopoly(player, propertyName)) {
      alert("You must own all properties in this color group to build houses!");
      return;
    }

    // Check if property is mortgaged
    if (playerProp.mortgaged) {
      alert("You cannot build on a mortgaged property!");
      return;
    }

    // Check building shortage
    const available = getAvailableBuildings();
    if (available.houses <= 0) {
      alert(
        "Building Shortage! No houses available. Wait for other players to sell houses or upgrade to hotels."
      );
      return;
    }

    if (
      player.balance >= HOUSE_COST &&
      playerProp.houses < 4 &&
      !playerProp.hotel
    ) {
      const newBalance = player.balance - HOUSE_COST;
      const newHouses = playerProp.houses + 1;

      // Update local state
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === playerId) {
            return {
              ...p,
              balance: newBalance,
              properties: p.properties.map((pr: any) =>
                pr.name === propertyName ? { ...pr, houses: newHouses } : pr
              ),
            };
          }
          return p;
        })
      );

      // Sync to Firebase in multiplayer mode
      if (isMultiplayer && gameId) {
        await updatePlayerBalance(gameId, playerId, newBalance);
        await updatePropertyOnPlayer(gameId, playerId, propertyName, {
          houses: newHouses,
        });
      }
    }
  };

  const removeHouse = async (playerId, propertyName) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find((pr) => pr.name === propertyName);
    if (!playerProp || playerProp.houses === 0) return;

    const newBalance = player.balance + HOUSE_COST / 2;
    const newHouses = playerProp.houses - 1;

    // Update local state
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            balance: newBalance,
            properties: p.properties.map((pr: any) =>
              pr.name === propertyName ? { ...pr, houses: newHouses } : pr
            ),
          };
        }
        return p;
      })
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, playerId, newBalance);
      await updatePropertyOnPlayer(gameId, playerId, propertyName, {
        houses: newHouses,
      });
    }
  };

  const addHotel = async (playerId, propertyName) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find((pr) => pr.name === propertyName);
    if (!playerProp) return;

    // Check if player has monopoly before allowing hotel purchase
    if (!hasMonopoly(player, propertyName)) {
      alert("You must own all properties in this color group to build hotels!");
      return;
    }

    // Check if property is mortgaged
    if (playerProp.mortgaged) {
      alert("You cannot build on a mortgaged property!");
      return;
    }

    // Check if property has exactly 4 houses before allowing hotel
    if (playerProp.houses !== 4) {
      alert("You must have exactly 4 houses before building a hotel!");
      return;
    }

    // Check building shortage for hotels
    const available = getAvailableBuildings();
    if (available.hotels <= 0) {
      alert(
        "Building Shortage! No hotels available. Wait for other players to sell hotels."
      );
      return;
    }

    if (
      player.balance >= HOTEL_COST &&
      playerProp.houses === 4 &&
      !playerProp.hotel
    ) {
      const newBalance = player.balance - HOTEL_COST;

      // Update local state - converting 4 houses to 1 hotel returns 4 houses to the bank
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === playerId) {
            return {
              ...p,
              balance: newBalance,
              properties: p.properties.map((pr: any) =>
                pr.name === propertyName
                  ? { ...pr, houses: 0, hotel: true }
                  : pr
              ),
            };
          }
          return p;
        })
      );

      // Sync to Firebase in multiplayer mode
      if (isMultiplayer && gameId) {
        await updatePlayerBalance(gameId, playerId, newBalance);
        await updatePropertyOnPlayer(gameId, playerId, propertyName, {
          houses: 0,
          hotel: true,
        });
      }
    }
  };

  const calculateRent = (ownerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const owner = players.find((p) => p.id === ownerId);
    if (!owner) return 0;
    const ownerProp = owner.properties.find((pr) => pr.name === propertyName);
    if (!ownerProp) return 0;

    if (property.group === "railroad") {
      const railroadCount = owner.properties.filter((pr) => {
        const prop = PROPERTIES.find((p) => p.name === pr.name);
        return prop.group === "railroad";
      }).length;
      return property.rent[railroadCount - 1] || 0;
    }

    if (property.group === "utility") {
      return null;
    }

    if (property.rent && property.rent.length > 0) {
      const groupProperties = PROPERTIES.filter(
        (p) => p.group === property.group
      );
      const ownerGroupProperties = owner.properties.filter((pr) => {
        const prop = PROPERTIES.find((p) => p.name === pr.name);
        return prop.group === property.group;
      });

      const hasMonopoly =
        groupProperties.length === ownerGroupProperties.length;

      if (ownerProp.hotel) {
        return property.rent[5] || 0;
      } else if (ownerProp.houses > 0) {
        return property.rent[ownerProp.houses] || 0;
      } else if (hasMonopoly) {
        return (property.rent[0] || 0) * 2;
      } else {
        return property.rent[0] || 0;
      }
    }

    return 0;
  };

  const payRent = (fromId, toId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const owner = players.find((p) => p.id === toId);
    if (!owner) return;

    let rentAmount = 0;

    if (property.group === "utility") {
      const utilityCount = owner.properties.filter((pr) => {
        const prop = PROPERTIES.find((p) => p.name === pr.name);
        return prop.group === "utility";
      }).length;

      const multiplier = utilityCount === 2 ? 10 : 4;
      const roll = parseInt(utilityDiceRoll) || 0;
      rentAmount = roll * multiplier;
    } else {
      rentAmount = calculateRent(toId, propertyName);
    }

    if (rentAmount > 0) {
      transferMoney(fromId, toId, rentAmount.toString());
    }
  };

  const passGo = (playerId) => {
    const doubleGoEnabled = gameConfig?.doubleGoOnLanding || false;
    const passGoAmountToUse = gameConfig?.passGoAmount || PASS_GO_AMOUNT;
    const amount = doubleGoEnabled ? passGoAmountToUse * 2 : passGoAmountToUse;
    updateBalance(playerId, amount);

    const player = players.find((p) => p.id === playerId);
    if (player) {
      const message = doubleGoEnabled
        ? `🎉 ${
            player.name
          } landed on GO! Double bonus: $${amount.toLocaleString()}`
        : `${player.name} passed GO and collected $${amount.toLocaleString()}`;

      showToastMessage(message);
      addHistoryEntry("passGo", message, player.name);
    }
  };

  // Enhanced pay system handlers
  const handleBankerPays = () => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (playerIdToUse === null) {
      showError("Please select which player you are first");
      return;
    }
    setNumberPadTitle("Teller Pays");
    setNumberPadCallback(() => (amount) => {
      updateBalance(playerIdToUse, amount);
    });
    setShowNumberPad(true);
  };

  const handlePayRentClick = (landlordId) => {
    setSelectedLandlord(landlordId);
    setShowPayPlayerModal(false);
    setShowRentSelector(true);
  };

  const handleCustomAmountClick = (toPlayerId) => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    setNumberPadTitle(
      `Pay to ${players.find((p) => p.id === toPlayerId)?.name}`
    );
    setNumberPadCallback(() => (amount) => {
      transferMoney(playerIdToUse, toPlayerId, amount.toString());
    });
    setShowPayPlayerModal(false);
    setShowNumberPad(true);
  };

  const handlePayRent = (amount, propertyName) => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (selectedLandlord !== null && playerIdToUse !== null) {
      transferMoney(playerIdToUse, selectedLandlord, amount.toString());
      setShowRentSelector(false);
      setSelectedLandlord(null);
    }
  };

  // Execute a trade (used for accepting trades and single-player trades)
  const executeTrade = async (
    fromPlayerId,
    toPlayerId,
    offerMoney,
    offerProperties,
    requestMoney,
    requestProperties
  ) => {
    const fromPlayer = players.find((p) => p.id === fromPlayerId);
    const toPlayer = players.find((p) => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) return;

    // Transfer money
    if (offerMoney > 0 || requestMoney > 0) {
      const netTransfer = requestMoney - offerMoney;
      if (netTransfer > 0) {
        await transferMoney(
          toPlayerId,
          fromPlayerId,
          Math.abs(netTransfer).toString()
        );
      } else if (netTransfer < 0) {
        await transferMoney(
          fromPlayerId,
          toPlayerId,
          Math.abs(netTransfer).toString()
        );
      }
    }

    // Transfer properties from fromPlayer to toPlayer
    for (const propName of offerProperties) {
      const prop = fromPlayer.properties.find((p) => p.name === propName);
      if (!prop) continue;

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === fromPlayerId
            ? {
                ...p,
                properties: p.properties.filter((pr) => pr.name !== propName),
              }
            : p.id === toPlayerId
            ? { ...p, properties: [...p.properties, prop] }
            : p
        )
      );

      if (isMultiplayer && gameId) {
        await removePropertyFromPlayer(gameId, fromPlayerId, propName);
        await addPropertyToPlayer(gameId, toPlayerId, prop);
      }
    }

    // Transfer properties from toPlayer to fromPlayer
    for (const propName of requestProperties) {
      const prop = toPlayer.properties.find((p) => p.name === propName);
      if (!prop) continue;

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === toPlayerId
            ? {
                ...p,
                properties: p.properties.filter((pr) => pr.name !== propName),
              }
            : p.id === fromPlayerId
            ? { ...p, properties: [...p.properties, prop] }
            : p
        )
      );

      if (isMultiplayer && gameId) {
        await removePropertyFromPlayer(gameId, toPlayerId, propName);
        await addPropertyToPlayer(gameId, fromPlayerId, prop);
      }
    }

    // Add to history
    await addHistoryEntry(
      "transaction",
      `${fromPlayer.name} and ${toPlayer.name} completed a trade`
    );

    // Show success message
    setToastMessage("Trade completed successfully!");
    setShowToast(true);
  };

  const handleProposeTrade = async (
    toPlayerId,
    offerMoney,
    offerProperties,
    requestMoney,
    requestProperties
  ) => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (!playerIdToUse) return;
    if (isMultiplayer && !gameId) return;

    const fromPlayer = players.find((p) => p.id === playerIdToUse);
    const toPlayer = players.find((p) => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) return;

    // Validate the trade
    if (offerMoney > fromPlayer.balance) {
      alert("You don't have enough money to offer!");
      return;
    }

    if (requestMoney > toPlayer.balance) {
      alert("They don't have enough money!");
      return;
    }

    // In multiplayer, create a trade offer that the other player can accept/reject/counter
    if (isMultiplayer) {
      await proposeTrade(gameId, {
        fromPlayerId: String(playerIdToUse),
        toPlayerId: String(toPlayerId),
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties,
        isCounterOffer: false,
      });

      // Close the trade modal
      setShowTradeModal(false);

      // Show toast notification
      setToastMessage(`Trade offer sent to ${toPlayer.name}`);
      setShowToast(true);
    } else {
      // In single player, execute immediately with confirmation
      const tradeSummary = `Trade with ${toPlayer.name}:\n\nYou give:\n${
        offerMoney > 0 ? `- $${offerMoney.toLocaleString()}\n` : ""
      }${offerProperties.join("\n- ")}\n\nYou receive:\n${
        requestMoney > 0 ? `- $${requestMoney.toLocaleString()}\n` : ""
      }${requestProperties.join("\n- ")}\n\nAccept this trade?`;

      if (!window.confirm(tradeSummary)) {
        return;
      }

      await executeTrade(
        playerIdToUse,
        toPlayerId,
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties
      );
    }
  };

  const handleAcceptTrade = async () => {
    if (!tradeOffer || !gameId) return;

    // Execute the trade
    await executeTrade(
      tradeOffer.fromPlayerId,
      tradeOffer.toPlayerId,
      tradeOffer.offerMoney,
      tradeOffer.offerProperties,
      tradeOffer.requestMoney,
      tradeOffer.requestProperties
    );

    // Clear the trade offer
    await clearTrade(gameId);
  };

  const handleRejectTrade = async () => {
    if (!tradeOffer || !gameId) return;

    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    const fromPlayer = players.find((p) => p.id === tradeOffer.fromPlayerId);
    const toPlayer = players.find((p) => p.id === tradeOffer.toPlayerId);

    // Clear the trade offer
    await clearTrade(gameId);

    // Show notification
    if (String(playerIdToUse) === String(tradeOffer.toPlayerId)) {
      setToastMessage(`Trade offer from ${fromPlayer?.name} rejected`);
    } else {
      setToastMessage(`${toPlayer?.name} rejected your trade offer`);
    }
    setShowToast(true);
  };

  const handleCounterOffer = async (
    offerMoney: number,
    offerProperties: string[],
    requestMoney: number,
    requestProperties: string[]
  ) => {
    if (!tradeOffer || !gameId) return;

    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (!playerIdToUse) return;

    const fromPlayer = players.find((p) => p.id === playerIdToUse);
    const toPlayer = players.find((p) => p.id === tradeOffer.fromPlayerId);

    if (!fromPlayer || !toPlayer) return;

    // Validate the counter offer
    if (offerMoney > fromPlayer.balance) {
      alert("You don't have enough money to offer!");
      return;
    }

    if (requestMoney > toPlayer.balance) {
      alert("They don't have enough money!");
      return;
    }

    // Create counter offer (swap from/to since we're countering)
    await proposeTrade(gameId, {
      fromPlayerId: String(playerIdToUse),
      toPlayerId: String(tradeOffer.fromPlayerId),
      offerMoney,
      offerProperties,
      requestMoney,
      requestProperties,
      isCounterOffer: true,
    });

    // Show notification
    setToastMessage(`Counter offer sent to ${toPlayer.name}`);
    setShowToast(true);
  };

  const handlePayTax = async (amount, taxType) => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (!playerIdToUse) return;

    const player = players.find((p) => p.id === playerIdToUse);
    if (!player || player.balance < amount) {
      alert("Not enough money to pay tax!");
      return;
    }

    const newBalance = player.balance - amount;

    // Deduct tax from player
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerIdToUse ? { ...p, balance: newBalance } : p
      )
    );

    if (taxType === "Jail Fee") {
      await updateJailStatus(playerIdToUse, false, 0, JAIL_INDEX);
    }

    // Check if Free Parking jackpot is enabled
    const freeParkingEnabled = gameConfig?.freeParkingJackpot || false;

    if (freeParkingEnabled) {
      // Add to Free Parking
      setFreeParkingBalance((prev) => prev + amount);

      if (isMultiplayer && gameId) {
        await updatePlayerBalance(gameId, playerIdToUse, newBalance);
        await addToFreeParking(gameId, amount);
      }
    } else {
      // Money goes to banker (just removed from game)
      if (isMultiplayer && gameId) {
        await updatePlayerBalance(gameId, playerIdToUse, newBalance);
      }
    }
  };

  const handleClaimFreeParking = async () => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (!playerIdToUse) return;

    if (freeParkingBalance <= 0) {
      alert("No money in Free Parking!");
      return;
    }

    const player = players.find((p) => p.id === playerIdToUse);
    if (!player) return;

    const amount = freeParkingBalance;

    // Give money to player
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerIdToUse ? { ...p, balance: p.balance + amount } : p
      )
    );

    // Reset Free Parking balance
    setFreeParkingBalance(0);

    if (isMultiplayer && gameId) {
      await claimFreeParking(gameId, playerIdToUse);
    }

    // Add to history
    addHistoryEntry(
      "freeParking",
      `${player.name} collected $${amount.toLocaleString()} from Free Parking!`,
      player.name
    );

    alert(
      `${player.name} collected $${amount.toLocaleString()} from Free Parking!`
    );
  };

  const handleStartAuction = async (property: any) => {
    setAuctionProperty(property);
    setAuctionState({
      active: true,
      propertyName: property.name,
      propertyPrice: property.price,
      startedBy: isMultiplayer ? firebasePlayerId : currentPlayerId,
      bids: [],
      dropouts: [],
    });
    setShowAuctionModal(true);

    if (isMultiplayer && gameId && firebasePlayerId) {
      await startAuctionFirebase(
        gameId,
        property.name,
        property.price,
        firebasePlayerId.toString()
      );
    }
  };

  const handlePlaceAuctionBid = async (
    playerId: string | number,
    amount: number
  ) => {
    if (!auctionState || !auctionState.active) return;
    const bidder = players.find((p) => idsMatch(p.id, playerId));
    if (!bidder) return;

    const bid = {
      playerId,
      playerName: bidder.name,
      amount,
      timestamp: Date.now(),
    };

    setAuctionState((prev) =>
      prev
        ? { ...prev, bids: [...(prev.bids || []), bid] }
        : {
            active: true,
            propertyName: "",
            propertyPrice: 0,
            bids: [bid],
            dropouts: [],
          }
    );

    if (isMultiplayer && gameId) {
      await placeAuctionBidFirebase(gameId, {
        ...bid,
        playerId: playerId.toString(),
      });
    }
  };

  const handleDropOutAuction = async (playerId: string | number) => {
    setAuctionState((prev) =>
      prev
        ? {
            ...prev,
            dropouts: prev.dropouts?.some((d) => idsMatch(d, playerId))
              ? prev.dropouts
              : [...(prev.dropouts || []), playerId],
          }
        : prev
    );

    if (isMultiplayer && gameId) {
      await dropOutAuctionFirebase(gameId, playerId.toString());
    }
  };

  const handleAuctionComplete = async () => {
    const canResolve =
      !isMultiplayer ||
      (auctionState?.startedBy &&
        firebasePlayerId &&
        idsMatch(auctionState.startedBy, firebasePlayerId));

    // If this client isn't the resolver in multiplayer, just wait for sync
    if (!canResolve) return;

    if (!auctionProperty || !auctionState || !auctionState.bids?.length) {
      alert("No bids placed! Property remains unowned.");
      setShowAuctionModal(false);
      setAuctionState(null);
      setAuctionProperty(null);
      if (isMultiplayer && gameId) {
        await endAuctionFirebase(gameId);
      }
      // Allow immediately starting another auction
      setShowAuctionSelector(true);
      return;
    }

    const highestBid = auctionState.bids.reduce(
      (max, bid) => (bid.amount > max.amount ? bid : max),
      auctionState.bids[0]
    );

    const winner = players.find((p) => idsMatch(p.id, highestBid.playerId));
    if (!winner) return;

    const newBalance = Math.max(0, winner.balance - highestBid.amount);
    setPlayers((prev) =>
      prev.map((p) => (p.id === winner.id ? { ...p, balance: newBalance } : p))
    );

    const propertyToAdd = {
      ...auctionProperty,
      houses: 0,
      hotel: false,
      mortgaged: false,
    };

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === winner.id
          ? { ...p, properties: [...(p.properties || []), propertyToAdd] }
          : p
      )
    );

    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, winner.id, newBalance);
      await addPropertyToPlayer(gameId, winner.id, propertyToAdd);
      await endAuctionFirebase(gameId);
    }

    setShowAuctionModal(false);
    setAuctionState(null);
    setAuctionProperty(null);

    // Add to history
    addHistoryEntry(
      "auction",
      `🎉 ${winner.name} won ${
        auctionProperty.name
      } for $${highestBid.amount.toLocaleString()}!`,
      winner.name
    );

    alert(
      `🎉 ${winner.name} won ${
        auctionProperty.name
      } for $${highestBid.amount.toLocaleString()}!`
    );
  };

  const handleNewGameSamePlayers = () => {
    // Reset game state but keep players
    const resetPlayers = players.map((p) => ({
      ...p,
      balance: STARTING_MONEY,
      properties: [],
      doublesCount: 0,
      isBankrupt: false,
    }));

    setPlayers(resetPlayers);
    setFreeParkingBalance(0);
    setLastRoll(null);
    setDiceRolling(false);

    // Reset any active modals
    setShowBuyProperty(false);
    setShowPayPlayerModal(false);
    setShowRentSelector(false);
    setShowNumberPad(false);
    setShowTradeModal(false);
    setShowTaxModal(false);

    // If multiplayer, reset the game in Firebase
    if (isMultiplayer && gameId) {
      // Reset each player in Firebase
      resetPlayers.forEach((player) => {
        updatePlayer(gameId, player.id, {
          balance: STARTING_MONEY,
          properties: [],
          doublesCount: 0,
          isBankrupt: false,
        });
      });

      // Reset game state
      resetGameFirebase(gameId);
    }
  };

  const handleCompleteReset = () => {
    if (isMultiplayer) {
      // In multiplayer mode, navigate back to home page
      window.location.href = "/";
    } else {
      // In single player mode, go back to the setup screen
      setScreen("home");
      setPlayers([]);
      setNumPlayers(0);
      setPlayerNames(["", "", "", "", "", "", "", ""]);
      setPlayerPieces(["", "", "", "", "", "", "", ""]);
      setPlayerColors(["", "", "", "", "", "", "", ""]);
      setCurrentPlayerId(0);
      setFreeParkingBalance(0);
    }
  };

  const DiceIcon = ({ value }) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1];
    return <Icon className="w-16 h-16" />;
  };

  const Modal = ({ children, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
        <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="float-right text-amber-400 hover:text-amber-300 mb-2"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="clear-both">{children}</div>
        </div>
      </div>
    );
  };

  if (screen === "setup") {
    return (
      <div
        className="min-h-screen bg-black text-amber-50 p-8 relative overflow-hidden"
        style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}
      >
        {/* Error Toast */}
        {errorMessage && (
          <div
            className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            {errorMessage}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img
                src="/images/digitalbankerlogo.svg"
                alt="Digital Banker"
                className="w-64 h-auto"
              />
            </div>
            <h1 className="text-5xl font-bold mb-2 text-amber-400">
              DIGITAL BANKER
            </h1>
            <p className="text-amber-600">Digital Banking System</p>
          </div>

          {numPlayers === 0 ? (
            <div className="bg-zinc-900 rounded-lg p-8 border border-amber-900/30">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">
                Select Number of Players
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumPlayers(num)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-3xl font-bold py-8 rounded transition-colors border border-amber-900/30"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-lg p-8 border border-amber-900/30">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">
                Setup Players
              </h2>
              <div className="space-y-4 mb-8">
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-800 rounded p-4 border border-amber-900/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-lg font-bold text-amber-400">
                        Player {i + 1}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={`Player ${i + 1} Name`}
                      value={playerNames[i]}
                      maxLength={20}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value.slice(0, 20);
                        setPlayerNames(newNames);
                      }}
                      className="w-full bg-zinc-900 text-amber-50 px-4 py-2 rounded border border-amber-900/30 focus:border-amber-600 focus:outline-none mb-3"
                    />

                    <div className="mb-3">
                      <p className="text-xs text-amber-600 mb-2">
                        Select Piece:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {GAME_PIECES.map((piece) => {
                          const isUsed = playerPieces.some(
                            (p, idx) => p === piece.id && idx !== i
                          );
                          return (
                            <button
                              key={piece.id}
                              onClick={() => {
                                if (!isUsed) {
                                  const newPieces = [...playerPieces];
                                  newPieces[i] = piece.id;
                                  setPlayerPieces(newPieces);
                                }
                              }}
                              disabled={isUsed}
                              className={`p-3 rounded border transition-all ${
                                playerPieces[i] === piece.id
                                  ? "bg-amber-600 border-amber-500 text-black"
                                  : isUsed
                                  ? "bg-zinc-900 border-zinc-700 opacity-30 cursor-not-allowed"
                                  : "bg-zinc-900 border-amber-900/30 hover:border-amber-600"
                              }`}
                            >
                              <img
                                src={piece.icon}
                                alt={piece.name}
                                className="w-6 h-6 mx-auto"
                              />
                              <div className="text-xs mt-1">{piece.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-amber-600 mb-2">
                        Select Color:
                      </p>
                      <div className="grid grid-cols-8 gap-1 sm:gap-2">
                        {PLAYER_COLORS.map((color) => {
                          const isUsed = playerColors.some(
                            (c, idx) => c === color && idx !== i
                          );
                          return (
                            <button
                              key={color}
                              onClick={() => {
                                if (!isUsed) {
                                  const newColors = [...playerColors];
                                  newColors[i] = color;
                                  setPlayerColors(newColors);
                                }
                              }}
                              disabled={isUsed}
                              className={`w-6 h-6 sm:w-10 sm:h-10 rounded ${color} ${
                                playerColors[i] === color
                                  ? "ring-2 sm:ring-4 ring-amber-400"
                                  : isUsed
                                  ? "opacity-30 cursor-not-allowed"
                                  : "hover:ring-2 ring-amber-600"
                              } transition-all`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setNumPlayers(0)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
                >
                  Back
                </button>
                <button
                  onClick={startGame}
                  disabled={
                    playerPieces.slice(0, numPlayers).some((p) => !p) ||
                    playerColors.slice(0, numPlayers).some((c) => !c)
                  }
                  className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-amber-900 text-black font-bold py-3 rounded transition-colors"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-amber-50 p-2 sm:p-4 relative overflow-hidden"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Bot turn overlay */}
      {!isMultiplayer && isBotTakingTurn && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-amber-500 rounded-lg px-6 py-4 text-center shadow-lg">
            <p className="text-lg font-bold text-amber-400 mb-2">Bot Turn</p>
            <p className="text-sm text-amber-100">
              {botTurnMessage || "Bot is taking actions..."}
            </p>
            {botTurnLog.length > 0 && (
              <div className="mt-3 text-left text-xs text-amber-300 max-w-xs mx-auto space-y-1">
                {botTurnLog.map((msg, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800/80 px-2 py-1 rounded border border-amber-900/40"
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div
          className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          style={{ top: "max(1rem, env(safe-area-inset-top))" }}
        >
          {errorMessage}
        </div>
      )}
      {/* Card Modal */}
      {cardModal.open && cardModal.card && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-amber-500 rounded-lg p-6 max-w-md w-full shadow-lg">
            <p className="text-sm uppercase text-amber-400 font-semibold mb-2">
              {cardModal.card.type === "chance" ? "Chance" : "Community Chest"}
            </p>
            <p className="text-lg text-amber-50 font-bold mb-4">
              {cardModal.card.text}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCardModal({ open: false })}
                className="px-4 py-2 rounded bg-zinc-800 text-amber-200 hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => applyCard(cardModal.card!, cardModal.playerId!)}
                className="px-4 py-2 rounded bg-amber-600 text-black font-bold hover:bg-amber-500 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bot Control Modal */}
      {showBotControlModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-amber-500 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <p className="text-lg font-bold text-amber-400">Bot Controls</p>
              <button
                onClick={() => setShowBotControlModal(false)}
                className="text-amber-300 hover:text-amber-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {players
                .filter((p) => p.isBot)
                .map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded border border-amber-900/30"
                  >
                    <div>
                      <p className="text-sm text-amber-100 font-semibold">
                        {bot.name}
                      </p>
                      <p className="text-xs text-amber-500">
                        Mode: {bot.botAutoPlay === false ? "Manual" : "Auto"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const auto = bot.botAutoPlay === false ? true : false;
                        // Update locally for responsiveness
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === bot.id ? { ...p, botAutoPlay: auto } : p
                          )
                        );
                        if (isMultiplayer && gameId) {
                          updatePlayer(gameId, bot.id as string, {
                            botAutoPlay: auto,
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        bot.botAutoPlay === false
                          ? "bg-zinc-800 text-amber-300 border border-amber-900/50"
                          : "bg-amber-700 text-black"
                      }`}
                    >
                      {bot.botAutoPlay === false ? "Set Auto" : "Set Manual"}
                    </button>
                  </div>
                ))}
              <p className="text-xs text-amber-500">
                Manual bots do not auto-play; use the normal controls to act for
                them and End Turn to advance.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* BANKER CARD - Reorganized with all main actions */}
        <div className="relative bg-zinc-900 rounded-lg pb-0 mb-2 border border-amber-500 overflow-shown shadow-lg drop-shadow-[0_0_10px_white] ">
          {/* Header */}
          <div className="relative flex-col flex items-center justify-center ">
            <div className=" relative flex items-center justify-center">
              <h1 className="text-3xl drop-shadow-[0_0_10px_gold] font-bold text-amber-400 drop-shadow-lg mt-3 text-center">
                DIGITAL BANKER
              </h1>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/100 text-amber-400"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Room Code Display */}
          {isMultiplayer && gameCode && (
            <div className="text-center text-xs text-amber-600 mb-2">
              Room Code:{" "}
              <span className="font-bold text-amber-500">{gameCode}</span>
            </div>
          )}
          {!isMultiplayer && activePlayer && (
            <div className="text-center text-sm text-amber-300 mb-2 flex items-center justify-center gap-2">
              <span>
                Turn:{" "}
                <span className="font-bold text-amber-100">
                  {activePlayer.name || "Player"}
                </span>{" "}
                {activePlayer.isBot && (
                  <span className="text-amber-500">(Bot)</span>
                )}
              </span>
              {activePlayer.isBot && (
                <button
                  onClick={() => setShowBotControlModal(true)}
                  className="text-xs bg-amber-700 text-black px-2 py-1 rounded hover:bg-amber-600 transition-colors"
                >
                  Bot Controls
                </button>
              )}
            </div>
          )}

          {/* Pro Features Row - Free Parking & Auction */}
          <div className="flex justify-center gap-3 mb-3 flex-wrap">
            {/* Free Parking Display */}
            {(gameConfig?.freeParkingJackpot ||
              (isMultiplayer && freeParkingBalance > 0)) && (
              <div className="bg-green-900/30 border-2 border-green-600 rounded-3xl px-4 py-2 drop-shadow-[0_0_10px_green]">
                <div className="text-center">
                  <div className="text-xs text-green-400 font-bold">
                    FREE PARKING
                  </div>
                  <div className="text-2xl font-bold text-green-300">
                    ${freeParkingBalance.toLocaleString()}
                  </div>
                  <button
                    onClick={handleClaimFreeParking}
                    disabled={freeParkingBalance <= 0}
                    className="mt-2 bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                  >
                    Claim Money
                  </button>
                </div>
              </div>
            )}

            {/* Auction Button */}
            {gameConfig?.auctionProperties && (
              <div className="bg-purple-900/30 border-2 border-purple-600 drop-shadow-[0_0_10px_purple] rounded-3xl px-4 py-2">
                <div className="text-center">
                  <div className="text-xs text-purple-400 font-bold">
                    PROPERTY AUCTION
                  </div>
                  <div className="text-sm text-purple-300 mt-1 mb-2">
                    Start an auction
                  </div>
                  <button
                    onClick={() => setShowAuctionSelector(true)}
                    className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-xs transition-colors flex items-center gap-1 mx-auto"
                  >
                    <Gavel className="w-4 h-4" />
                    Start Auction
                  </button>
                </div>
              </div>
            )}

            {/* Chance / Community */}
            <div className="bg-amber-900/20 border-2 border-amber-600 rounded-3xl px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-amber-400 font-bold">CARDS</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleDrawCard("chance")}
                    className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-1 px-3 rounded text-xs transition-colors"
                  >
                    Draw Chance
                  </button>
                  <button
                    onClick={() => handleDrawCard("community")}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 font-bold py-1 px-3 rounded text-xs transition-colors"
                  >
                    Draw Community
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Building Counter Display */}
          {(() => {
            const available = getAvailableBuildings();
            return (
              <div className="flex justify-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded border border-amber-900/30">
                  <img
                    src="/images/House.svg"
                    alt="Houses"
                    className="w-10 h-10 drop-shadow-[0_0_10px_green]"
                  />
                  <span
                    className={`font-bold ${
                      available.houses <= 5 ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {available.houses}/{TOTAL_HOUSES}
                  </span>
                  <span className="text-amber-600">available</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded border border-amber-900/30">
                  <img
                    src="/images/Hotel.svg"
                    alt="Hotels"
                    className="w-10 h-10 drop-shadow-[0_0_5px_red]"
                  />
                  <span
                    className={`font-bold ${
                      available.hotels <= 2 ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {available.hotels}/{TOTAL_HOTELS}
                  </span>
                  <span className="text-amber-600">available</span>
                </div>
              </div>
            );
          })()}

          {/* First Row: Banker Pays centered */}
          <button
            onClick={handleBankerPays}
            className="bg-green-300 hover:bg-green-200 w-40 h-10 text-black text-xl rounded-xl font-bold transition-colors flex text-center items-center justify-center gap-2 mb-3 mx-auto relative"
          >
            <img
              src="/images/Banker.svg"
              alt="Banker"
              className="w-auto h-20 flex right-40 absolute drop-shadow-[0_0_3px_white]"
            />
            Teller Pays
          </button>
        </div>

        {/* Banker Action Buttons */}
        <div className="flex items-center gap-2 mb-2 mt-5 flex-wrap justify-center">
          {/* Second Row: Pass GO and Buy Property */}
          <div className="flex gap-2 flex-wrap justify-center w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const playerIdToUse = isMultiplayer
                  ? firebasePlayerId
                  : currentPlayerId;
                if (playerIdToUse === null) {
                  showError("Please select which player you are first");
                  return;
                }
                passGo(playerIdToUse);
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-9 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <img
                src="/images/Go.svg"
                alt="GO"
                className="w-auto h-20 -mt-3 -mb-3 pointer-events-none"
              />
              Pass GO
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const playerIdToUse = isMultiplayer
                  ? firebasePlayerId
                  : currentPlayerId;
                if (playerIdToUse === null) {
                  showError("Please select which player you are first");
                  return;
                }
                setShowBuyProperty(true);
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-9 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <img
                src="/images/property.svg"
                alt="property"
                className="w-auto h-20 pb-1 pt-1 -mt-2 -mb-2 pointer-events-none"
              />
              Buy Property
            </button>
          </div>

          {/* Roll Dice Section */}
          <div className="w-full border-t border-green-900 -mt-8">
            <button
              onClick={() => rollDice()}
              disabled={diceRolling || (isActiveBot && isBotTakingTurn)}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 py-3 rounded-lg  font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Dice1 className="w-6 h-6" />
              {diceRolling ? "Rolling..." : "Roll Dice"}
            </button>

            <div className="mt-2">
              <button
                onClick={() => {
                  // In multiplayer, this should update the turn index in the backend
                  if (isMultiplayer) {
                    // TODO: Implement multiplayer turn advancement (update turn index in backend)
                    // For now, just call goToNextTurn locally
                    goToNextTurn();
                  } else {
                    goToNextTurn();
                  }
                }}
                disabled={
                  players.length === 0 ||
                  (isActiveBot && isBotTakingTurn) ||
                  // Only allow the active player to end their turn
                  (isMultiplayer &&
                    firebasePlayerId !== undefined &&
                    players[activeTurnIndex]?.id !== firebasePlayerId)
                }
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 text-amber-200 disabled:text-zinc-500 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                End Turn
              </button>
            </div>

            {lastRoll && (
              <div className="mt-3 bg-zinc-800 p-3 rounded-lg border border-amber-900/30 text-center">
                <div className="flex justify-center gap-3 mb-2">
                  {[lastRoll.d1, lastRoll.d2, lastRoll.d3]
                    .filter((d) => d !== null && d !== undefined)
                    .map((die, idx) => {
                      if (!die) return null;
                      const DiceIconComponent = [
                        Dice1,
                        Dice2,
                        Dice3,
                        Dice4,
                        Dice5,
                        Dice6,
                      ][die - 1];
                      return (
                        <DiceIconComponent
                          key={idx}
                          className={`w-10 h-10  ${
                            idx === 2 ? "text-blue-400" : "text-amber-400"
                          }`}
                        />
                      );
                    })}
                </div>
                <p className="text-xl font-bold text-amber-400 animate-pulse">
                  Total: {lastRoll.total}
                </p>
                {lastRoll.isDoubles && (
                  <p className="text-green-400 text-sm mt-1">Doubles!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {(showDice || diceRolling) && lastRoll && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-4 sm:p-8">
              <div className="flex gap-3 sm:gap-6 items-center justify-center text-amber-400">
                <DiceIcon value={lastRoll.d1} />
                <div className="text-2xl sm:text-4xl font-bold">+</div>
                <DiceIcon value={lastRoll.d2} />
                {lastRoll.d3 && (
                  <>
                    <div className="text-2xl sm:text-4xl font-bold">+</div>
                    <div className="relative">
                      <DiceIcon value={lastRoll.d3} />
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded">
                        Speed
                      </div>
                    </div>
                  </>
                )}
                <div className="text-2xl sm:text-4xl font-bold">=</div>
                <div className="text-3xl sm:text-5xl font-bold text-amber-400">
                  {lastRoll.total}
                </div>
              </div>
              {lastRoll.isDoubles && !diceRolling && (
                <div className="text-lg sm:text-2xl font-bold text-center mt-2 sm:mt-4 text-amber-400 animate-pulse">
                  DOUBLES!
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLAYERS LIST */}
        <div className="space-y-3">
          {players.map((player) => {
            const playerIdToCompare = isMultiplayer
              ? firebasePlayerId
              : currentPlayerId;
            const isCurrentUser = player.id === playerIdToCompare;
            // Board position label
            let positionLabel = null;
            if (typeof player.position === "number" && player.position >= 0) {
              positionLabel =
                BOARD_SPACES[player.position] || `#${player.position}`;
            }
            // Jail badge
            const jailBadge = player.inJail ? (
              <span className="ml-2 px-2 py-0.5 rounded bg-red-800 text-red-100 text-xs font-bold">
                JAIL
              </span>
            ) : null;

            return (
              <div
                key={player.id}
                className={`bg-zinc-900 rounded-lg p-4 border-2 transition-all ${
                  isCurrentUser ? "border-amber-600" : "border-amber-900/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 ${player.color} rounded flex items-center justify-center p-1`}
                    >
                      {(() => {
                        const piece =
                          player.piece ||
                          GAME_PIECES.find((p) => p.id === player.pieceId);
                        return piece ? (
                          <img
                            src={piece.icon}
                            alt={piece.name}
                            className="w-full h-full object-contain"
                          />
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-50 text-center flex items-center gap-2">
                        {player.name}
                        {jailBadge}
                        {positionLabel && (
                          <span className="ml-1 px-2 py-0.5 rounded bg-zinc-700 text-amber-200 text-xs font-semibold border border-amber-900/40">
                            {positionLabel}
                          </span>
                        )}
                      </h3>
                      <div className="text-2xl font-bold text-green-400">
                        ${player.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentUser && (
                      <div className="px-4 py-2 rounded font-bold bg-amber-600 text-black">
                        You
                      </div>
                    )}
                    {!isCurrentUser && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePayRentClick(player.id)}
                          disabled={player.properties.length === 0}
                          className="w-full h-11 bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1 ml-3"
                        >
                          <img
                            src="/images/property.svg"
                            alt="Pay Rent"
                            className="w-auto h-12"
                          />
                          Pay Rent
                        </button>
                        <button
                          onClick={() => handleCustomAmountClick(player.id)}
                          className="w-full h-11 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                        >
                          <img
                            src="/images/Payment.svg"
                            alt="Pay"
                            className="w-auto h-10"
                          />
                          Pay
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player-specific action buttons - ONLY SHOW IF THIS IS THE CURRENT USER */}
                {isCurrentUser && (
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    <button
                      onClick={() => setShowPayPlayerModal(true)}
                      className="w-auto h-11 bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <img
                        src="/images/Payment.svg"
                        alt="Pay"
                        className="w-auto h-12"
                      />
                      Pay
                    </button>

                    <button
                      onClick={() => {
                        setNumberPadTitle("Receive Money");
                        setNumberPadCallback(() => (amount: number) => {
                          updateBalance(player.id, amount);
                        });
                        setShowNumberPad(true);
                      }}
                      className="w-auto h-11 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <img
                        src="/images/Bank.svg"
                        alt="Bank"
                        className="w-full h-12"
                      />
                      Receive
                    </button>

                    <button
                      onClick={() => setShowTradeModal(true)}
                      className="w-auto h-11 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                      disabled={players.length < 2}
                    >
                      <img
                        src="/images/Trade.svg"
                        alt="Trade"
                        className="w-auto h-12"
                      />
                      Trade
                    </button>

                    <button
                      onClick={() => setShowTaxModal(true)}
                      className="w-auto h-11 bg-red-700 hover:bg-red-600 content-center text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <img
                        src="/images/Luxury_Tax.svg"
                        alt="Tax"
                        className="w-auto h-12"
                      />
                      Pay Tax
                    </button>
                  </div>
                )}

                {/* Properties Section */}
                {player.properties.length > 0 && (
                  <div className="mt-3 border-t border-amber-900/30 pt-3">
                    <h4 className="text-xs font-bold text-amber-500 mb-2">
                      Properties
                    </h4>
                    <div className="space-y-1">
                      {player.properties.map((prop, idx) => {
                        const property = PROPERTIES.find(
                          (p) => p.name === prop.name
                        );
                        if (!property) return null;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-zinc-900/50 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {property.group === "railroad" ? (
                                <img
                                  src="/images/Railroad.svg"
                                  alt="Railroad"
                                  className="w-4 h-4"
                                />
                              ) : property.group === "utility" ? (
                                property.name === "Electric Company" ? (
                                  <img
                                    src="/images/Electric_Company.svg"
                                    alt="Electric"
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <img
                                    src="/images/Waterworks.svg"
                                    alt="Water"
                                    className="w-4 h-4"
                                  />
                                )
                              ) : (
                                <div
                                  className={`w-3 h-3 rounded ${property.color}`}
                                ></div>
                              )}
                              <span
                                className={`${
                                  prop.mortgaged
                                    ? "text-zinc-500 line-through"
                                    : "text-amber-100"
                                }`}
                              >
                                {prop.name}
                              </span>
                              {prop.mortgaged && (
                                <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold">
                                  MORT
                                </span>
                              )}
                              {!prop.mortgaged && prop.hotel ? (
                                <span className="flex items-center gap-0.5">
                                  <img
                                    src="/images/Hotel.svg"
                                    alt="Hotel"
                                    className="w-4 h-4"
                                  />
                                </span>
                              ) : !prop.mortgaged && prop.houses > 0 ? (
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: prop.houses }).map(
                                    (_, i) => (
                                      <img
                                        key={i}
                                        src="/images/House.svg"
                                        alt="House"
                                        className="w-3 h-3"
                                      />
                                    )
                                  )}
                                </span>
                              ) : null}
                            </div>

                            {/* Manage button only for current user */}
                            {isCurrentUser && (
                              <button
                                onClick={() => {
                                  setSelectedProperty(prop.name);
                                }}
                                className="text-amber-400 hover:text-amber-300"
                              >
                                Manage
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Buy Property Modal */}
        {showBuyProperty &&
          (isMultiplayer ? firebasePlayerId : currentPlayerId) !== null && (
            <Modal onClose={() => setShowBuyProperty(false)}>
              <h3 className="text-xl font-bold text-amber-400 mb-4">
                Buy Property
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {PROPERTIES.filter(
                  (prop) =>
                    !players.some((p) =>
                      p.properties.some((owned) => owned.name === prop.name)
                    )
                ).map((property) => (
                  <div
                    key={property.name}
                    className="flex items-center justify-between bg-zinc-800 p-3 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {property.group === "railroad" ? (
                        <img
                          src="/images/Railroad.svg"
                          alt="Railroad"
                          className="w-5 h-5"
                        />
                      ) : property.group === "utility" ? (
                        property.name === "Electric Company" ? (
                          <img
                            src="/images/Electric_Company.svg"
                            alt="Electric"
                            className="w-5 h-5"
                          />
                        ) : (
                          <img
                            src="/images/Waterworks.svg"
                            alt="Water"
                            className="w-5 h-5"
                          />
                        )
                      ) : (
                        <div
                          className={`w-4 h-4 rounded ${property.color}`}
                        ></div>
                      )}
                      <span className="text-amber-100 font-bold">
                        {property.name}
                      </span>
                      <span className="text-amber-400 ml-2">
                        ${property.price}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const playerIdToUse = isMultiplayer
                          ? firebasePlayerId
                          : currentPlayerId;
                        buyProperty(playerIdToUse, property);
                        setShowBuyProperty(false);
                      }}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Buy
                    </button>
                  </div>
                ))}
                {PROPERTIES.filter(
                  (prop) =>
                    !players.some((p) =>
                      p.properties.some((owned) => owned.name === prop.name)
                    )
                ).length === 0 && (
                  <div className="text-amber-400 text-center">
                    All properties are owned.
                  </div>
                )}
              </div>
            </Modal>
          )}

        {/* Transaction Modal */}
        {transactionMode && currentPlayer !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-amber-900/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400">
                  {transactionMode === "pay" ? "Pay Money" : "Receive Money"}
                </h3>
                <button
                  onClick={() => {
                    setTransactionMode(null);
                    setCurrentPlayer(null);
                    setSelectedPlayer(null);
                    setTransactionAmount("");
                  }}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-amber-100 mb-2">
                  From: {players.find((p) => p.id === currentPlayer)?.name}
                </p>

                {transactionMode === "pay" && (
                  <div className="mb-4">
                    <label className="block text-amber-400 mb-2">To:</label>
                    <select
                      value={selectedPlayer || ""}
                      onChange={(e) =>
                        setSelectedPlayer(parseInt(e.target.value))
                      }
                      className="w-full bg-zinc-800 text-amber-100 p-2 rounded border border-amber-900/30"
                    >
                      <option value="">Select Player</option>
                      {players
                        .filter((p) => p.id !== currentPlayer)
                        .map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <label className="block text-amber-400 mb-2">Amount:</label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full bg-zinc-800 text-amber-100 p-3 rounded border border-amber-900/30 text-xl font-bold"
                  placeholder="$0"
                />
              </div>

              <button
                onClick={() => {
                  const amount = parseInt(transactionAmount);
                  if (amount && amount > 0) {
                    if (transactionMode === "pay" && selectedPlayer !== null) {
                      transferMoney(currentPlayer, selectedPlayer, amount);
                    } else if (transactionMode === "receive") {
                      updateBalance(currentPlayer, amount);
                    }
                    setTransactionMode(null);
                    setCurrentPlayer(null);
                    setSelectedPlayer(null);
                    setTransactionAmount("");
                  }
                }}
                disabled={transactionMode === "pay" && !selectedPlayer}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Property Management Modal */}
        {selectedProperty &&
          (isMultiplayer ? firebasePlayerId : currentPlayerId) !== null && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-amber-900/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-amber-400">
                    Manage Property
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedProperty(null);
                    }}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-amber-100 text-lg mb-4">
                    {selectedProperty}
                  </p>

                  {(() => {
                    const playerIdToUse = isMultiplayer
                      ? firebasePlayerId
                      : currentPlayerId;
                    const player = players.find((p) => p.id === playerIdToUse);
                    const playerProp = player?.properties.find(
                      (p) => p.name === selectedProperty
                    );
                    const property = PROPERTIES.find(
                      (p) => p.name === selectedProperty
                    );

                    if (
                      !property ||
                      property.group === "railroad" ||
                      property.group === "utility"
                    ) {
                      const mortgageValue = Math.floor(
                        (property?.price || 0) / 2
                      );
                      const unmortgageCost = Math.floor(mortgageValue * 1.1);

                      return (
                        <div className="space-y-2">
                          {playerProp?.mortgaged ? (
                            <button
                              onClick={() =>
                                unmortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              disabled={(player?.balance || 0) < unmortgageCost}
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Unmortgage (${unmortgageCost.toLocaleString()})
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                mortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 rounded transition-colors"
                            >
                              Mortgage (+${mortgageValue.toLocaleString()})
                            </button>
                          )}

                          <button
                            onClick={() =>
                              sellProperty(playerIdToUse, selectedProperty)
                            }
                            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
                          >
                            Sell Property (${(property?.price || 0) / 2})
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <div className="bg-zinc-800 p-3 rounded mb-3">
                          <p className="text-amber-100">
                            {playerProp?.hotel
                              ? "Hotel"
                              : `Houses: ${playerProp?.houses || 0}`}
                          </p>
                          {!hasMonopoly(player, selectedProperty) && (
                            <p className="text-amber-500 text-xs mt-1">
                              ⚠️ Own all properties in this color to build
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            addHouse(playerIdToUse, selectedProperty)
                          }
                          disabled={
                            !hasMonopoly(player, selectedProperty) ||
                            playerProp?.houses >= 4 ||
                            playerProp?.hotel ||
                            (player?.balance || 0) < HOUSE_COST
                          }
                          className="w-full bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <img
                            src="/images/House.svg"
                            alt="House"
                            className="w-5 h-5"
                          />
                          Add House (${HOUSE_COST})
                        </button>

                        <button
                          onClick={() =>
                            removeHouse(playerIdToUse, selectedProperty)
                          }
                          disabled={
                            !playerProp?.houses || playerProp.houses === 0
                          }
                          className="w-full bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <img
                            src="/images/House.svg"
                            alt="House"
                            className="w-5 h-5"
                          />
                          Remove House
                        </button>

                        <button
                          onClick={() =>
                            addHotel(playerIdToUse, selectedProperty)
                          }
                          disabled={
                            !hasMonopoly(player, selectedProperty) ||
                            playerProp?.houses !== 4 ||
                            playerProp?.hotel ||
                            (player?.balance || 0) < HOTEL_COST
                          }
                          className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <img
                            src="/images/Hotel.svg"
                            alt="Hotel"
                            className="w-5 h-5"
                          />
                          Add Hotel (${HOTEL_COST})
                        </button>

                        {(() => {
                          const mortgageValue = Math.floor(
                            (property?.price || 0) / 2
                          );
                          const unmortgageCost = Math.floor(
                            mortgageValue * 1.1
                          );

                          return playerProp?.mortgaged ? (
                            <button
                              onClick={() =>
                                unmortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              disabled={(player?.balance || 0) < unmortgageCost}
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Unmortgage (${unmortgageCost.toLocaleString()})
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                mortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              disabled={
                                playerProp?.houses > 0 || playerProp?.hotel
                              }
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Mortgage (+${mortgageValue.toLocaleString()})
                            </button>
                          );
                        })()}

                        <button
                          onClick={() =>
                            sellProperty(playerIdToUse, selectedProperty)
                          }
                          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
                        >
                          Sell Property (${(property?.price || 0) / 2})
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        {/* History Button - Fixed at bottom */}
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 border-2 border-amber-400"
          >
            <Clock className="w-5 h-5" />
            History
          </button>
        </div>

        {/* Auction Property Selector */}
        {showAuctionSelector && (
          <Modal onClose={() => setShowAuctionSelector(false)}>
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              Select Property to Auction
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {PROPERTIES.filter(
                (prop) =>
                  !players.some((p) =>
                    p.properties.some((owned) => owned.name === prop.name)
                  )
              ).map((property) => (
                <div
                  key={property.name}
                  className="flex items-center justify-between bg-zinc-800 p-3 rounded"
                >
                  <div className="flex items-center gap-2">
                    {property.group === "railroad" ? (
                      <img
                        src="/images/Railroad.svg"
                        alt="Railroad"
                        className="w-5 h-5"
                      />
                    ) : property.group === "utility" ? (
                      property.name === "Electric Company" ? (
                        <img
                          src="/images/Electric_Company.svg"
                          alt="Electric"
                          className="w-5 h-5"
                        />
                      ) : (
                        <img
                          src="/images/Waterworks.svg"
                          alt="Water"
                          className="w-5 h-5"
                        />
                      )
                    ) : (
                      <div
                        className={`w-4 h-4 rounded ${property.color}`}
                      ></div>
                    )}
                    <span className="text-amber-100 font-bold">
                      {property.name}
                    </span>
                    <span className="text-amber-400 ml-2">
                      ${property.price}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleStartAuction(property);
                      setShowAuctionSelector(false);
                    }}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    Start
                  </button>
                </div>
              ))}
              {PROPERTIES.filter(
                (prop) =>
                  !players.some((p) =>
                    p.properties.some((owned) => owned.name === prop.name)
                  )
              ).length === 0 && (
                <div className="text-amber-400 text-center">
                  All properties are owned.
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* NEW MODALS */}
        <PayPlayerModal
          isOpen={showPayPlayerModal}
          onClose={() => setShowPayPlayerModal(false)}
          currentPlayer={
            players.find(
              (p) =>
                p.id === (isMultiplayer ? firebasePlayerId : currentPlayerId)
            ) || players[0]
          }
          allPlayers={players}
          onPayRent={handlePayRentClick}
          onCustomAmount={handleCustomAmountClick}
        />

        <RentSelector
          isOpen={showRentSelector}
          onClose={() => {
            setShowRentSelector(false);
            setSelectedLandlord(null);
          }}
          landlord={
            players.find((p) => p.id === selectedLandlord) || players[0]
          }
          allPlayers={players}
          propertyDefinitions={PROPERTIES}
          onPayRent={handlePayRent}
        />

        <NumberPadModal
          isOpen={showNumberPad}
          onClose={() => setShowNumberPad(false)}
          onConfirm={(value) => {
            if (numberPadCallback) {
              numberPadCallback(value);
            }
          }}
          title={numberPadTitle}
        />

        <TradeModal
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          currentPlayer={
            players.find(
              (p) =>
                p.id === (isMultiplayer ? firebasePlayerId : currentPlayerId)
            ) || players[0]
          }
          allPlayers={players}
          onProposeTrade={handleProposeTrade}
        />

        <TaxModal
          isOpen={showTaxModal}
          onClose={() => setShowTaxModal(false)}
          playerBalance={
            players.find(
              (p) =>
                p.id === (isMultiplayer ? firebasePlayerId : currentPlayerId)
            )?.balance || 0
          }
          onPayTax={handlePayTax}
          onOpenCustomTaxNumberPad={() => {
            setNumberPadTitle("Custom Tax Amount");
            setNumberPadCallback(() => (amount) => {
              handlePayTax(amount, "Custom Tax");
            });
            setShowNumberPad(true);
          }}
        />

        {/* Bankruptcy Modal */}
        <BankruptcyModal
          isOpen={showBankruptcyModal}
          playerName={bankruptPlayer?.name || ""}
          onClose={() => {
            setShowBankruptcyModal(false);
            setBankruptPlayer(null);
          }}
        />

        {/* Winner Modal */}
        <WinnerModal
          isOpen={showWinnerModal}
          winnerName={winner?.name || ""}
          winnerPieceIcon={
            GAME_PIECES.find((p) => p.id === winner?.pieceId)?.icon || ""
          }
          onClose={() => {
            setShowWinnerModal(false);
            setWinner(null);
          }}
          onReset={() => {
            setShowWinnerModal(false);
            setWinner(null);
            setShowResetModal(true);
          }}
        />

        {/* Reset Modal */}
        <ResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onNewGameSamePlayers={handleNewGameSamePlayers}
          onCompleteReset={handleCompleteReset}
        />

        {/* Auction Modal */}
        <AuctionModal
          isOpen={showAuctionModal}
          onClose={() => {
            setShowAuctionModal(false);
            setAuctionProperty(null);
          }}
          propertyName={auctionProperty?.name || ""}
          propertyPrice={auctionProperty?.price || 0}
          players={players.map((p) => ({
            id: p.id,
            name: p.name,
            balance: p.balance,
          }))}
          bids={auctionState?.bids || []}
          dropouts={auctionState?.dropouts || []}
          currentPlayerId={isMultiplayer ? firebasePlayerId : currentPlayerId}
          onPlaceBid={handlePlaceAuctionBid}
          onAuctionComplete={handleAuctionComplete}
          onDropOut={handleDropOutAuction}
        />

        {/* Toast Notification */}
        <ToastNotification
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />

        {/* Trade Offer Modal */}
        {tradeOffer && (
          <TradeOfferModal
            isOpen={true}
            tradeOffer={tradeOffer}
            fromPlayer={
              players.find((p) => p.id === tradeOffer.fromPlayerId) ||
              players[0]
            }
            toPlayer={
              players.find((p) => p.id === tradeOffer.toPlayerId) || players[0]
            }
            currentPlayerId={isMultiplayer ? firebasePlayerId : currentPlayerId}
            onAccept={handleAcceptTrade}
            onReject={handleRejectTrade}
            onCounterOffer={handleCounterOffer}
          />
        )}

        {/* History Modal */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={gameHistory}
        />
      </div>
    </div>
  );
}
