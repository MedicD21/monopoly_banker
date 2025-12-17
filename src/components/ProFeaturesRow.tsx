import React from "react";
import { Gavel } from "lucide-react";

type ProFeaturesRowProps = {
  freeParkingEnabled: boolean;
  freeParkingBalance: number;
  onClaimFreeParking: () => void;
  showAuction: boolean;
  onOpenAuctionSelector: () => void;
  doubleGoOnLanding: boolean;
  passGoAmount: number;
  onLandOnGoBonus: () => void;
};

const ProFeaturesRow: React.FC<ProFeaturesRowProps> = ({
  freeParkingEnabled,
  freeParkingBalance,
  onClaimFreeParking,
  showAuction,
  onOpenAuctionSelector,
  doubleGoOnLanding,
  passGoAmount,
  onLandOnGoBonus,
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
            <button
              onClick={onClaimFreeParking}
              disabled={freeParkingBalance <= 0}
              className="mt-2 bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
            >
              Claim Money
            </button>
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

      {doubleGoOnLanding && (
        <div className="bg-amber-900/30 border-2 border-amber-600 drop-shadow-[0_0_10px_amber] rounded-3xl px-4 py-2">
          <div className="text-center">
            <div className="text-xs text-amber-400 font-bold">
              LAND ON GO BONUS
            </div>
            <div className="text-sm text-amber-200 mt-1 mb-2">
              Award double payout for landing directly on GO ($
              {(passGoAmount * 2).toLocaleString()})
            </div>
            <button
              onClick={onLandOnGoBonus}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-1 px-3 rounded text-xs transition-colors flex items-center gap-1 mx-auto"
            >
              <img src="/images/Go.svg" alt="GO" className="w-6 h-6 -ml-1" />
              Landed on GO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProFeaturesRow;
