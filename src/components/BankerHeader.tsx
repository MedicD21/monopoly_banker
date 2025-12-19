import React from "react";
import { RotateCcw, Clock } from "lucide-react";

type Props = {
  onResetClick: () => void;
  onHistoryClick: () => void;
  isMultiplayer: boolean;
  roomCode?: string;
  activePlayerName?: string;
  testAI: () => void;
};

const BankerHeader: React.FC<Props> = ({
  onResetClick,
  onHistoryClick,
  isMultiplayer,
  roomCode,
  activePlayerName,
  testAI,
}) => {
  return (
    <>
      <div className="relative flex-col flex items-center justify-center ">
        <div className=" relative flex items-center justify-center">
          <h1 className="text-3xl drop-shadow-[0_0_10px_gold] font-bold text-amber-400 drop-shadow-lg mt-3 text-center">
            DIGITAL BANKER
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onResetClick}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/100 text-amber-400"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={onHistoryClick}
            className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-400 text-black"
          >
            <Clock className="w-4 h-4" />
            History
          </button>
          <button
            onClick={testAI}
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-blue-500 text-white"
          >
            🤖 Test AI
          </button>
        </div>
      </div>

      {isMultiplayer && roomCode && (
        <div className="text-center text-xs text-amber-600 mb-2 mt-1">
          Room Code:{" "}
          <span className="font-bold text-amber-500">{roomCode}</span>
        </div>
      )}
      {!isMultiplayer && activePlayerName && (
        <div className="text-center text-sm text-amber-300 mb-2 flex items-center justify-center gap-2">
          <span>
            Turn:{" "}
            <span className="font-bold text-amber-100">{activePlayerName}</span>
          </span>
        </div>
      )}
    </>
  );
};

export default BankerHeader;
