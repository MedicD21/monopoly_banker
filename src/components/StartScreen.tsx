import React from "react";
import { Users, LogIn } from "lucide-react";

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
            <img
              src="/images/digitalbankerlogo.svg"
              alt="Digital Banker"
              className="w-auto h-auto"
            />
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onHost}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-6 rounded-lg text-xl transition-colors flex items-center justify-center gap-3"
          >
            <Users className="w-8 h-8" />
            Host Game
          </button>

          <button
            onClick={onJoin}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-6 rounded-lg text-xl transition-colors flex items-center justify-center gap-3"
          >
            <LogIn className="w-8 h-8" />
            Join Game
          </button>
        </div>

        <div className="mt-8 text-center text-amber-600 text-sm">
          <p>Each player uses their own device</p>
          <p>Host creates the game, others join with a code</p>
        </div>

        <div className="mt-8 pt-6 border-t border-amber-900/30 text-center text-zinc-500 text-xs">
          <p className="mb-2">
            Digital Banker is an independent companion app for classic board games.
          </p>
          <p>
            Not affiliated with, endorsed by, or associated with Hasbro, Inc. or any board game manufacturer.
          </p>
          <p className="mt-2">
            All property names, game piece designs, and gameplay elements are original creations.
          </p>
        </div>
      </div>
    </div>
  );
}
