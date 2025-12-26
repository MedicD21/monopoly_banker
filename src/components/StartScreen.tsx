import React, { useState } from "react";
import { Users, LogIn, ShoppingCart } from "lucide-react";
import ProPurchaseModal from "./ProPurchaseModal";

interface StartScreenProps {
  onHost: () => void;
  onJoin: () => void;
}

export default function StartScreen({ onHost, onJoin }: StartScreenProps) {
  const [showProModal, setShowProModal] = useState(false);
  const isDev = import.meta.env.DEV;

  return (
    <div className="h-full bg-black text-amber-50 flex items-center justify-center p-4" style={{ minHeight: '100%' }}>
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

          {/* Dev-only button to test IAP modal */}
          {isDev && (
            <button
              onClick={() => setShowProModal(true)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-3 border-2 border-amber-400"
            >
              <ShoppingCart className="w-6 h-6" />
              Test IAP Modal (Dev Only)
            </button>
          )}
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

      {/* Pro Purchase Modal */}
      {showProModal && <ProPurchaseModal onClose={() => setShowProModal(false)} />}
    </div>
  );
}
