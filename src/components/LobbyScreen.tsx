import React, { useState, useRef } from "react";
import { Check, X } from "lucide-react";
import { GAME_PIECES, PLAYER_COLORS } from "../types/game";
import { PROPERTIES, BOARD_SPACES } from "../constants/monopolyData";

interface Player {
  id: string;
  name: string;
  pieceId: string;
  color: string;
  isReady: boolean;
  isHost?: boolean;
}

interface LobbyScreenProps {
  gameCode: string;
  isHost: boolean;
  currentPlayerId: string;
  players: Player[];
  onPlayerUpdate: (name: string, pieceId: string, color: string) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
  onRandomizeOrder?: () => void; // Updated reference
}

export default function LobbyScreen({
  gameCode,
  isHost,
  currentPlayerId,
  players,
  onPlayerUpdate,
  onToggleReady,
  onStartGame,
  onLeave,
}: LobbyScreenProps) {
  const [name, setName] = useState("");
  const [selectedPiece, setSelectedPiece] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [secretCounter, setSecretCounter] = useState(0);
  const secretTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  // Allow solo starts (single-player host)
  const allReady = players.length >= 1 && players.every((p) => p.isReady);
  const gameUrl = `${window.location.origin}?join=${gameCode}`;

  // Get used pieces and colors
  const usedPieces = players
    .filter((p) => p.id !== currentPlayerId)
    .map((p) => p.pieceId);
  const usedColors = players
    .filter((p) => p.id !== currentPlayerId)
    .map((p) => p.color);

  const handleSaveSettings = async () => {
    if (name && selectedPiece && selectedColor) {
      await onPlayerUpdate(name, selectedPiece, selectedColor);
    }
  };

  const handleReadyClick = async () => {
    await handleSaveSettings();
    // Small delay to ensure Firebase has updated
    await new Promise((resolve) => setTimeout(resolve, 300));
    await onToggleReady();
  };

  const applyClassicMonopolyNames = () => {
    const classicNames = [
      "Mediterranean Ave",
      "Baltic Ave",
      "Oriental Ave",
      "Vermont Ave",
      "Connecticut Ave",
      "St. Charles Place",
      "States Ave",
      "Virginia Ave",
      "St. James Place",
      "Tennessee Ave",
      "New York Ave",
      "Kentucky Ave",
      "Indiana Ave",
      "Illinois Ave",
      "Atlantic Ave",
      "Ventnor Ave",
      "Marvin Gardens",
      "Pacific Ave",
      "North Carolina Ave",
      "Pennsylvania Ave",
      "Park Place",
      "Boardwalk",
      "Reading Railroad",
      "Pennsylvania Railroad",
      "B&O Railroad",
      "Short Line",
      "Electric Company",
      "Water Works",
    ];

    // Map through PROPERTIES in order and assign classic names
    PROPERTIES.forEach((prop, idx) => {
      if (classicNames[idx]) {
        prop.name = classicNames[idx];
      }
    });

    const classicBoard = [
      "GO",
      "Mediterranean Ave",
      "Community Chest",
      "Baltic Ave",
      "Income Tax",
      "Reading Railroad",
      "Oriental Ave",
      "Chance",
      "Vermont Ave",
      "Connecticut Ave",
      "Just Visiting / Jail",
      "St. Charles Place",
      "Electric Company",
      "States Ave",
      "Virginia Ave",
      "Pennsylvania Railroad",
      "St. James Place",
      "Community Chest",
      "Tennessee Ave",
      "New York Ave",
      "Free Parking",
      "Kentucky Ave",
      "Chance",
      "Indiana Ave",
      "Illinois Ave",
      "B&O Railroad",
      "Atlantic Ave",
      "Ventnor Ave",
      "Water Works",
      "Marvin Gardens",
      "Go To Jail",
      "Pacific Ave",
      "North Carolina Ave",
      "Community Chest",
      "Pennsylvania Ave",
      "Short Line",
      "Chance",
      "Park Place",
      "Luxury Tax",
      "Boardwalk",
    ];

    BOARD_SPACES.splice(0, BOARD_SPACES.length, ...classicBoard);
    alert("Classic Monopoly property names unlocked!");
  };

  const handleSecretTap = (player: Player) => {
    if (!player.isHost) return;

    if (secretTimerRef.current) {
      clearTimeout(secretTimerRef.current);
    }

    setSecretCounter((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        applyClassicMonopolyNames();
        return 0;
      }
      return next;
    });

    secretTimerRef.current = setTimeout(() => {
      setSecretCounter(0);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen bg-black text-amber-50 p-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Game Lobby</h1>
          </div>
          <button
            onClick={onLeave}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            Leave Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Game Code */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 text-center">
              Join Code
            </h2>
            <div className="text-center">
              <div className="text-8xl font-bold text-amber-400 tracking-widest mb-4">
                {gameCode}
              </div>
              <p className="text-lg text-amber-600 mb-2">
                Share this code with other players
              </p>
              <p className="text-sm text-amber-700">
                Players can join at {gameUrl}
              </p>
            </div>
          </div>

          {/* Your Setup */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30">
            <h2 className="text-xl font-bold text-amber-400 mb-4">
              Your Setup
            </h2>

            {currentPlayer?.isReady ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div
                    className={`w-16 h-16 ${currentPlayer.color} rounded flex items-center justify-center p-2`}
                  >
                    <img
                      src={
                        GAME_PIECES.find((p) => p.id === currentPlayer.pieceId)
                          ?.icon
                      }
                      alt="Your piece"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-amber-50 mb-2">
                  {currentPlayer.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-green-400 text-lg">
                  <Check className="w-6 h-6" />
                  Ready!
                </div>
                <button
                  onClick={onToggleReady}
                  className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-4 py-2 rounded font-bold transition-colors"
                >
                  Change Settings
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="Enter your name"
                    maxLength={20}
                    className="w-full bg-zinc-800 text-amber-50 px-4 py-2 rounded border border-amber-900/30 focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 mb-2">
                    Game Piece
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {GAME_PIECES.map((piece) => {
                      const isUsed = usedPieces.includes(piece.id);
                      return (
                        <button
                          key={piece.id}
                          onClick={() => !isUsed && setSelectedPiece(piece.id)}
                          disabled={isUsed}
                          className={`p-3 rounded border transition-all ${
                            selectedPiece === piece.id
                              ? "bg-amber-600 border-amber-500"
                              : isUsed
                              ? "bg-zinc-900 border-zinc-700 opacity-30 cursor-not-allowed"
                              : "bg-zinc-800 border-amber-900/30 hover:border-amber-600"
                          }`}
                        >
                          <img
                            src={piece.icon}
                            alt={piece.name}
                            className="w-full h-auto"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-amber-400 mb-2">Color</label>
                  <div className="grid grid-cols-8 gap-2">
                    {PLAYER_COLORS.map((color) => {
                      const isUsed = usedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => !isUsed && setSelectedColor(color)}
                          disabled={isUsed}
                          className={`w-10 h-10 rounded ${color} ${
                            selectedColor === color
                              ? "ring-4 ring-amber-400"
                              : isUsed
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:ring-2 ring-amber-600"
                          } transition-all`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleReadyClick}
                  disabled={!name || !selectedPiece || !selectedColor}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded transition-colors"
                >
                  Ready
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30">
          <h2 className="text-xl font-bold text-amber-400 mb-4">
            Players ({players.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((player) => {
              const piece = player.pieceId
                ? GAME_PIECES.find((p) => p.id === player.pieceId)
                : undefined;
              return (
                <div
                  key={player.id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {player.pieceId && piece && piece.icon ? (
                      <div
                        className={`w-12 h-12 ${player.color} rounded flex items-center justify-center p-1`}
                        onClick={() => handleSecretTap(player)}
                      >
                        <img
                          src={piece.icon}
                          alt={piece.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 ${player.color} rounded flex items-center justify-center p-1 bg-zinc-700`}
                      >
                        <span className="text-xs text-zinc-400">No Piece</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-amber-50 flex items-center gap-2">
                        {player.name || "Setting up..."}
                        {player.isHost && (
                          <span className="text-xs text-amber-400 ml-1">
                            (Host)
                          </span>
                        )}
                      </p>
                      {player.pieceId && piece && piece.name && (
                        <p className="text-sm text-amber-600">{piece.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.isReady ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <X className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Always show for debug; revert to isHost && (...) for production */}
          {(isHost || true) && (
            <div className="mt-6 space-y-3">
              {typeof onRandomizeOrder === "function" && (
                <button
                  onClick={onRandomizeOrder}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Randomize Player Order
                </button>
              )}
              <button
                onClick={onStartGame}
                disabled={!allReady}
                className="w-full bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-4 rounded-lg text-xl transition-colors"
              >
                {allReady
                  ? "Start Game"
                  : "Waiting for all players to be ready..."}
              </button>
            </div>
          )}

          {!isHost && (
            <div className="mt-6 text-center text-amber-600">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
