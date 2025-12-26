import React from "react";
import { Gavel } from "lucide-react";

type ProFeaturesRowProps = {
  freeParkingEnabled: boolean;
  freeParkingBalance: number;
  showAuction: boolean;
  onOpenAuctionSelector: () => void;
};

const ProFeaturesRow: React.FC<ProFeaturesRowProps> = ({
  freeParkingEnabled,
  freeParkingBalance,
  showAuction,
  onOpenAuctionSelector,
}) => {
  return (
    <div className="flex justify-center gap-3 mb-3 flex-wrap">
      {freeParkingEnabled && (
        <div className="bg-green-900/30 border-2 border-green-600 rounded-3xl px-4 py-2 drop-shadow-[0_0_10px_green]">
          <div className="text-center">
            <div className="text-xs text-green-400 font-bold">FREE PARKING</div>
            <div className="text-2xl font-bold text-green-300">
              ${freeParkingBalance.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {showAuction && (
        <div className="bg-purple-900/30 border-2 border-purple-600 drop-shadow-[0_0_10px_purple] rounded-3xl px-4 py-2">
          <div className="text-center">
            <div className="text-xs text-purple-400 font-bold">
              PROPERTY AUCTION
            </div>
            <div className="text-sm text-purple-300 mt-1 mb-2">
              Start an auction
            </div>
            <button
              onClick={onOpenAuctionSelector}
              className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-xs transition-colors flex items-center gap-1 mx-auto"
            >
              <Gavel className="w-4 h-4" />
              Start Auction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProFeaturesRow;
