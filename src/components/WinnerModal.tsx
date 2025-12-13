import React from 'react';

interface WinnerModalProps {
  isOpen: boolean;
  winnerName: string;
  winnerPieceIcon: string;
  onClose: () => void;
}

export default function WinnerModal({
  isOpen,
  winnerName,
  winnerPieceIcon,
  onClose,
}: WinnerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-4 border-amber-500 rounded-lg p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-12 h-12 bg-amber-400 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-yellow-400 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-amber-300 rounded-full animate-float-fast"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-transparent to-yellow-600/30"></div>
        </div>

        <div className="relative z-10">
          {/* Trophy/Winner Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/50 rounded-full blur-2xl animate-pulse"></div>
              <img
                src={winnerPieceIcon}
                alt="Winner"
                className="w-32 h-32 drop-shadow-2xl relative z-10"
              />
            </div>
          </div>

          {/* Winner Text */}
          <h2 className="text-5xl font-bold text-amber-400 mb-4 drop-shadow-lg animate-pulse">
            🏆 WINNER! 🏆
          </h2>
          <p className="text-3xl text-green-400 mb-6 font-bold">
            {winnerName}
          </p>
          <p className="text-lg text-amber-200 mb-6">
            Congratulations! You've won the game!
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Finish Game
          </button>
        </div>
      </div>
    </div>
  );
}
