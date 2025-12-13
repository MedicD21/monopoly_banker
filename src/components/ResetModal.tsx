import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGameSamePlayers: () => void;
  onCompleteReset: () => void;
}

export default function ResetModal({
  isOpen,
  onClose,
  onNewGameSamePlayers,
  onCompleteReset,
}: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 text-center">
          Reset Game
        </h2>
        <p className="text-amber-200 mb-6 text-center">
          How would you like to reset?
        </p>

        <div className="flex flex-col gap-3">
          {/* New Game with Same Players */}
          <button
            onClick={() => {
              onNewGameSamePlayers();
              onClose();
            }}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            New Game - Same Players
          </button>

          {/* Complete Reset */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure? This will end the lobby and return to the main menu.")) {
                onCompleteReset();
                onClose();
              }
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Complete Reset
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="bg-zinc-700 hover:bg-zinc-600 text-amber-200 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
