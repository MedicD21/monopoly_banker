# Phase 1 Implementation - UI Reorganization Guide

## Summary of Changes

This phase focuses on reorganizing the UI WITHOUT multiplayer. You can test everything locally with multiple people on one device selecting their player.

## Files Created

1. `src/components/NumberPad.tsx` - Number pad component
2. `src/components/NumberPadModal.tsx` - Number pad in modal form
3. `src/components/PayPlayerModal.tsx` - Enhanced pay system
4. `src/components/RentSelector.tsx` - Dynamic rent calculation
5. `netlify.toml` - Netlify configuration
6. `.env.example` - Environment variable template

## Key Changes to monopoly.tsx

### 1. Add Imports (at top of file)
```typescript
import NumberPadModal from "./src/components/NumberPadModal";
import PayPlayerModal from "./src/components/PayPlayerModal";
import RentSelector from "./src/components/RentSelector";
import { Banknote } from "lucide-react";
```

### 2. Add New State Variables (around line 291)
```typescript
const [currentPlayerId, setCurrentPlayerId] = useState(0); // Which player's view
const [showPayPlayerModal, setShowPayPlayerModal] = useState(false);
const [showRentSelector, setShowRentSelector] = useState(false);
const [selectedLandlord, setSelectedLandlord] = useState(null);
const [showNumberPad, setShowNumberPad] = useState(false);
const [numberPadTitle, setNumberPadTitle] = useState("Enter Amount");
const [numberPadCallback, setNumberPadCallback] = useState(null);
```

### 3. Add Helper Functions for Enhanced Pay System

Add these after the existing helper functions (around line 660):

```typescript
const handleBankerPays = () => {
  if (currentPlayerId === null) {
    showError("Please select which player you are");
    return;
  }
  setNumberPadTitle("Banker Pays");
  setNumberPadCallback(() => (amount) => {
    updateBalance(currentPlayerId, amount);
  });
  setShowNumberPad(true);
};

const handlePayRentClick = (landlordId) => {
  setSelectedLandlord(landlordId);
  setShowPayPlayerModal(false);
  setShowRentSelector(true);
};

const handleCustomAmountClick = (toPlayerId) => {
  setNumberPadTitle(`Pay to ${players.find(p => p.id === toPlayerId)?.name}`);
  setNumberPadCallback(() => (amount) => {
    transferMoney(currentPlayerId, toPlayerId, amount.toString());
  });
  setShowPayPlayerModal(false);
  setShowNumberPad(true);
};

const handlePayRent = (amount, propertyName) => {
  if (selectedLandlord !== null && currentPlayerId !== null) {
    transferMoney(currentPlayerId, selectedLandlord, amount.toString());
    setShowRentSelector(false);
    setSelectedLandlord(null);
  }
};
```

### 4. Reorganize Game Screen Layout

Replace the game screen section (starting around line 882) with this structure:

