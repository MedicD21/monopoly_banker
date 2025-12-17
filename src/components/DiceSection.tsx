import React from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

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
  compact?: boolean;
};

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1];
  return <Icon className="w-10 h-10" />;
};

const DiceSection: React.FC<Props> = ({
  lastRoll,
  diceRolling,
  showOverlay,
  onRoll,
  compact = false,
}) => {
  const containerClass = compact
    ? "flex-1"
    : "w-full border-t border-green-900 -mt-8";

  return (
    <>
      <div className={containerClass}>
        <button
          onClick={onRoll}
          disabled={diceRolling}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Dice1 className="w-6 h-6" />
          {diceRolling ? "Rolling..." : "Roll Dice"}
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
                      className={`w-10 h-10 ${
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

export default DiceSection;
