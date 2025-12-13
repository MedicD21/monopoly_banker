import React, { useState } from "react";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import NumberPadModal from "./NumberPadModal";
import { usePro } from "../context/ProContext";
import ProPurchaseModal from "./ProPurchaseModal";

interface GameConfig {
  startingMoney: number;
  passGoAmount: number;
  freeParkingJackpot: boolean;
  doubleGoOnLanding: boolean;
  auctionProperties: boolean;
  speedDie: boolean;
}

interface HostSetupProps {
  onBack: () => void;
  onCreateGame: (config: GameConfig) => void;
}

export default function HostSetup({ onBack, onCreateGame }: HostSetupProps) {
  const { isPro } = usePro();
  const [showProModal, setShowProModal] = useState(false);

  const [config, setConfig] = useState<GameConfig>({
    startingMoney: 1500,
    passGoAmount: 200,
    freeParkingJackpot: false,
    doubleGoOnLanding: false,
    auctionProperties: false,
    speedDie: false,
  });

  const [showNumberPad, setShowNumberPad] = useState(false);
  const [editingField, setEditingField] = useState<
    "startingMoney" | "passGoAmount" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNumberPadConfirm = (value: number) => {
    if (editingField) {
      setConfig({ ...config, [editingField]: value });
    }
  };

  return (
    <div className="min-h-screen bg-black text-amber-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">
            Game Setup
          </h1>
          <p className="text-red-600">Configure your game settings</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-400">
              Game Variants
            </h2>
            {isPro && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Crown className="w-4 h-4" />
                <span>Pro</span>
              </div>
            )}
          </div>

          {!isPro && (
            <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-600/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-amber-300 font-bold mb-1">Unlock Pro Features</h3>
                  <p className="text-amber-600 text-sm mb-3">
                    Get access to all game variants with a one-time purchase of $1.99
                  </p>
                  <button
                    onClick={() => setShowProModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 text-sm flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className={`flex items-center justify-between p-3 bg-zinc-800 rounded ${isPro ? 'cursor-pointer hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
              <div className="flex items-center gap-2">
                <span className="text-amber-50">Free Parking Jackpot</span>
                {!isPro && <Lock className="w-4 h-4 text-amber-600" />}
              </div>
              <input
                type="checkbox"
                checked={config.freeParkingJackpot}
                onChange={(e) =>
                  isPro && setConfig({ ...config, freeParkingJackpot: e.target.checked })
                }
                disabled={!isPro}
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            <label className={`flex items-center justify-between p-3 bg-zinc-800 rounded ${isPro ? 'cursor-pointer hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
              <div className="flex items-center gap-2">
                <span className="text-amber-50">Double GO on Exact Landing</span>
                {!isPro && <Lock className="w-4 h-4 text-amber-600" />}
              </div>
              <input
                type="checkbox"
                checked={config.doubleGoOnLanding}
                onChange={(e) =>
                  isPro && setConfig({ ...config, doubleGoOnLanding: e.target.checked })
                }
                disabled={!isPro}
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            <label className={`flex items-center justify-between p-3 bg-zinc-800 rounded ${isPro ? 'cursor-pointer hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
              <div className="flex items-center gap-2">
                <span className="text-amber-50">Auction Unowned Properties</span>
                {!isPro && <Lock className="w-4 h-4 text-amber-600" />}
              </div>
              <input
                type="checkbox"
                checked={config.auctionProperties}
                onChange={(e) =>
                  isPro && setConfig({ ...config, auctionProperties: e.target.checked })
                }
                disabled={!isPro}
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            <label className={`flex items-center justify-between p-3 bg-zinc-800 rounded ${isPro ? 'cursor-pointer hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
              <div className="flex items-center gap-2">
                <span className="text-amber-50">Speed Die Variant</span>
                {!isPro && <Lock className="w-4 h-4 text-amber-600" />}
              </div>
              <input
                type="checkbox"
                checked={config.speedDie}
                onChange={(e) =>
                  isPro && setConfig({ ...config, speedDie: e.target.checked })
                }
                disabled={!isPro}
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30 mb-6">
          <h2 className="text-xl font-bold text-emerald-600 mb-4">
            Money Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded">
              <span className="text-amber-50">Starting Money</span>
              <button
                onClick={() => {
                  setEditingField("startingMoney");
                  setShowNumberPad(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-2 rounded"
              >
                ${config.startingMoney}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded">
              <span className="text-amber-50">Pass GO Amount</span>
              <button
                onClick={() => {
                  setEditingField("passGoAmount");
                  setShowNumberPad(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-2 rounded"
              >
                ${config.passGoAmount}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              await onCreateGame(config);
            } catch (e: any) {
              setError(e?.message || "Failed to create game.");
              console.error("Error in HostSetup onCreateGame:", e);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-lg text-xl transition-colors disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={loading}
        >
          {loading ? "Opening Lobby..." : "Open Game Lobby"}
        </button>
        {error && <div className="text-red-500 text-center mt-2">{error}</div>}

        <NumberPadModal
          isOpen={showNumberPad}
          onClose={() => {
            setShowNumberPad(false);
            setEditingField(null);
          }}
          onConfirm={handleNumberPadConfirm}
          title={
            editingField === "startingMoney"
              ? "Starting Money"
              : "Pass GO Amount"
          }
        />

        {/* Pro Purchase Modal */}
        {showProModal && <ProPurchaseModal onClose={() => setShowProModal(false)} />}
      </div>
    </div>
  );
}
