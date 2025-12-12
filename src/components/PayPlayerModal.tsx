import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  balance: number;
  color: string;
  piece: { name: string; icon: string };
  properties: any[];
}

interface PayPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  allPlayers: Player[];
  onPayRent: (toPlayerId: number) => void;
  onCustomAmount: (toPlayerId: number) => void;
}

export default function PayPlayerModal({
  isOpen,
  onClose,
  currentPlayer,
  allPlayers,
  onPayRent,
  onCustomAmount,
}: PayPlayerModalProps) {
  if (!isOpen) return null;

  const opponents = allPlayers.filter((p) => p.id !== currentPlayer.id);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-amber-400">Pay Player</h3>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-amber-100 mb-4">
          From: <span className="font-bold">{currentPlayer.name}</span>
        </p>

        <div className="space-y-3">
          {opponents.map((player) => (
            <div
              key={player.id}
              className="bg-zinc-800 rounded-lg p-4 border border-amber-900/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${player.color} rounded flex items-center justify-center p-1`}>
                  <img
                    src={player.piece.icon}
                    alt={player.piece.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-amber-50">{player.name}</h4>
                  <p className="text-sm text-amber-400">${player.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onPayRent(player.id)}
                  disabled={player.properties.length === 0}
                  className="flex-1 bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                >
                  Pay Rent
                </button>
                <button
                  onClick={() => onCustomAmount(player.id)}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                >
                  Custom Amount
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
