import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import NumberPadModal from "./NumberPadModal";

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
          <h1 className="text-4xl font-bold text-amber-400 mb-2">Game Setup</h1>
          <p className="text-amber-600">Configure your game settings</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30 mb-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">
            Game Variants
          </h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="text-amber-50">Free Parking Jackpot</span>
              <input
                type="checkbox"
                checked={config.freeParkingJackpot}
                onChange={(e) =>
                  setConfig({ ...config, freeParkingJackpot: e.target.checked })
                }
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="text-amber-50">Double GO on Exact Landing</span>
              <input
                type="checkbox"
                checked={config.doubleGoOnLanding}
                onChange={(e) =>
                  setConfig({ ...config, doubleGoOnLanding: e.target.checked })
                }
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="text-amber-50">Auction Unowned Properties</span>
              <input
                type="checkbox"
                checked={config.auctionProperties}
                onChange={(e) =>
                  setConfig({ ...config, auctionProperties: e.target.checked })
                }
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="text-amber-50">Speed Die Variant</span>
              <input
                type="checkbox"
                checked={config.speedDie}
                onChange={(e) =>
                  setConfig({ ...config, speedDie: e.target.checked })
                }
                className="w-6 h-6 text-amber-600 bg-zinc-700 border-amber-900 rounded focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-amber-900/30 mb-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">
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
                className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded"
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
                className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded"
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
              console.log("Creating game with config:", config);
              await onCreateGame(config);
              console.log("Game creation triggered");
            } catch (e: any) {
              setError(e?.message || "Failed to create game.");
              console.error("Error in HostSetup onCreateGame:", e);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 rounded-lg text-xl transition-colors disabled:bg-zinc-700 disabled:text-zinc-400"
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
      </div>
    </div>
  );
}
