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
  onTellerPays: () => void;
  onPassGo: () => void;
  onBuyProperty: () => void;
};

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1];
  return <Icon className="w-10 h-10" />;
};

const BankerPrimaryActions: React.FC<Props> = ({
  onTellerPays,
  onPassGo,
  onBuyProperty,
  lastRoll,
  diceRolling,
  showOverlay,
  onRoll,
}) => {
  return (
    <>
      {/* Pass GO / Buy Property */}
      <div className="flex gap-2 flex-wrap justify-center w-full ">
        <button
          onClick={onPassGo}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-2 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <img
            src="/images/Go.svg"
            alt="GO"
            className="w-auto h-20 -mt-3 -mb-3 pointer-events-none "
          />
          Pass GO
        </button>

        <button
          onClick={onBuyProperty}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-2 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <img
            src="/images/property.svg"
            alt="property"
            className="w-auto h-20 pb-1 pt-1 -mt-2 -mb-2 pointer-events-auto"
          />
          Buy Property
        </button>
      </div>

      {/* Teller Pays above Roll Dice */}
      <div className="w-full mb-1">
        <button
          onClick={onTellerPays}
          className="w-full bg-blue-500 hover:bg-blue-200 text-black text-lg rounded-3xl font-bold transition-colors flex items-center justify-center mb-2"
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
            <Dice6 className="w-auto h-10 animate-spin ease-in duration-75 animate-bounce fill-gray-300" />
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
