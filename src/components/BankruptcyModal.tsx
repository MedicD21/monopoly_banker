import React from 'react';

interface BankruptcyModalProps {
  isOpen: boolean;
  playerName: string;
  onClose: () => void;
}

export default function BankruptcyModal({
  isOpen,
  playerName,
  onClose,
}: BankruptcyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-4 border-red-600 rounded-lg p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/20 animate-pulse"></div>

        <div className="relative z-10">
          {/* Bankrupt SVG */}
          <div className="mb-6 flex justify-center">
            <img
              src="/images/Bankrupt.svg"
              alt="Bankrupt"
              className="w-32 h-32 drop-shadow-2xl"
            />
          </div>

          {/* Player Name */}
          <h2 className="text-4xl font-bold text-red-500 mb-4 drop-shadow-lg">
            BANKRUPT!
          </h2>
          <p className="text-2xl text-amber-400 mb-6">
            {playerName} has gone bankrupt!
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
