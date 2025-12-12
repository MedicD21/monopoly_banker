import React from 'react';
import { Users, LogIn } from 'lucide-react';

interface StartScreenProps {
  onHost: () => void;
  onJoin: () => void;
}

export default function StartScreen({ onHost, onJoin }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-black text-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src="/images/Monopoly_Logo.svg" alt="Monopoly" className="w-64 h-auto" />
          </div>
          <h1 className="text-5xl font-bold mb-2 text-amber-400">
            MONOPOLY BANKER
          </h1>
          <p className="text-amber-600 text-lg">Digital Banking System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onHost}
            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-6 rounded-lg text-xl transition-colors flex items-center justify-center gap-3"
          >
            <Users className="w-8 h-8" />
            Host Game
          </button>

          <button
            onClick={onJoin}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-6 rounded-lg text-xl transition-colors flex items-center justify-center gap-3"
          >
            <LogIn className="w-8 h-8" />
            Join Game
          </button>
        </div>

        <div className="mt-8 text-center text-amber-600 text-sm">
          <p>Each player uses their own device</p>
          <p>Host creates the game, others join with a code</p>
        </div>
      </div>
    </div>
  );
}
