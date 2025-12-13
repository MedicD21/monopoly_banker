import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import NumberPadModal from "./src/components/NumberPadModal";
import PayPlayerModal from "./src/components/PayPlayerModal";
import RentSelector from "./src/components/RentSelector";
import TradeModal from "./src/components/TradeModal";
import TaxModal from "./src/components/TaxModal";
import BankruptcyModal from "./src/components/BankruptcyModal";
import WinnerModal from "./src/components/WinnerModal";
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
} from "./src/firebase/gameplayService";
import { updatePlayer } from "./src/firebase/gameService";

const STARTING_MONEY = 1500;
const PASS_GO_AMOUNT = 200;
const HOUSE_COST = 50;
const HOTEL_COST = 200;
const TOTAL_HOUSES = 32; // Classic Monopoly house limit
const TOTAL_HOTELS = 12; // Classic Monopoly hotel limit

const GAME_PIECES = [
  { id: "car", name: "Racecar", icon: "/images/Racecar.svg" },
  { id: "ship", name: "Battleship", icon: "/images/Battleship.svg" },
  { id: "cat", name: "Cat", icon: "/images/cat.svg" },
  { id: "dog", name: "Dog", icon: "/images/Scottie.svg" },
  { id: "wheelbarrow", name: "Wheelbarrow", icon: "/images/Wheelbarrow.svg" },
  { id: "hat", name: "Top Hat", icon: "/images/Top_Hat.svg" },
  { id: "thimble", name: "Thimble", icon: "/images/Thimble.svg" },
  { id: "iron", name: "Iron", icon: "/images/Iron.svg" },
];

