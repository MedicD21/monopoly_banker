import React, { useState } from 'react';
import { DollarSign, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, TrendingUp, RotateCcw, Building2, X, Car, Ship, Cat, Dog, Zap, Crown, Footprints, Gift } from 'lucide-react';

const STARTING_MONEY = 1500;
const PASS_GO_AMOUNT = 200;
const HOUSE_COST = 50;
const HOTEL_COST = 200;

const GAME_PIECES = [
  { id: 'car', name: 'Car', icon: Car },
  { id: 'ship', name: 'Ship', icon: Ship },
  { id: 'cat', name: 'Cat', icon: Cat },
  { id: 'dog', name: 'Dog', icon: Dog },
  { id: 'boot', name: 'Boot', icon: Footprints },
  { id: 'hat', name: 'Top Hat', icon: Crown },
  { id: 'thimble', name: 'Thimble', icon: Gift },
  { id: 'iron', name: 'Iron', icon: Zap }
];

const PROPERTIES = [
  { name: 'Mediterranean Ave', price: 60, rent: [2, 10, 30, 90, 160, 250], color: 'bg-amber-900', group: 'brown' },
  { name: 'Baltic Ave', price: 60, rent: [4, 20, 60, 180, 320, 450], color: 'bg-amber-900', group: 'brown' },
  { name: 'Oriental Ave', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'bg-cyan-600', group: 'lightblue' },
  { name: 'Vermont Ave', price: 100, rent: [6, 30, 90, 270, 400, 550], color: 'bg-cyan-600', group: 'lightblue' },
  { name: 'Connecticut Ave', price: 120, rent: [8, 40, 100, 300, 450, 600], color: 'bg-cyan-600', group: 'lightblue' },
  { name: 'St. Charles Place', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'bg-pink-600', group: 'pink' },
  { name: 'States Ave', price: 140, rent: [10, 50, 150, 450, 625, 750], color: 'bg-pink-600', group: 'pink' },
  { name: 'Virginia Ave', price: 160, rent: [12, 60, 180, 500, 700, 900], color: 'bg-pink-600', group: 'pink' },
  { name: 'St. James Place', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'bg-orange-600', group: 'orange' },
  { name: 'Tennessee Ave', price: 180, rent: [14, 70, 200, 550, 750, 950], color: 'bg-orange-600', group: 'orange' },
  { name: 'New York Ave', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: 'bg-orange-600', group: 'orange' },
  { name: 'Kentucky Ave', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'bg-red-700', group: 'red' },
  { name: 'Indiana Ave', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: 'bg-red-700', group: 'red' },
  { name: 'Illinois Ave', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: 'bg-red-700', group: 'red' },
  { name: 'Atlantic Ave', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'bg-yellow-600', group: 'yellow' },
  { name: 'Ventnor Ave', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: 'bg-yellow-600', group: 'yellow' },
  { name: 'Marvin Gardens', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: 'bg-yellow-600', group: 'yellow' },
  { name: 'Pacific Ave', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'bg-green-700', group: 'green' },
  { name: 'North Carolina Ave', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: 'bg-green-700', group: 'green' },
  { name: 'Pennsylvania Ave', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: 'bg-green-700', group: 'green' },
  { name: 'Park Place', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: 'bg-blue-800', group: 'darkblue' },
  { name: 'Boardwalk', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: 'bg-blue-800', group: 'darkblue' },
  { name: 'Reading Railroad', price: 200, rent: [25, 50, 100, 200], color: 'bg-gray-600', group: 'railroad' },
  { name: 'Pennsylvania Railroad', price: 200, rent: [25, 50, 100, 200], color: 'bg-gray-600', group: 'railroad' },
  { name: 'B&O Railroad', price: 200, rent: [25, 50, 100, 200], color: 'bg-gray-600', group: 'railroad' },
  { name: 'Short Line', price: 200, rent: [25, 50, 100, 200], color: 'bg-gray-600', group: 'railroad' },
  { name: 'Electric Company', price: 150, rent: [], color: 'bg-yellow-500', group: 'utility' },
  { name: 'Water Works', price: 150, rent: [], color: 'bg-blue-400', group: 'utility' }
];

const PLAYER_COLORS = [
  'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500',
  'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-teal-600'
];

