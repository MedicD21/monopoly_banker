import React, { useState } from "react";
import { Check, X } from "lucide-react";
import QRCode from "react-qr-code";
import { GAME_PIECES, PLAYER_COLORS } from "../types/game";

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

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const allReady = players.length >= 2 && players.every((p) => p.isReady);
  const gameUrl = `${window.location.origin}?join=${gameCode}`;

  // Get used pieces and colors
  const usedPieces = players
    .filter((p) => p.id !== currentPlayerId)
    .map((p) => p.pieceId);
  const usedColors = players
    .filter((p) => p.id !== currentPlayerId)
    .map((p) => p.color);

  const handleSaveSettings = () => {
    if (name && selectedPiece && selectedColor) {
      onPlayerUpdate(name, selectedPiece, selectedColor);
    }
  };

  return (
    <div className="min-h-screen bg-black text-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-amber-400">Game Lobby</h1>
          <button
            onClick={onLeave}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            Leave Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Game Code & QR Code */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 text-center">
              Join Code
            </h2>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-amber-400 tracking-widest mb-2">
                {gameCode}
              </div>
              <p className="text-sm text-amber-600">
                Share this code with other players
              </p>
            </div>

            <div className="bg-green-300 p-4 rounded-lg inline-block flex items-center justify-center">
              <QRCode value={gameUrl} size={150} />
            </div>
            <p className="text-xs text-amber-600 mt-2 text-center">
              Scan to join instantly
            </p>
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
                  onClick={() => {
                    handleSaveSettings();
                    onToggleReady();
                  }}
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
                      <p className="font-bold text-amber-50">
                        {player.name || "Setting up..."}
                        {player.isHost && (
                          <span className="text-xs text-amber-400 ml-2">
                            (Host)
                          </span>
                        )}
                      </p>
                      {player.pieceId && piece && piece.name && (
                        <p className="text-sm text-amber-600">{piece.name}</p>
                      )}
                    </div>
                  </div>
                  {player.isReady ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <X className="w-6 h-6 text-amber-600" />
                  )}
                </div>
              );
            })}
          </div>

          {isHost && (
            <div className="mt-6">
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
