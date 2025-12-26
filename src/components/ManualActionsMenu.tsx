import React, { useState } from "react";
import { ChevronDown, ChevronUp, Wrench } from "lucide-react";

type ManualActionsMenuProps = {
  onPassGo: () => void;
  onBuyProperty: () => void;
  passGoAmount: number;
};

const ManualActionsMenu: React.FC<ManualActionsMenuProps> = ({
  onPassGo,
  onBuyProperty,
  passGoAmount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2">
      {/* Toggle Button - Compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 font-semibold text-xs">Manual Actions</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </button>

      {/* Expanded Menu - Compact */}
      {isExpanded && (
        <div className="mt-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 space-y-1.5">
          <p className="text-[10px] text-zinc-500 text-center">
            Manual override for edge cases
          </p>

          <div className="flex gap-1.5">
            {/* Pass GO Button */}
            <button
              onClick={onPassGo}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-2 rounded text-xs transition-colors flex items-center gap-1 justify-center"
            >
              <img src="/images/Go.svg" alt="GO" className="w-5 h-5" />
              <span>Pass GO</span>
            </button>

            {/* Buy Property Button */}
            <button
              onClick={onBuyProperty}
              className="flex-1 bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-2 rounded text-xs transition-colors flex items-center gap-1 justify-center"
            >
              <img src="/images/property.svg" alt="Buy" className="w-5 h-5" />
              <span>Buy Property</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualActionsMenu;
