import React from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  onResetClick: () => void;
  isMultiplayer: boolean;
  roomCode?: string;
  activePlayerName?: string;
};

const BankerHeader: React.FC<Props> = ({
  onResetClick,
  isMultiplayer,
  roomCode,
  activePlayerName,
}) => {
  return (
    <>
      <div className="relative flex-col flex items-center justify-center ">
        <div className=" relative flex items-center justify-center">
          <h1 className="text-3xl drop-shadow-[0_0_10px_gold] font-bold text-amber-400 drop-shadow-lg mt-3 text-center">
            DIGITAL BANKER
          </h1>
        </div>
        <button
          onClick={onResetClick}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 border border-amber-900/100 text-amber-400"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {isMultiplayer && roomCode && (
        <div className="text-center text-xs text-amber-600 mb-2">
          Room Code: <span className="font-bold text-amber-500">{roomCode}</span>
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