const PROPERTIES = [
  {
    name: "Mediterranean Ave",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    color: "bg-purple-700",
    group: "purple",
  },
  {
    name: "Baltic Ave",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    color: "bg-purple-700",
    group: "purple",
  },
  {
    name: "Oriental Ave",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Vermont Ave",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Connecticut Ave",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "St. Charles Place",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "States Ave",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "Virginia Ave",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "St. James Place",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Tennessee Ave",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "New York Ave",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Kentucky Ave",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Indiana Ave",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Illinois Ave",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Atlantic Ave",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Ventnor Ave",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Marvin Gardens",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Pacific Ave",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "North Carolina Ave",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Pennsylvania Ave",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Park Place",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    color: "bg-blue-800",
    group: "darkblue",
  },
  {
    name: "Boardwalk",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    color: "bg-blue-800",
    group: "darkblue",
  },
  {
    name: "Reading Railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "Pennsylvania Railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "B&O Railroad",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "Short Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "Electric Company",
    price: 150,
    rent: [],
    color: "bg-yellow-500",
    group: "utility",
  },
  {
    name: "Water Works",
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

interface MonopolyBankerProps {
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

export default function MonopolyBanker({
  gameId,
  gameCode,
  initialPlayers,
  currentPlayerId: firebasePlayerId,
  gameConfig,
}: MonopolyBankerProps = {}) {
  const isMultiplayer = !!gameId;

  const [screen, setScreen] = useState(isMultiplayer ? "play" : "setup");
  const [players, setPlayers] = useState(
    isMultiplayer ? initialPlayers || [] : []
  );
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
  const [lastRoll, setLastRoll] = useState(null);
  const [transactionMode, setTransactionMode] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [rentMode, setRentMode] = useState(null);
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
  const [numberPadCallback, setNumberPadCallback] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [freeParkingBalance, setFreeParkingBalance] = useState(0);
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [bankruptPlayer, setBankruptPlayer] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);

  // Firebase sync for multiplayer
  useEffect(() => {
    if (!isMultiplayer || !gameId) return;

    // Subscribe to player updates
    const unsubscribe = subscribeToPlayers(gameId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setNumPlayers(updatedPlayers.length);
    });

    return () => unsubscribe();
  }, [isMultiplayer, gameId]);

  // Subscribe to game updates (for Free Parking balance)
  useEffect(() => {
    if (!isMultiplayer || !gameId) return;

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      if (gameData.freeParkingBalance !== undefined) {
        setFreeParkingBalance(gameData.freeParkingBalance);
      }
    });

    return () => unsubscribe();
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

  const rollDice = async () => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    const rollingPlayer = players.find((p) => p.id === playerIdToUse);

    if (!rollingPlayer) return;

    setDiceRolling(true);
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempD1 = Math.floor(Math.random() * 6) + 1;
      const tempD2 = Math.floor(Math.random() * 6) + 1;
      setLastRoll({
        d1: tempD1,
        d2: tempD2,
        total: tempD1 + tempD2,
        isDoubles: tempD1 === tempD2,
      });
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        const finalRoll = {
          d1: finalD1,
          d2: finalD2,
          total: finalD1 + finalD2,
          isDoubles: finalD1 === finalD2,
        };
        setLastRoll(finalRoll);
        setDiceRolling(false);
        setShowDice(true);
        setTimeout(() => setShowDice(false), 3000);

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
      }
    }, 100);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const startGame = () => {
    // Validate player setup
    if (numPlayers < 2 || numPlayers > 8) {
      showError("Please select 2-8 players");
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
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayer(0);
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
      p.properties.some((pr) => pr.name === property.name)
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

    setTransactionMode(null);
  };

  const sellProperty = async (playerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find((pr) => pr.name === propertyName);
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
              properties: p.properties.filter((pr) => pr.name !== propertyName),
            }
          : p
      )
    );

    // Sync to Firebase in multiplayer mode
    if (isMultiplayer && gameId) {
      await updatePlayerBalance(gameId, playerId, newBalance);
      await removePropertyFromPlayer(gameId, playerId, propertyName);
    }
  };

  const mortgageProperty = async (playerId, propertyName) => {
    const property = PROPERTIES.find((p) => p.name === propertyName);
    const player = players.find((p) => p.id === playerId);
    if (!player || !property) return;

    const playerProp = player.properties.find((pr) => pr.name === propertyName);
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
              properties: p.properties.map((pr) =>
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
              properties: p.properties.map((pr) =>
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
      player.properties.forEach((prop) => {
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
      player.properties.forEach((prop) => {
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
    const ownedInGroup = player.properties.filter((pr) => {
      const prop = PROPERTIES.find((p) => p.name === pr.name);
      return prop && prop.group === property.group;
    });

    return ownedInGroup.length === groupProperties.length;
  };

  const addHouse = async (playerId, propertyName) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find((pr) => pr.name === propertyName);
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
              properties: p.properties.map((pr) =>
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
            properties: p.properties.map((pr) =>
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
              properties: p.properties.map((pr) =>
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
    updateBalance(playerId, PASS_GO_AMOUNT);
  };

  // Enhanced pay system handlers
  const handleBankerPays = () => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (playerIdToUse === null) {
      showError("Please select which player you are first");
      return;
    }
    setNumberPadTitle("Banker Pays");
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

  const handleProposeTrade = async (
    toPlayerId,
    offerMoney,
    offerProperties,
    requestMoney,
    requestProperties
  ) => {
    const playerIdToUse = isMultiplayer ? firebasePlayerId : currentPlayerId;
    if (!playerIdToUse) return;

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

    // Create trade summary
    let tradeSummary = `Trade with ${toPlayer.name}:\n\n`;
    tradeSummary += `You give:\n`;
    if (offerMoney > 0) tradeSummary += `- $${offerMoney.toLocaleString()}\n`;
    offerProperties.forEach((p) => (tradeSummary += `- ${p}\n`));
    tradeSummary += `\nYou receive:\n`;
    if (requestMoney > 0)
      tradeSummary += `- $${requestMoney.toLocaleString()}\n`;
    requestProperties.forEach((p) => (tradeSummary += `- ${p}\n`));
    tradeSummary += `\nAccept this trade?`;

    if (!window.confirm(tradeSummary)) {
      return;
    }

    // Execute trade
    // Transfer money
    if (offerMoney > 0 || requestMoney > 0) {
      const netTransfer = requestMoney - offerMoney;
      if (netTransfer > 0) {
        await transferMoney(
          toPlayerId,
          playerIdToUse,
          Math.abs(netTransfer).toString()
        );
      } else if (netTransfer < 0) {
        await transferMoney(
          playerIdToUse,
          toPlayerId,
          Math.abs(netTransfer).toString()
        );
      }
    }

    // Transfer properties from current player to other player
    for (const propName of offerProperties) {
      const prop = fromPlayer.properties.find((p) => p.name === propName);
      if (!prop) continue;

      // Remove from current player
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerIdToUse
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
        await removePropertyFromPlayer(gameId, playerIdToUse, propName);
        await addPropertyToPlayer(gameId, toPlayerId, prop);
      }
    }

    // Transfer properties from other player to current player
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
            : p.id === playerIdToUse
            ? { ...p, properties: [...p.properties, prop] }
            : p
        )
      );

      if (isMultiplayer && gameId) {
        await removePropertyFromPlayer(gameId, toPlayerId, propName);
        await addPropertyToPlayer(gameId, playerIdToUse, prop);
      }
    }

    alert("Trade completed successfully!");
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

    alert(
      `${player.name} collected $${amount.toLocaleString()} from Free Parking!`
    );
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
      <div className="min-h-screen bg-black text-amber-50 p-8">
        {/* Error Toast */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            {errorMessage}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img
                src="/images/Monopoly_Logo.svg"
                alt="Monopoly"
                className="w-64 h-auto"
              />
            </div>
            <h1 className="text-5xl font-bold mb-2 text-amber-400">
              MONOPOLY BANKER
            </h1>
            <p className="text-amber-600">Digital Banking System</p>
          </div>

          {numPlayers === 0 ? (
            <div className="bg-zinc-900 rounded-lg p-8 border border-amber-900/30">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">
                Select Number of Players
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
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
    <div className="min-h-screen bg-black text-amber-50 p-2 sm:p-4 relative overflow-hidden">
      {/* Global Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating money symbols */}
        <div className="absolute top-[10%] left-[15%] text-6xl opacity-5 text-green-400 animate-float-slow">
          $
        </div>
        <div className="absolute top-[25%] right-[20%] text-5xl opacity-5 text-amber-400 animate-float-medium">
          $
        </div>
        <div className="absolute top-[60%] left-[25%] text-7xl opacity-5 text-green-300 animate-float-fast">
          $
        </div>
        <div className="absolute bottom-[20%] right-[15%] text-6xl opacity-5 text-amber-500 animate-float-slow">
          $
        </div>

        {/* Floating dice */}
        <div className="absolute top-[40%] right-[30%] text-5xl opacity-5 animate-float-medium">
          🎲
        </div>
        <div className="absolute bottom-[35%] left-[10%] text-4xl opacity-5 animate-float-fast">
          🎲
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-[15%] right-[10%] w-64 h-64 bg-gradient-to-br from-amber-600/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-[20%] left-[5%] w-80 h-80 bg-gradient-to-tr from-green-600/10 to-transparent rounded-full blur-3xl animate-float-medium"></div>
        <div className="absolute top-[50%] left-[40%] w-72 h-72 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl animate-float-fast"></div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {errorMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* BANKER CARD - Reorganized with all main actions */}
        <div className="relative bg-zinc-900 rounded-lg p-4 mb-4 border border-amber-900/30 overflow-hidden">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {/* Floating coins animation */}
            <div className="absolute top-0 left-1/4 w-8 h-8 bg-amber-400 rounded-full animate-float-slow"></div>
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-amber-500 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-amber-300 rounded-full animate-float-fast"></div>

            {/* Diagonal stripes */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent animate-shimmer"></div>
          </div>

          {/* Header */}
          <div className="relative flex flex-col items-center mb-4">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl font-bold text-amber-400 drop-shadow-lg text-center">
                MONOPOLY BANKER
              </h1>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Reset game?")) {
                  setScreen("setup");
                  setPlayers([]);
                  setNumPlayers(0);
                  setPlayerNames(["", "", "", "", "", "", "", ""]);
                  setPlayerPieces(["", "", "", "", "", "", "", ""]);
                  setPlayerColors(["", "", "", "", "", "", "", ""]);
                  setCurrentPlayerId(0);
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/30 text-amber-400"
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

          {/* Free Parking Display */}
          {(gameConfig?.freeParkingJackpot ||
            (isMultiplayer && freeParkingBalance > 0)) && (
            <div className="flex justify-center mb-3">
              <div className="bg-green-900/30 border-2 border-green-600 rounded-lg px-4 py-2">
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
            </div>
          )}

          {/* Building Counter Display */}
          {(() => {
            const available = getAvailableBuildings();
            return (
              <div className="flex justify-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded border border-amber-900/30">
                  <img
                    src="/images/House.svg"
                    alt="Houses"
                    className="w-4 h-4"
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
                    className="w-4 h-4"
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

          {/* Banker Action Buttons */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {/* First Row: Pass GO and Buy Property */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  const playerIdToUse = isMultiplayer
                    ? firebasePlayerId
                    : currentPlayerId;
                  if (playerIdToUse === null) {
                    showError("Please select which player you are first");
                    return;
                  }
                  passGo(playerIdToUse);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <img src="/images/Go.svg" alt="GO" className="w-auto h-10" />
                Pass GO
              </button>

              <button
                onClick={() => {
                  const playerIdToUse = isMultiplayer
                    ? firebasePlayerId
                    : currentPlayerId;
                  if (playerIdToUse === null) {
                    showError("Please select which player you are first");
                    return;
                  }
                  setShowBuyProperty(true);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <img
                  src="/images/property.svg"
                  alt="property"
                  className="w-auto h-10"
                />
                Buy Property
              </button>
            </div>

            {/* Second Row: Banker Pays centered */}
            <button
              onClick={handleBankerPays}
              className="bg-green-300 hover:bg-green-200 text-black px-4 py-2 rounded font-bold transition-colors flex items-center gap-2"
            >
              <img
                src="/images/Banker.svg"
                alt="Banker"
                className="w-auto h-20"
              />
              Banker Pays
            </button>
          </div>

          {/* Roll Dice Section */}
          <div className="border-t border-amber-900/30 pt-4">
            <button
              onClick={rollDice}
              disabled={diceRolling}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Dice1 className="w-6 h-6" />
              {diceRolling ? "Rolling..." : "Roll Dice"}
            </button>

            {lastRoll && (
              <div className="mt-3 bg-zinc-800 p-3 rounded-lg border border-amber-900/30 text-center">
                <div className="flex justify-center gap-3 mb-2">
                  {[lastRoll.d1, lastRoll.d2].map((die, idx) => {
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
                        className="w-10 h-10 text-amber-400"
                      />
                    );
                  })}
                </div>
                <p className="text-xl font-bold text-amber-400">
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
            <div
              className={`bg-zinc-900 border-2 border-amber-600 rounded-lg p-4 sm:p-8 ${
                diceRolling ? "animate-pulse" : ""
              }`}
            >
              <div className="flex gap-3 sm:gap-6 items-center justify-center text-amber-400">
                <DiceIcon value={lastRoll.d1} />
                <div className="text-2xl sm:text-4xl font-bold">+</div>
                <DiceIcon value={lastRoll.d2} />
                <div className="text-2xl sm:text-4xl font-bold">=</div>
                <div className="text-3xl sm:text-5xl font-bold text-amber-400">
                  {lastRoll.total}
                </div>
              </div>
              {lastRoll.isDoubles && !diceRolling && (
                <div className="text-lg sm:text-2xl font-bold text-center mt-2 sm:mt-4 text-amber-400">
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
                      <h3 className="text-xl font-bold text-amber-50">
                        {player.name}
                      </h3>
                      <div className="text-2xl font-bold text-amber-400">
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
                          className="bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                        >
                          <img
                            src="/images/Payment.svg"
                            alt="Pay Rent"
                            className="w-4 h-4"
                          />
                          Pay Rent
                        </button>
                        <button
                          onClick={() => handleCustomAmountClick(player.id)}
                          className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                        >
                          <img
                            src="/images/Bank.svg"
                            alt="Pay"
                            className="w-4 h-4"
                          />
                          Pay
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player-specific action buttons - ONLY SHOW IF THIS IS THE CURRENT USER */}
                {isCurrentUser && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => setShowPayPlayerModal(true)}
                      className="bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <img
                        src="/images/Payment.svg"
                        alt="Pay"
                        className="w-4 h-4"
                      />
                      Pay
                    </button>

                    <button
                      onClick={() => {
                        setNumberPadTitle("Receive Money");
                        setNumberPadCallback(() => (amount) => {
                          updateBalance(player.id, amount);
                        });
                        setShowNumberPad(true);
                      }}
                      className="bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <img
                        src="/images/Bank.svg"
                        alt="Bank"
                        className="w-4 h-4"
                      />
                      Receive
                    </button>

                    <button
                      onClick={() => setShowTradeModal(true)}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                      disabled={players.length < 2}
                    >
                      <img
                        src="/images/Trade.svg"
                        alt="Trade"
                        className="w-4 h-4"
                      />
                      Trade
                    </button>

                    <button
                      onClick={() => setShowTaxModal(true)}
                      className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <DollarSign className="w-4 h-4" />
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
        />
      </div>
    </div>
  );
}
