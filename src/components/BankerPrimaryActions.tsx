import React, { useState } from "react";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  TrendingUp,
} from "lucide-react";
import { Player } from "../types/game";
import { calculateWinProbabilities } from "../utils/winProbability";

type LastRoll = {
  d1: number;
  d2: number;
  d3?: number | null;
  total: number;
  isDoubles: boolean;
} | null;

type Props = {
  lastRoll: LastRoll;
  diceRolling: boolean;
  showOverlay: boolean;
  onRoll: () => void;
  onTellerPays: () => void;
  onDrawChance: () => void;
  onDrawCommunity: () => void;
  players: Player[];
  isPro?: boolean;
};

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1];
  return <Icon className="w-10 h-10" />;
};

const BankerPrimaryActions: React.FC<Props> = ({
  onTellerPays,
  onDrawChance,
  onDrawCommunity,
  lastRoll,
  diceRolling,
  showOverlay,
  onRoll,
  players,
  isPro = false,
}) => {
  const [showWinPercentages, setShowWinPercentages] = useState(false);
  const winProbabilities = calculateWinProbabilities(players);

  return (
    <>
      {/* Chance / Community Chest */}
      <div className="flex gap-2 flex-wrap justify-center w-full mb-2">
        <button
          onClick={onDrawChance}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-sm font-bold py-1.5 px-3 rounded-3xl transition-colors flex items-center justify-center gap-1.5 border-2 border-orange-400"
        >
          <img src="/images/Chance.svg" alt="Chance" className="w-auto h-12" />
          Chance
        </button>

        <button
          onClick={onDrawCommunity}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-black text-sm font-bold py-1.5 px-3 rounded-3xl transition-colors flex items-center justify-center gap-1.5 border-2 border-blue-400"
        >
          <img
            src="/images/Community_Chest.svg"
            alt="Community Chest"
            className="w-auto h-12"
          />
          Community Chest
        </button>
      </div>

      {/* Teller Pays above Roll Dice */}
      <div className="w-full mb-1">
        <button
          onClick={onTellerPays}
          className="w-full bg-green-600 hover:bg-green-400 text-black text-lg rounded-3xl font-bold transition-colors flex items-center justify-center mb-2"
        >
          <img
            src="/images/Banker.svg"
            alt="Banker"
            className="w-auto h-16 flex drop-shadow-[0_0_3px_white] shadow-2xl"
          />
          Teller Pays
        </button>

        <div className="w-full">
          <button
            onClick={onRoll}
            disabled={diceRolling}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 py-3 rounded-3xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Dice6 className="w-auto h-10 animate-bounce ease-in-out duration-500 fill-gray-300" />
            {diceRolling ? "Rolling..." : "Roll Dice"}
            <Dice6 className="w-auto h-10 animate-bounce fill-gray-300" />
          </button>

          {lastRoll && (
            <div className="mt-3 bg-zinc-800 p-3 rounded-lg border border-amber-900/30 text-center">
              <div className="flex justify-center gap-3 mb-2">
                {[lastRoll.d1, lastRoll.d2, lastRoll.d3]
                  .filter((d) => d !== null && d !== undefined)
                  .map((die, idx) => {
                    if (!die) return null;
                    const DiceIconComponent = [
                      Dice1,
                      Dice2,
                      Dice3,
                      Dice4,
                      Dice5,
                      Dice6,
                    ][die - 1];
                    return (
                      <DiceIconComponent
                        key={idx}
                        className={`w-10 h-10  ${
                          idx === 2 ? "text-blue-400" : "text-amber-400"
                        }`}
                      />
                    );
                  })}
              </div>
              <p className="text-xl font-bold text-amber-400 animate-pulse">
                Total: {lastRoll.total}
              </p>
              {lastRoll.isDoubles && (
                <p className="text-green-400 text-sm mt-1">Doubles!</p>
              )}
            </div>
          )}

          {/* Win Probability Toggle */}
          <button
            onClick={() => {
              if (isPro) {
                setShowWinPercentages(!showWinPercentages);
              }
            }}
            className={`w-full mt-2 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 border ${
              isPro
                ? "bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-amber-900/30"
                : "bg-zinc-800/50 text-zinc-500 border-zinc-700 cursor-not-allowed"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {isPro ? (
              <>{showWinPercentages ? "Hide" : "Show"} Win Probabilities</>
            ) : (
              <>
                <span>Win Probabilities</span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold">
                  PRO
                </span>
              </>
            )}
          </button>

          {/* Win Percentages Display */}
          {showWinPercentages && isPro && (
            <div className="mt-2 bg-zinc-800 p-3 rounded-lg border border-amber-900/30">
              <h3 className="text-amber-400 font-bold text-sm mb-2 text-center">
                Win Probabilities
              </h3>
              <div className="space-y-2">
                {winProbabilities.map((prob, index) => {
                  const player = players.find((p) => p.id === prob.playerId);
                  const isLeading = index === 0;

                  return (
                    <div
                      key={prob.playerId}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          player?.color || "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              isLeading ? "text-green-400" : "text-amber-50"
                            }`}
                          >
                            {prob.playerName}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isLeading ? "text-green-400" : "text-amber-400"
                            }`}
                          >
                            {prob.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              isLeading ? "bg-green-500" : "bg-amber-600"
                            } transition-all duration-500`}
                            style={{ width: `${prob.percentage}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Net Worth: ${prob.netWorth.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showOverlay && lastRoll && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-4 sm:p-8">
            <div className="flex gap-3 sm:gap-6 items-center justify-center text-amber-400">
              <DiceIcon value={lastRoll.d1} />
              <div className="text-2xl sm:text-4xl font-bold">+</div>
              <DiceIcon value={lastRoll.d2} />
              {lastRoll.d3 && (
                <>
                  <div className="text-2xl sm:text-4xl font-bold">+</div>
                  <div className="relative">
                    <DiceIcon value={lastRoll.d3} />
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded">
                      Speed
                    </div>
                  </div>
                </>
              )}
              <div className="text-2xl sm:text-4xl font-bold">=</div>
              <div className="text-3xl sm:text-5xl font-bold text-amber-400">
                {lastRoll.total}
              </div>
            </div>
            {lastRoll.isDoubles && !diceRolling && (
              <div className="text-lg sm:text-2xl font-bold text-center mt-2 sm:mt-4 text-amber-400 animate-pulse">
                DOUBLES!
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BankerPrimaryActions;