export default function MonopolyBanker() {
  const [screen, setScreen] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(0);
  const [playerNames, setPlayerNames] = useState(['', '', '', '', '', '', '', '']);
  const [playerPieces, setPlayerPieces] = useState(['', '', '', '', '', '', '', '']);
  const [playerColors, setPlayerColors] = useState(['', '', '', '', '', '', '', '']);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [lastRoll, setLastRoll] = useState(null);
  const [transactionMode, setTransactionMode] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [rentMode, setRentMode] = useState(null);
  const [utilityDiceRoll, setUtilityDiceRoll] = useState('');
  const [diceRolling, setDiceRolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const rollDice = () => {
    setDiceRolling(true);
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempD1 = Math.floor(Math.random() * 6) + 1;
      const tempD2 = Math.floor(Math.random() * 6) + 1;
      setLastRoll({ d1: tempD1, d2: tempD2, total: tempD1 + tempD2, isDoubles: tempD1 === tempD2 });
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        setLastRoll({ d1: finalD1, d2: finalD2, total: finalD1 + finalD2, isDoubles: finalD1 === finalD2 });
        setDiceRolling(false);
        setShowDice(true);
        setTimeout(() => setShowDice(false), 3000);
      }
    }, 100);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const startGame = () => {
    // Validate player setup
    if (numPlayers < 2 || numPlayers > 8) {
      showError('Please select 2-8 players');
      return;
    }

    // Validate player names
    const activePlayers = playerNames.slice(0, numPlayers);
    const hasEmptyNames = activePlayers.some(name => !name.trim());
    if (hasEmptyNames) {
      showError('All players must have names');
      return;
    }

    // Validate unique names
    const uniqueNames = new Set(activePlayers.map(n => n.trim().toLowerCase()));
    if (uniqueNames.size !== numPlayers) {
      showError('Player names must be unique');
      return;
    }

    // Validate pieces selected
    const activePieces = playerPieces.slice(0, numPlayers);
    if (activePieces.some(p => !p)) {
      showError('All players must select a game piece');
      return;
    }

    // Validate unique pieces
    const uniquePieces = new Set(activePieces);
    if (uniquePieces.size !== numPlayers) {
      showError('Each player must have a unique game piece');
      return;
    }

    const newPlayers = [];
    for (let i = 0; i < numPlayers; i++) {
      const piece = GAME_PIECES.find(p => p.id === playerPieces[i]);
      newPlayers.push({
        id: i,
        name: playerNames[i].trim(),
        balance: STARTING_MONEY,
        properties: [],
        color: playerColors[i],
        piece: piece
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setScreen('game');
  };

  const updateBalance = (playerId, amount) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, balance: Math.max(0, p.balance + amount) } : p
    ));
  };

  const transferMoney = (fromId, toId, amount) => {
    const amt = parseInt(amount);

    // Validation
    if (isNaN(amt) || amt <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (fromId === toId) {
      showError('Cannot transfer money to yourself');
      return;
    }

    const fromPlayer = players.find(p => p.id === fromId);
    const toPlayer = players.find(p => p.id === toId);

    if (!fromPlayer || !toPlayer) {
      showError('Invalid player selection');
      return;
    }

    if (fromPlayer.balance < amt) {
      showError(`${fromPlayer.name} does not have enough money ($${fromPlayer.balance} available)`);
      return;
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === fromId) return { ...p, balance: p.balance - amt };
      if (p.id === toId) return { ...p, balance: p.balance + amt };
      return p;
    }));
    setTransactionMode(null);
    setRentMode(null);
    setTransactionAmount('');
    setSelectedPlayer(null);
    setUtilityDiceRoll('');
  };

  const buyProperty = (playerId, property) => {
    const player = players.find(p => p.id === playerId);

    if (!player) {
      showError('Player not found');
      return;
    }

    if (player.balance < property.price) {
      showError(`Insufficient funds. Need $${property.price}, have $${player.balance}`);
      return;
    }

    const isOwned = players.some(p => p.properties.some(pr => pr.name === property.name));
    if (isOwned) {
      showError('Property is already owned');
      return;
    }

    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, balance: p.balance - property.price, properties: [...p.properties, { name: property.name, houses: 0, hotel: false }] }
        : p
    ));
    setTransactionMode(null);
  };

  const sellProperty = (playerId, propertyName) => {
    const property = PROPERTIES.find(p => p.name === propertyName);
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(pr => pr.name === propertyName);
    if (!playerProp) return;
    const refund = property.price + (playerProp.houses * HOUSE_COST) + (playerProp.hotel ? HOTEL_COST : 0);
    
    setPlayers(prev => prev.map(p => 
      p.id === playerId 
        ? { ...p, balance: p.balance + refund, properties: p.properties.filter(pr => pr.name !== propertyName) }
        : p
    ));
  };

  const addHouse = (playerId, propertyName) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(pr => pr.name === propertyName);
    if (!playerProp) return;

    if (player.balance >= HOUSE_COST && playerProp.houses < 4 && !playerProp.hotel) {
      setPlayers(prev => prev.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            balance: p.balance - HOUSE_COST,
            properties: p.properties.map(pr =>
              pr.name === propertyName ? { ...pr, houses: pr.houses + 1 } : pr
            )
          };
        }
        return p;
      }));
    }
  };

  const removeHouse = (playerId, propertyName) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(pr => pr.name === propertyName);
    if (!playerProp || playerProp.houses === 0) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          balance: p.balance + (HOUSE_COST / 2),
          properties: p.properties.map(pr =>
            pr.name === propertyName ? { ...pr, houses: pr.houses - 1 } : pr
          )
        };
      }
      return p;
    }));
  };

  const addHotel = (playerId, propertyName) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const playerProp = player.properties.find(pr => pr.name === propertyName);
    if (!playerProp) return;
    
    if (player.balance >= HOTEL_COST && playerProp.houses === 4 && !playerProp.hotel) {
      setPlayers(prev => prev.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            balance: p.balance - HOTEL_COST,
            properties: p.properties.map(pr => 
              pr.name === propertyName ? { ...pr, houses: 0, hotel: true } : pr
            )
          };
        }
        return p;
      }));
    }
  };

  const calculateRent = (ownerId, propertyName) => {
    const property = PROPERTIES.find(p => p.name === propertyName);
    const owner = players.find(p => p.id === ownerId);
    if (!owner) return 0;
    const ownerProp = owner.properties.find(pr => pr.name === propertyName);
    if (!ownerProp) return 0;
    
    if (property.group === 'railroad') {
      const railroadCount = owner.properties.filter(pr => {
        const prop = PROPERTIES.find(p => p.name === pr.name);
        return prop.group === 'railroad';
      }).length;
      return property.rent[railroadCount - 1] || 0;
    }
    
    if (property.group === 'utility') {
      return null;
    }
    
    if (property.rent && property.rent.length > 0) {
      const groupProperties = PROPERTIES.filter(p => p.group === property.group);
      const ownerGroupProperties = owner.properties.filter(pr => {
        const prop = PROPERTIES.find(p => p.name === pr.name);
        return prop.group === property.group;
      });
      
      const hasMonopoly = groupProperties.length === ownerGroupProperties.length;
      
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
    const property = PROPERTIES.find(p => p.name === propertyName);
    const owner = players.find(p => p.id === toId);
    if (!owner) return;
    
    let rentAmount = 0;
    
    if (property.group === 'utility') {
      const utilityCount = owner.properties.filter(pr => {
        const prop = PROPERTIES.find(p => p.name === pr.name);
        return prop.group === 'utility';
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

  const DiceIcon = ({ value }) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1];
    return <Icon className="w-16 h-16" />;
  };

  const NumberPad = ({ onNumber, onClear, onSubmit }) => {
    return (
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => onNumber(num)}
            className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-2xl font-bold py-4 rounded transition-colors border border-zinc-700"
          >
            {num}
          </button>
        ))}
        <button
          onClick={onClear}
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xl font-bold py-4 rounded transition-colors border border-zinc-700"
        >
          CLR
        </button>
        <button
          onClick={() => onNumber(0)}
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-2xl font-bold py-4 rounded transition-colors border border-zinc-700"
        >
          0
        </button>
        <button
          onClick={onSubmit}
          className="bg-amber-600 hover:bg-amber-500 text-black text-xl font-bold py-4 rounded transition-colors"
        >
          OK
        </button>
      </div>
    );
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
          <div className="clear-both">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (screen === 'setup') {
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
            <h1 className="text-5xl font-bold mb-2 text-amber-400">MONOPOLY BANKER</h1>
            <p className="text-amber-600">Digital Banking System</p>
          </div>

          {numPlayers === 0 ? (
            <div className="bg-zinc-900 rounded-lg p-8 border border-amber-900/30">
              <h2 className="text-2xl font-bold mb-6 text-amber-400">Select Number of Players</h2>
              <div className="grid grid-cols-4 gap-4">
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
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
              <h2 className="text-2xl font-bold mb-6 text-amber-400">Setup Players</h2>
              <div className="space-y-4 mb-8">
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i} className="bg-zinc-800 rounded p-4 border border-amber-900/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-lg font-bold text-amber-400">Player {i + 1}</div>
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
                      <p className="text-xs text-amber-600 mb-2">Select Piece:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {GAME_PIECES.map(piece => {
                          const PieceIcon = piece.icon;
                          const isUsed = playerPieces.some((p, idx) => p === piece.id && idx !== i);
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
                                  ? 'bg-amber-600 border-amber-500 text-black'
                                  : isUsed
                                  ? 'bg-zinc-900 border-zinc-700 opacity-30 cursor-not-allowed'
                                  : 'bg-zinc-900 border-amber-900/30 hover:border-amber-600'
                              }`}
                            >
                              <PieceIcon className="w-6 h-6 mx-auto" />
                              <div className="text-xs mt-1">{piece.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-amber-600 mb-2">Select Color:</p>
                      <div className="grid grid-cols-8 gap-2">
                        {PLAYER_COLORS.map(color => {
                          const isUsed = playerColors.some((c, idx) => c === color && idx !== i);
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
                              className={`w-10 h-10 rounded ${color} ${
                                playerColors[i] === color
                                  ? 'ring-4 ring-amber-400'
                                  : isUsed
                                  ? 'opacity-30 cursor-not-allowed'
                                  : 'hover:ring-2 ring-amber-600'
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
                  disabled={playerPieces.slice(0, numPlayers).some(p => !p) || playerColors.slice(0, numPlayers).some(c => !c)}
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
    <div className="min-h-screen bg-black text-amber-50 p-4">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {errorMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-lg p-4 mb-4 border border-amber-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-400" />
              <h1 className="text-2xl font-bold text-amber-400">MONOPOLY BANKER</h1>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset game?')) {
                  setScreen('setup');
                  setPlayers([]);
                  setNumPlayers(0);
                  setPlayerNames(['', '', '', '', '', '', '', '']);
                  setPlayerPieces(['', '', '', '', '', '', '', '']);
                  setPlayerColors(['', '', '', '', '', '', '', '']);
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/30 text-amber-400"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {(showDice || diceRolling) && lastRoll && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className={`bg-zinc-900 border-2 border-amber-600 rounded-lg p-8 ${diceRolling ? 'animate-pulse' : ''}`}>
              <div className="flex gap-6 items-center justify-center text-amber-400">
                <DiceIcon value={lastRoll.d1} />
                <div className="text-4xl font-bold">+</div>
                <DiceIcon value={lastRoll.d2} />
                <div className="text-4xl font-bold">=</div>
                <div className="text-5xl font-bold text-amber-400">{lastRoll.total}</div>
              </div>
              {lastRoll.isDoubles && !diceRolling && (
                <div className="text-2xl font-bold text-center mt-4 text-amber-400">DOUBLES!</div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {players.map(player => {
              const PieceIcon = player.piece.icon;
              return (
                <div
                  key={player.id}
                  className={`bg-zinc-900 rounded-lg p-4 border-2 transition-all ${
                    currentPlayer === player.id ? 'border-amber-600' : 'border-amber-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 ${player.color} rounded flex items-center justify-center`}>
                        <PieceIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-amber-50">{player.name}</h3>
                        <div className="text-2xl font-bold text-amber-400">
                          ${player.balance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPlayer(player.id)}
                      className={`px-4 py-2 rounded font-bold transition-all ${
                        currentPlayer === player.id
                          ? 'bg-amber-600 text-black'
                          : 'bg-zinc-800 hover:bg-zinc-700 border border-amber-900/30 text-amber-400'
                      }`}
                    >
                      {currentPlayer === player.id ? 'Active' : 'Select'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => passGo(player.id)}
                      className="bg-amber-600 hover:bg-amber-500 text-black px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Pass GO
                    </button>
                    <button
                      onClick={() => {
                        setTransactionMode('pay');
                        setCurrentPlayer(player.id);
                        setTransactionAmount('');
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-3 py-1.5 rounded text-sm font-bold transition-colors border border-amber-900/30"
                    >
                      Pay
                    </button>
                    <button
                      onClick={() => {
                        setTransactionMode('receive');
                        setCurrentPlayer(player.id);
                        setTransactionAmount('');
                      }}
                      className="bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors"
                    >
                      Receive
                    </button>
                  </div>

                  {/* Properties Section */}
                  {player.properties.length > 0 && (
                    <div className="mt-3 border-t border-amber-900/30 pt-3">
                      <h4 className="text-xs font-bold text-amber-500 mb-2">Properties</h4>
                      <div className="space-y-1">
                        {player.properties.map((prop, idx) => {
                          const property = PROPERTIES.find(p => p.name === prop.name);
                          if (!property) return null;
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs bg-zinc-900/50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${property.color}`}></div>
                                <span className="text-amber-100">{prop.name}</span>
                                {prop.houses > 0 && (
                                  <span className="text-green-400">
                                    {prop.houses === 5 ? '🏨' : '🏠'.repeat(prop.houses)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedProperty(prop.name);
                                  setCurrentPlayer(player.id);
                                }}
                                className="text-amber-400 hover:text-amber-300"
                              >
                                Manage
                              </button>
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

          <div className="space-y-4">
            {/* Dice Roll Section */}
            <div className="mb-6">
              <button
                onClick={rollDice}
                disabled={diceRolling}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Dice1 className="w-6 h-6" />
                {diceRolling ? 'Rolling...' : 'Roll Dice'}
              </button>

              {showDice && lastRoll && (
                <div className="mt-4 bg-zinc-900 p-4 rounded-lg border border-amber-900/30 text-center">
                  <div className="flex justify-center gap-4 mb-2">
                    {[lastRoll.d1, lastRoll.d2].map((die, idx) => {
                      const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][die - 1];
                      return <DiceIcon key={idx} className="w-12 h-12 text-amber-400" />;
                    })}
                  </div>
                  <p className="text-2xl font-bold text-amber-400">Total: {lastRoll.total}</p>
                  {lastRoll.isDoubles && <p className="text-green-400 text-sm mt-1">Doubles!</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
        {transactionMode && currentPlayer !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-amber-900/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400">
                  {transactionMode === 'pay' ? 'Pay Money' : 'Receive Money'}
                </h3>
                <button
                  onClick={() => {
                    setTransactionMode(null);
                    setCurrentPlayer(null);
                    setSelectedPlayer(null);
                    setTransactionAmount('');
                  }}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-amber-100 mb-2">
                  From: {players.find(p => p.id === currentPlayer)?.name}
                </p>

                {transactionMode === 'pay' && (
                  <div className="mb-4">
                    <label className="block text-amber-400 mb-2">To:</label>
                    <select
                      value={selectedPlayer || ''}
                      onChange={(e) => setSelectedPlayer(parseInt(e.target.value))}
                      className="w-full bg-zinc-800 text-amber-100 p-2 rounded border border-amber-900/30"
                    >
                      <option value="">Select Player</option>
                      {players.filter(p => p.id !== currentPlayer).map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
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
                    if (transactionMode === 'pay' && selectedPlayer !== null) {
                      transferMoney(currentPlayer, selectedPlayer, amount);
                    } else if (transactionMode === 'receive') {
                      updateBalance(currentPlayer, amount);
                    }
                    setTransactionMode(null);
                    setCurrentPlayer(null);
                    setSelectedPlayer(null);
                    setTransactionAmount('');
                  }
                }}
                disabled={transactionMode === 'pay' && !selectedPlayer}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Property Management Modal */}
        {selectedProperty && currentPlayer !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-amber-900/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400">Manage Property</h3>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    setCurrentPlayer(null);
                  }}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-amber-100 text-lg mb-4">{selectedProperty}</p>

                {(() => {
                  const player = players.find(p => p.id === currentPlayer);
                  const playerProp = player?.properties.find(p => p.name === selectedProperty);
                  const property = PROPERTIES.find(p => p.name === selectedProperty);

                  if (!property || property.group === 'railroad' || property.group === 'utility') {
                    return (
                      <div className="space-y-2">
                        <button
                          onClick={() => sellProperty(currentPlayer, selectedProperty)}
                          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
                        >
                          Sell Property (${(property?.price || 0) / 2 })
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <div className="bg-zinc-800 p-3 rounded mb-3">
                        <p className="text-amber-100">
                          Houses: {playerProp?.houses === 5 ? 'Hotel' : playerProp?.houses || 0}
                        </p>
                      </div>

                      <button
                        onClick={() => addHouse(currentPlayer, selectedProperty)}
                        disabled={playerProp?.houses >= 5}
                        className="w-full bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                      >
                        Add House (${HOUSE_COST})
                      </button>

                      <button
                        onClick={() => removeHouse(currentPlayer, selectedProperty)}
                        disabled={!playerProp?.houses || playerProp.houses === 0}
                        className="w-full bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded transition-colors"
                      >
                        Remove House
                      </button>

                      <button
                        onClick={() => sellProperty(currentPlayer, selectedProperty)}
                        className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
                      >
                        Sell Property (${(property?.price || 0) / 2 })
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