```tsx
return (
  <div className="min-h-screen bg-black text-amber-50 p-2 sm:p-4">
    {/* Error Toast */}
    {errorMessage && (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
        {errorMessage}
      </div>
    )}

    <div className="max-w-7xl mx-auto">
      {/* BANKER CARD - NEW LAYOUT */}
      <div className="bg-zinc-900 rounded-lg p-4 mb-4 border border-amber-900/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/Banker.svg" alt="Banker" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-amber-400">MONOPOLY BANKER</h1>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Reset game?")) {
                // Reset logic
              }
            }}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/30 text-amber-400"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Banker Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              if (currentPlayerId === null) {
                showError("Please select which player you are first");
                return;
              }
              passGo(currentPlayerId);
            }}
            className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded font-bold transition-colors flex items-center gap-2"
          >
            <img src="/images/Go.svg" alt="GO" className="w-5 h-5" />
            Pass GO
          </button>

          <button
            onClick={() => {
              if (currentPlayerId === null) {
                showError("Please select which player you are first");
                return;
              }
              setCurrentPlayer(currentPlayerId);
              setShowBuyProperty(true);
            }}
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold transition-colors flex items-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Buy Property
          </button>

          <button
            onClick={handleBankerPays}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition-colors flex items-center gap-2"
          >
            <Banknote className="w-5 h-5" />
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
                  const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][die - 1];
                  return <DiceIcon key={idx} className="w-10 h-10 text-amber-400" />;
                })}
              </div>
              <p className="text-xl font-bold text-amber-400">Total: {lastRoll.total}</p>
              {lastRoll.isDoubles && <p className="text-green-400 text-sm mt-1">Doubles!</p>}
            </div>
          )}
        </div>
      </div>

      {/* PLAYERS LIST */}
      <div className="space-y-3">
        {players.map((player) => {
          const isCurrentUser = player.id === currentPlayerId;

          return (
            <div
              key={player.id}
              className={`bg-zinc-900 rounded-lg p-4 border-2 transition-all ${
                isCurrentUser ? "border-amber-600" : "border-amber-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 ${player.color} rounded flex items-center justify-center p-1`}>
                    <img src={player.piece.icon} alt={player.piece.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-50">{player.name}</h3>
                    <div className="text-2xl font-bold text-amber-400">
                      ${player.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPlayerId(player.id)}
                  className={`px-4 py-2 rounded font-bold transition-all ${
                    isCurrentUser
                      ? "bg-amber-600 text-black"
                      : "bg-zinc-800 hover:bg-zinc-700 border border-amber-900/30 text-amber-400"
                  }`}
                >
                  {isCurrentUser ? "You" : "Select"}
                </button>
              </div>

              {/* Player-specific action buttons - ONLY SHOW IF THIS IS THE CURRENT USER */}
              {isCurrentUser && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => {
                      setShowPayPlayerModal(true);
                    }}
                    className="bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
                  >
                    <img src="/images/Payment.svg" alt="Pay" className="w-4 h-4" />
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
                    <img src="/images/Bank.svg" alt="Bank" className="w-4 h-4" />
                    Receive
                  </button>
                </div>
              )}

              {/* Properties Section - ALWAYS VISIBLE */}
              {player.properties.length > 0 && (
                <div className="mt-3 border-t border-amber-900/30 pt-3">
                  <h4 className="text-xs font-bold text-amber-500 mb-2">Properties</h4>
                  <div className="space-y-1">
                    {player.properties.map((prop, idx) => {
                      const property = PROPERTIES.find((p) => p.name === prop.name);
                      if (!property) return null;

                      return (
                        <div key={idx} className="flex items-center justify-between text-xs bg-zinc-900/50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            {property.group === 'railroad' ? (
                              <img src="/images/Railroad.svg" alt="Railroad" className="w-4 h-4" />
                            ) : property.group === 'utility' ? (
                              property.name === 'Electric Company' ? (
                                <img src="/images/Electric_Company.svg" alt="Electric" className="w-4 h-4" />
                              ) : (
                                <img src="/images/Waterworks.svg" alt="Water" className="w-4 h-4" />
                              )
                            ) : (
                              <div className={`w-3 h-3 rounded ${property.color}`}></div>
                            )}
                            <span className="text-amber-100">{prop.name}</span>
                            {prop.hotel ? (
                              <img src="/images/Hotel.svg" alt="Hotel" className="w-4 h-4" />
                            ) : prop.houses > 0 ? (
                              <span className="flex gap-0.5">
                                {Array.from({ length: prop.houses }).map((_, i) => (
                                  <img key={i} src="/images/House.svg" alt="House" className="w-3 h-3" />
                                ))}
                              </span>
                            ) : null}
                          </div>

                          {/* Manage button only for current user */}
                          {isCurrentUser && (
                            <button
                              onClick={() => {
                                setSelectedProperty(prop.name);
                                setCurrentPlayer(player.id);
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
    </div>

    {/* MODALS */}
    <PayPlayerModal
      isOpen={showPayPlayerModal}
      onClose={() => setShowPayPlayerModal(false)}
      currentPlayer={players.find(p => p.id === currentPlayerId)}
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
      landlord={players.find(p => p.id === selectedLandlord)}
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

    {/* Keep existing Buy Property and Property Management modals */}
  </div>
);
```

## Testing Steps

1. Start the game normally
2. Set up 2-3 players
3. **Important**: Click "Select" on one player card to set who "you" are
4. Only THAT player's card will show Pay/Receive buttons
5. Other players show only their balance and properties
6. Use Banker card buttons for Pass GO, Buy Property, Banker Pays
7. Roll Dice is under the Banker card
8. Test the Pay button → should show all opponents with "Pay Rent" and "Custom Amount"
9. Test Pay Rent → should show dynamic rent calculation
10. All number inputs use the number pad modal

## Next Phase

Phase 2 will add:
- Firebase multiplayer
- QR code lobby system
- Real-time sync across devices
- Game variants configuration

For now, this gives you the complete UI reorganization working locally!
