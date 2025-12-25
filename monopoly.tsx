import { useState, useEffect, useRef } from "react";
import { X, Clock } from "lucide-react";
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
import ToastNotification from "./src/components/ToastNotification";
import HistoryModal from "./src/components/HistoryModal";
import PlayerCard from "./src/components/PlayerCard";
import ProFeaturesRow from "./src/components/ProFeaturesRow";
import BankerHeader from "./src/components/BankerHeader";
import BankerPrimaryActions from "./src/components/BankerPrimaryActions";
import BuildingCounter from "./src/components/BuildingCounter";
import AuctionSelectorModal from "./src/components/AuctionSelectorModal";
import BuyPropertyModal from "./src/components/BuyPropertyModal";
import ChatbotModal from "./src/components/ChatbotModal";
import { HistoryEntry, TradeOffer } from "./src/types/game";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "./src/firebase/config";
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
import {
  BOARD_SPACES,
  PROPERTIES,
  GAME_PIECES,
  CHANCE_CARDS,
  COMMUNITY_CARDS,
  PASS_GO_AMOUNT,
  STARTING_MONEY,
  HOUSE_COST,
  HOTEL_COST,
  TOTAL_HOUSES,
  TOTAL_HOTELS,
  JAIL_INDEX,
  PLAYER_COLORS,
  Card,
  CardType,
  CardEffect,
} from "./src/constants/monopolyData";
const idsMatch = (a: string | number, b: string | number) =>
  String(a) === String(b);

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
    onRandomizeOrder?: boolean;
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

  // Turn advancement handled by host actions; no explicit End Turn button

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

  //AI intergrating

  const functions = getFunctions(firebaseApp, "us-central1");
  const analyzeGame = httpsCallable(functions, "analyzeMonopolyGame");

  async function handleChatMessage(message: string): Promise<string> {
    try {
      // If there's no gameId or userId, provide general Monopoly rules assistance
      if (!gameId || !firebasePlayerId) {
        return `I can help answer Monopoly questions! However, for the best experience with game-specific analysis (like "Who is winning?"), please start or join a multiplayer game.

For general rules questions, I can still help! Try asking:
• "How do I get out of jail?"
• "What happens when I land on Free Parking?"
• "How do mortgages work?"
• "When can I buy houses?"

What would you like to know?`;
      }

      // Get current player's pro status
      // Note: isPro is set by RevenueCat and includes BOTH:
      // - Subscription status (via "pro" entitlement)
      // - One-time purchase (digital_banker_pro, digital_banker_pro_v2)
      const currentPlayer = players.find((p) => p.id === firebasePlayerId);
      const isPremium = currentPlayer?.isPro || false;

      // Call the cloud function with gameId, message, userId, and premium status
      // The cloud function will verify premium status server-side
      const res = await analyzeGame({
        gameId: gameId,
        message: message,
        userId: firebasePlayerId,
        isPremium: isPremium,
      });
      const data = res.data as any;

      // Handle the response format from your cloud function (uses 'reply' not 'response')
      if (data && data.reply) {
        // Optionally show usage info to user
        if (data.usage) {
          console.log(`AI Usage: ${data.usage.remaining}/${data.usage.limit} remaining this month`);
        }
        return data.reply;
      } else if (data && typeof data === 'string') {
        return data;
      } else {
        return "I received your question but couldn't generate a proper response. Please try rephrasing your question.";
      }
    } catch (err: any) {
      console.error("AI error:", err);

      // Handle usage limit errors specifically
      if (err?.code === 'functions/resource-exhausted') {
        return err.message || "You've reached your AI usage limit for this month. Upgrade to Premium for more messages!";
      }

      const errorMsg = err?.message || err?.code || "Failed to get a response. Make sure the Gemini API is configured in Firebase Functions.";
      throw new Error(errorMsg);
    }
  }

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
    const nearestIndexForGroup = (
      group: "railroad" | "utility",
      currentPos: number
    ) => {
      const targetNames = PROPERTIES.filter((p) => p.group === group).map(
        (p) => p.name
      );
      const indices = BOARD_SPACES.map((name, idx) =>
        targetNames.includes(name) ? idx : -1
      ).filter((idx) => idx >= 0);
      if (!indices.length) return currentPos;
      const ahead = indices
        .filter((idx) => idx > currentPos)
        .sort((a, b) => a - b);
      if (ahead.length) return ahead[0];
      return indices.sort((a, b) => a - b)[0];
    };

    if (effect.kind === "bank") {
      await updateBalance(playerId, effect.amount);
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
    } else if (effect.kind === "move") {
      const currentPos = player.position ?? 0;
      const wrapped = effect.position < currentPos && effect.passGo;
      if (wrapped) {
        await updateBalance(playerId, PASS_GO_AMOUNT);
      }
      await updatePlayerPosition(playerId, effect.position);
    } else if (effect.kind === "moveNearest") {
      const currentPos = player.position ?? 0;
      const targetIndex = nearestIndexForGroup(effect.group, currentPos);
      const wrapped = targetIndex < currentPos && effect.passGo;
      if (wrapped) {
        await updateBalance(playerId, PASS_GO_AMOUNT);
      }
      await updatePlayerPosition(playerId, targetIndex);
      const landedName = BOARD_SPACES[targetIndex];
      const owner = getOwnerOfProperty(landedName);
      if (!owner) {
        showToastMessage(
          `${landedName} is unowned. You may buy it from the bank.`
        );
      } else if (!idsMatch(owner.id, playerId)) {
        if (effect.group === "railroad") {
          const ownedRails = owner.properties.filter((pr: any) => {
            const def = getPropertyDef(pr.name);
            return def?.group === "railroad";
          }).length;
          const baseRent =
            [25, 50, 100, 200][Math.min(ownedRails, 4) - 1] || 25;
          const rentDue = baseRent * 2; // twice the rental
          await transferMoney(playerId, owner.id, rentDue.toString());
          showToastMessage(
            `${player.name} paid $${rentDue} (double rent) to ${owner.name} for ${landedName}`
          );
        } else if (effect.group === "utility") {
          // Roll dice for utility payment (10x roll)
          const die1 = Math.floor(Math.random() * 6) + 1;
          const die2 = Math.floor(Math.random() * 6) + 1;
          const total = die1 + die2;
          const rentDue = total * 10;
          await transferMoney(playerId, owner.id, rentDue.toString());
          showToastMessage(
            `${player.name} rolled ${total} for utility and paid $${rentDue} to ${owner.name}`
          );
        }
      }
    } else if (effect.kind === "back") {
      const boardSize = BOARD_SPACES.length;
      const currentPos = player.position ?? 0;
      const target = (currentPos - effect.spaces + boardSize) % boardSize;
      await updatePlayerPosition(playerId, target);
    } else if (effect.kind === "gotoJail") {
      await updateJailStatus(playerId, true, 0, JAIL_INDEX);
    } else if (effect.kind === "getOutOfJailFree") {
      const currentCards = player.getOutOfJailFree || 0;
      const updated = currentCards + 1;
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, getOutOfJailFree: updated } : p
        )
      );
      if (isMultiplayer && gameId) {
        await updatePlayer(gameId, playerId as string, {
          getOutOfJailFree: updated,
        });
      }
    } else if (effect.kind === "repairs") {
      const houses =
        player.properties?.reduce(
          (sum, prop: any) => sum + (prop.hotel ? 0 : prop.houses || 0),
          0
        ) || 0;
      const hotels =
        player.properties?.reduce(
          (sum, prop: any) => sum + (prop.hotel ? 1 : 0),
          0
        ) || 0;
      const totalCost = houses * effect.perHouse + hotels * effect.perHotel;
      if (totalCost !== 0) {
        await updateBalance(playerId, -totalCost);
      }
    }

    setCardModal({ open: false });
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
  const [sellingProperty, setSellingProperty] = useState(false);
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
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [tradeOffer, setTradeOffer] = useState<TradeOffer | null>(null);
  const [ignoredTradeId, setIgnoredTradeId] = useState<string | null>(null);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [goToJailModal, setGoToJailModal] = useState<{
    open: boolean;
    playerName?: string;
  }>({ open: false });
  const activePlayer = players[activeTurnIndex] || null;
  const [cardModal, setCardModal] = useState<{
    open: boolean;
    card?: Card;
    playerId?: string | number;
  }>({ open: false });
  const ignoredTradeIdRef = useRef<string | null>(null);

  useEffect(() => {
    ignoredTradeIdRef.current = ignoredTradeId;
  }, [ignoredTradeId]);
  const getSpaceName = (index: number) =>
    BOARD_SPACES[index] || `Space ${index}`;
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
      // Sync trade offers across all players (only show pending, suppress ignored/accepted)
      const incomingOffer = gameData.tradeOffer;
      if (incomingOffer) {
        if (incomingOffer.status && incomingOffer.status !== "pending") {
          setTradeOffer(null);
          setIgnoredTradeId(incomingOffer.id);
        } else if (
          ignoredTradeIdRef.current &&
          incomingOffer.id === ignoredTradeIdRef.current
        ) {
          setTradeOffer(null);
        } else {
          setTradeOffer(incomingOffer);
        }
      } else {
        setTradeOffer(null);
        setIgnoredTradeId(null);
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
    if (playerIdToUse === null || playerIdToUse === undefined) {
      showError("Please select which player you are first");
      return null;
    }
    const rollingPlayer = players.find((p) => p.id === playerIdToUse);

    if (!rollingPlayer) {
      showError("Player not found for this roll");
      return null;
    }

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
              updateJailStatus(playerIdToUse, true, 0, JAIL_INDEX);
              setGoToJailModal({
                open: true,
                playerName: rollingPlayer.name,
              });

              // Reset this player's doubles count
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === playerIdToUse ? { ...p, doublesCount: 0 } : p
                )
              );

              if (isMultiplayer && gameId) {
                updatePlayer(gameId, playerIdToUse, { doublesCount: 0 });
              }
              resolve(finalRoll);
              return;
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

  const movePlayerSlot = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= numPlayers) return;
    const swap = <T,>(arr: T[]) => {
      const copy = [...arr];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    };
    setPlayerNames((prev) => swap(prev));
    setPlayerPieces((prev) => swap(prev));
    setPlayerColors((prev) => swap(prev));
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
        getOutOfJailFree: 0,
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

  const transferMoney = async (
    fromId,
    toId,
    amount,
    options?: { suppressHistory?: boolean }
  ) => {
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

    if (!options?.suppressHistory) {
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
    }
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
    if (sellingProperty) return;
    setSellingProperty(true);
    try {
      const property = PROPERTIES.find((p) => p.name === propertyName);
      const player = players.find((p) => p.id === playerId);
      if (!player || !property) {
        return;
      }
      const playerProp = player.properties.find(
        (pr: any) => pr.name === propertyName
      );
      if (!playerProp) {
        return;
      }
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
      setSelectedProperty(null);
    } finally {
      setSellingProperty(false);
    }
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
        mortgageValue,
        newBalance
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
        unmortgageCost,
        newBalance
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
    const passGoAmountToUse = gameConfig?.passGoAmount || PASS_GO_AMOUNT;
    updateBalance(playerId, passGoAmountToUse);

    const player = players.find((p) => p.id === playerId);
    if (player) {
      const message = `${
        player.name
      } passed GO and collected $${passGoAmountToUse.toLocaleString()}`;
      showToastMessage(message);
      addHistoryEntry("passGo", message, player.name);
    }
  };

  const handleLandOnGoBonus = () => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (playerIdToUse === null) {
      showError("Please select which player you are first");
      return;
    }
    landOnGoDouble(playerIdToUse);
  };

  const landOnGoDouble = (playerId) => {
    const passGoAmountToUse = gameConfig?.passGoAmount || PASS_GO_AMOUNT;
    const amount = passGoAmountToUse * 2;
    updateBalance(playerId, amount);

    const player = players.find((p) => p.id === playerId);
    if (player) {
      const message = `🎉 ${
        player.name
      } landed on GO! Double bonus: $${amount.toLocaleString()}`;
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
    requestProperties,
    offerJailCards = 0,
    requestJailCards = 0
  ) => {
    const fromPlayer = players.find((p) => idsMatch(p.id, fromPlayerId));
    const toPlayer = players.find((p) => idsMatch(p.id, toPlayerId));

    if (!fromPlayer || !toPlayer) return;

    // Transfer money
    if (offerMoney > 0 || requestMoney > 0) {
      const netTransfer = requestMoney - offerMoney;
      if (netTransfer > 0) {
        await transferMoney(
          toPlayerId,
          fromPlayerId,
          Math.abs(netTransfer).toString(),
          { suppressHistory: true }
        );
      } else if (netTransfer < 0) {
        await transferMoney(
          fromPlayerId,
          toPlayerId,
          Math.abs(netTransfer).toString(),
          { suppressHistory: true }
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

    // Transfer Get Out of Jail Free cards
    if (offerJailCards || requestJailCards) {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === fromPlayerId) {
            return {
              ...p,
              getOutOfJailFree: Math.max(
                0,
                (p.getOutOfJailFree || 0) - offerJailCards + requestJailCards
              ),
            };
          }
          if (p.id === toPlayerId) {
            return {
              ...p,
              getOutOfJailFree: Math.max(
                0,
                (p.getOutOfJailFree || 0) + offerJailCards - requestJailCards
              ),
            };
          }
          return p;
        })
      );

      if (isMultiplayer && gameId) {
        const fromUpdated = Math.max(
          0,
          (fromPlayer.getOutOfJailFree || 0) - offerJailCards + requestJailCards
        );
        const toUpdated = Math.max(
          0,
          (toPlayer.getOutOfJailFree || 0) + offerJailCards - requestJailCards
        );
        await updatePlayer(gameId, fromPlayerId as string, {
          getOutOfJailFree: fromUpdated,
        });
        await updatePlayer(gameId, toPlayerId as string, {
          getOutOfJailFree: toUpdated,
        });
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
    requestProperties,
    offerJailCards,
    requestJailCards
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
        offerJailCards,
        requestJailCards,
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
      }${offerProperties.join("\n- ")}${
        offerJailCards > 0 ? `\n- ${offerJailCards} Get Out of Jail Free` : ""
      }\n\nYou receive:\n${
        requestMoney > 0 ? `- $${requestMoney.toLocaleString()}\n` : ""
      }${requestProperties.join("\n- ")}${
        requestJailCards > 0
          ? `\n- ${requestJailCards} Get Out of Jail Free`
          : ""
      }\n\nAccept this trade?`;

      if (!window.confirm(tradeSummary)) {
        return;
      }

      await executeTrade(
        playerIdToUse,
        toPlayerId,
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties,
        offerJailCards,
        requestJailCards
      );
    }
  };

  const handleAcceptTrade = async () => {
    if (executingTrade) return;
    if (!tradeOffer || !gameId) return;
    setExecutingTrade(true);
    try {
      const offer = tradeOffer;
      setIgnoredTradeId(offer.id);
      // Close the modal immediately
      setTradeOffer(null);

      // Execute the trade
      const {
        fromPlayerId,
        toPlayerId,
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties,
        offerJailCards = 0,
        requestJailCards = 0,
      } = offer;
      await executeTrade(
        fromPlayerId,
        toPlayerId,
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties,
        offerJailCards,
        requestJailCards
      );

      // Clear the trade offer locally and remotely
      await acceptTrade(gameId);
      await clearTrade(gameId);
    } finally {
      setExecutingTrade(false);
    }
  };

  const handleRejectTrade = async () => {
    if (!tradeOffer) return;

    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    const fromPlayer = players.find((p) => p.id === tradeOffer.fromPlayerId);
    const toPlayer = players.find((p) => p.id === tradeOffer.toPlayerId);

    // Clear the trade offer
    setIgnoredTradeId(tradeOffer.id);
    setTradeOffer(null);
    if (gameId) {
      await rejectTrade(gameId);
      await clearTrade(gameId);
    }

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
    requestProperties: string[],
    offerJailCards = 0,
    requestJailCards = 0
  ) => {
    if (executingTrade) return;
    if (!tradeOffer) return;

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
    if (gameId) {
      await proposeTrade(gameId, {
        fromPlayerId: String(playerIdToUse),
        toPlayerId: String(tradeOffer.fromPlayerId),
        offerMoney,
        offerProperties,
        requestMoney,
        requestProperties,
        offerJailCards,
        requestJailCards,
        isCounterOffer: true,
      });
    }

    // Clear local view until the new offer arrives via sync
    setIgnoredTradeId(tradeOffer.id);
    setTradeOffer(null);

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
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-amber-400">
                          Player {i + 1}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => movePlayerSlot(i, -1)}
                          disabled={i === 0}
                          className="px-3 py-1 rounded bg-zinc-900 text-amber-300 text-xs font-semibold border border-amber-900/40 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 transition-colors"
                        >
                          Move Up
                        </button>
                        <button
                          onClick={() => movePlayerSlot(i, 1)}
                          disabled={i === numPlayers - 1}
                          className="px-3 py-1 rounded bg-zinc-900 text-amber-300 text-xs font-semibold border border-amber-900/40 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 transition-colors"
                        >
                          Move Down
                        </button>
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
      {/* Go To Jail Modal */}
      {goToJailModal.open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-amber-500 rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <img
              src="/images/Go-To_Jail.svg"
              alt="Go To Jail"
              className="w-32 h-32 mx-auto mb-4"
            />
            <p className="text-lg font-bold text-amber-50 mb-2">
              {goToJailModal.playerName || "Player"} rolled doubles 3 times!
            </p>
            <p className="text-sm text-amber-200 mb-4">
              Sent directly to Jail.
            </p>
            <button
              onClick={() => setGoToJailModal({ open: false, playerName: "" })}
              className="px-4 py-2 rounded bg-amber-600 text-black font-bold hover:bg-amber-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* BANKER CARD - Reorganized with all main actions */}
        <div className="relative bg-zinc-900 rounded-lg pb-0 mb-2 border border-amber-500 overflow-shown shadow-lg drop-shadow-[0_0_10px_white] ">
          <BankerHeader
            onResetClick={() => setShowResetModal(true)}
            onHistoryClick={() => setShowHistoryModal(true)}
            isMultiplayer={isMultiplayer}
            roomCode={gameCode}
            activePlayerName={activePlayer?.name}
            onChatbotClick={() => setShowChatbotModal(true)}
          />

          <ProFeaturesRow
            freeParkingEnabled={
              !!(
                gameConfig?.freeParkingJackpot ||
                (isMultiplayer && freeParkingBalance > 0)
              )
            }
            freeParkingBalance={freeParkingBalance}
            onClaimFreeParking={handleClaimFreeParking}
            showAuction={
              gameConfig?.auctionProperties !== false || !isMultiplayer
            }
            onOpenAuctionSelector={() => setShowAuctionSelector(true)}
            doubleGoOnLanding={!!gameConfig?.doubleGoOnLanding}
            passGoAmount={gameConfig?.passGoAmount || PASS_GO_AMOUNT}
            onLandOnGoBonus={handleLandOnGoBonus}
          />

          <BuildingCounter
            housesAvailable={getAvailableBuildings().houses}
            hotelsAvailable={getAvailableBuildings().hotels}
          />

          <BankerPrimaryActions
            onTellerPays={handleBankerPays}
            onPassGo={(e) => {
              const playerIdToUse = isMultiplayer
                ? firebasePlayerId
                : currentPlayerId;
              if (playerIdToUse === null) {
                showError("Please select which player you are first");
                return;
              }
              passGo(playerIdToUse);
            }}
            onBuyProperty={(e) => {
              const playerIdToUse = isMultiplayer
                ? firebasePlayerId
                : currentPlayerId;
              if (playerIdToUse === null) {
                showError("Please select which player you are first");
                return;
              }
              setShowBuyProperty(true);
            }}
            onRoll={() => rollDice()}
            diceRolling={diceRolling}
            lastRoll={lastRoll}
            showOverlay={(showDice || diceRolling) && !!lastRoll}
            players={players}
          />
        </div>

        {/* PLAYERS LIST */}
        <div className="space-y-3">
          {players.map((player) => {
            const playerIdToCompare = isMultiplayer
              ? firebasePlayerId
              : currentPlayerId;
            const isCurrentUser = player.id === playerIdToCompare;

            return (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentUser={isCurrentUser}
                onPayRent={handlePayRentClick}
                onPayCustom={handleCustomAmountClick}
                onOpenPayModal={() => setShowPayPlayerModal(true)}
                onReceive={(id) => {
                  setNumberPadTitle("Receive Money");
                  setNumberPadCallback(() => (amount: number) => {
                    updateBalance(id, amount);
                  });
                  setShowNumberPad(true);
                }}
                onOpenTrade={() => setShowTradeModal(true)}
                onOpenTax={() => setShowTaxModal(true)}
                onManageProperty={(name) => setSelectedProperty(name)}
              />
            );
          })}
        </div>

        {/* Buy Property Modal */}
        <BuyPropertyModal
          isOpen={
            showBuyProperty &&
            (isMultiplayer ? firebasePlayerId : currentPlayerId) !== null
          }
          properties={PROPERTIES.filter(
            (prop) =>
              !players.some((p) =>
                p.properties.some((owned) => owned.name === prop.name)
              )
          )}
          onBuy={(property) => {
            const playerIdToUse = isMultiplayer
              ? firebasePlayerId
              : currentPlayerId;
            buyProperty(playerIdToUse, property);
            setShowBuyProperty(false);
          }}
          onClose={() => setShowBuyProperty(false)}
        />

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
                              disabled={
                                sellingProperty ||
                                (player?.balance || 0) < unmortgageCost
                              }
                              onClick={() =>
                                unmortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Unmortgage (${unmortgageCost.toLocaleString()})
                            </button>
                          ) : (
                            <button
                              disabled={sellingProperty}
                              onClick={() =>
                                mortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Mortgage (+${mortgageValue.toLocaleString()})
                            </button>
                          )}

                          <button
                            disabled={sellingProperty}
                            onClick={() =>
                              sellProperty(playerIdToUse, selectedProperty)
                            }
                            className="w-full bg-red-700 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
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
                              disabled={
                                sellingProperty ||
                                (player?.balance || 0) < unmortgageCost
                              }
                              onClick={() =>
                                unmortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
                              }
                              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                            >
                              Unmortgage (${unmortgageCost.toLocaleString()})
                            </button>
                          ) : (
                            <button
                              disabled={
                                sellingProperty ||
                                playerProp?.houses > 0 ||
                                playerProp?.hotel
                              }
                              onClick={() =>
                                mortgageProperty(
                                  playerIdToUse,
                                  selectedProperty
                                )
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
                          disabled={sellingProperty}
                          className="w-full bg-red-700 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
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

        <AuctionSelectorModal
          isOpen={showAuctionSelector}
          properties={PROPERTIES.filter(
            (prop) =>
              !players.some((p) =>
                p.properties.some((owned) => owned.name === prop.name)
              )
          )}
          onSelect={(property) => {
            handleStartAuction(property);
            setShowAuctionSelector(false);
          }}
          onClose={() => setShowAuctionSelector(false)}
        />

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

        <AuctionModal
          isOpen={showAuctionModal && !!auctionProperty}
          onClose={() => {
            setShowAuctionModal(false);
            setAuctionState(null);
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

        {/* History Modal */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={gameHistory}
        />

        {/* Chatbot Modal */}
        <ChatbotModal
          isOpen={showChatbotModal}
          onClose={() => setShowChatbotModal(false)}
          onSendMessage={handleChatMessage}
          gameId={gameId}
        />
      </div>
    </div>
  );
}
