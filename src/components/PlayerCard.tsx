import React from "react";
import { Crown } from "lucide-react";
import PlayerProperties from "./PlayerProperties";
import { GAME_PIECES, PROPERTIES, BOARD_SPACES } from "../constants/monopolyData";

type Player = {
  id: string | number;
  name: string;
  balance: number;
  properties: any[];
  color: string;
  piece?: any;
  pieceId?: string;
  isPro?: boolean;
  inJail?: boolean;
  getOutOfJailFree?: number;
  position?: number;
};

type PlayerCardProps = {
  player: Player;
  isCurrentUser: boolean;
  showProCrown?: boolean;
  onPayRent: (landlordId: string | number) => void;
  onPayCustom: (toPlayerId: string | number) => void;
  onOpenPayModal: () => void;
  onOpenTrade: () => void;
  onOpenTax: () => void;
  onManageProperty: (propertyName: string) => void;
  onUseJailCard?: () => void;
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentUser,
  showProCrown = false,
  onPayRent,
  onPayCustom,
  onOpenPayModal,
  onOpenTrade,
  onOpenTax,
  onManageProperty,
  onUseJailCard,
}) => {
  const jailBadge = player.inJail ? (
    <span className="ml-2 px-2 py-0.5 rounded bg-red-800 text-red-100 text-xs font-bold">
      JAIL
    </span>
  ) : null;

  const jailCardBadge = (player.getOutOfJailFree || 0) > 0 ? (
    <span
      className="ml-2 px-2 py-0.5 rounded bg-green-700 text-white text-xs font-bold flex items-center gap-1"
      title="Get Out of Jail Free cards"
    >
      🔓 x{player.getOutOfJailFree}
    </span>
  ) : null;

  const piece =
    player.piece || GAME_PIECES.find((p) => p.id === player.pieceId);

  // Get board space info (color and icon)
  const getBoardSpaceInfo = (position: number): { color: string; icon?: string } => {
    const spaceName = BOARD_SPACES[position];
    const property = PROPERTIES.find(p => p.name === spaceName);

    if (property) {
      return { color: property.color };
    }

    // Special spaces with icons
    if (position === 0) return { color: "bg-green-600", icon: "/images/Go.svg" }; // GO
    if (position === 10) return { color: "bg-orange-500", icon: "/images/Just_Visiting.svg" }; // Just Visiting
    if (position === 20) return { color: "bg-red-600", icon: "/images/Free_Parking.svg" }; // Free Parking
    if (position === 30) return { color: "bg-red-700", icon: "/images/Jail.svg" }; // Go To Jail
    if (spaceName === "Income Tax" || spaceName === "Luxury Tax") return { color: "bg-yellow-600" };
    if (spaceName === "Chance") return { color: "bg-orange-600" };
    if (spaceName === "Community Chest") return { color: "bg-blue-600" };

    return { color: "bg-gray-600" }; // Default
  };

  // Calculate net worth (same logic as win probability)
  const calculateNetWorth = () => {
    const cash = player.balance || 0;

    const propertyValue = player.properties.reduce((total, prop) => {
      const propertyData = PROPERTIES.find(p => p.name === prop.name);
      if (!propertyData) return total;

      // Properties worth 50% of price (mortgage value)
      let value = propertyData.price * 0.5;

      if (prop.mortgaged) {
        value = 0; // Mortgaged properties have no immediate value
      } else {
        // Add building value at 50% (sell back price)
        if (prop.hotel) {
          value += 125;
        } else {
          value += (prop.houses || 0) * 25;
        }
      }

      return total + value;
    }, 0);

    return cash + propertyValue;
  };

  const netWorth = calculateNetWorth();

  return (
    <div
      className={`relative bg-zinc-900 rounded-lg p-4 border-2 transition-all flex flex-col gap-3 ${
        isCurrentUser ? "border-amber-600" : "border-amber-900/30"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 ${player.color} rounded flex items-center justify-center p-1`}
          >
            {piece ? (
              <img
                src={piece.icon}
                alt={piece.name}
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-50 text-center flex items-center flex-wrap gap-2">
              {player.name}
              {showProCrown && (
                <Crown className="w-5 h-5 text-amber-500" />
              )}
              {jailBadge}
              {jailCardBadge}
            </h3>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-green-400">
                  ${player.balance.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-400">
                  (${netWorth.toLocaleString()} net)
                </div>
              </div>
              {player.position !== undefined && (() => {
                const spaceInfo = getBoardSpaceInfo(player.position);
                return (
                  <div className="flex items-center gap-1.5 mt-1">
                    {spaceInfo.icon ? (
                      <img src={spaceInfo.icon} alt="Space" className="w-4 h-4" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${spaceInfo.color} border border-white/30`} />
                    )}
                    <span className="text-xs text-amber-50 font-semibold">
                      {BOARD_SPACES[player.position] || `Space ${player.position}`}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        <div>
          {!isCurrentUser && (
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs sm:w-60 ml-auto bg-zinc-800/70 rounded-lg p-2 border border-amber-900/30">
              <button
                onClick={() => onPayRent(player.id)}
                disabled={player.properties.length === 0}
                className="w-full h-12 bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-3 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <img
                  src="/images/property.svg"
                  alt="Pay Rent"
                  className="w-6 h-6"
                />
                Pay Rent
              </button>
              <button
                onClick={() => onPayCustom(player.id)}
                className="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white px-3 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <img src="/images/Payment.svg" alt="Pay" className="w-6 h-6" />
                Pay
              </button>
            </div>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {player.inJail && (player.getOutOfJailFree || 0) > 0 && onUseJailCard && (
            <button
              onClick={onUseJailCard}
              className="w-auto h-11 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1 animate-pulse"
            >
              🔓 Use Jail Card
            </button>
          )}

          <button
            onClick={onOpenPayModal}
            className="w-auto h-11 bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
          >
            <img src="/images/Payment.svg" alt="Pay" className="w-auto h-12" />
            Pay
          </button>

          <button
            onClick={onOpenTrade}
            className="w-auto h-11 bg-blue-400 hover:bg-blue-400 text-black px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
          >
            <img src="/images/Trade.svg" alt="Trade" className="w-auto h-12" />
            Trade
          </button>

          <button
            onClick={onOpenTax}
            className="w-auto h-11 bg-amber-300 hover:bg-amber-600 content-center text-black px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
          >
            <img
              src="/images/Luxury_Tax.svg"
              alt="Fee"
              className="w-auto h-12"
            />
            Pay Fee
          </button>
        </div>
      )}

      <PlayerProperties
        properties={player.properties}
        isCurrentUser={isCurrentUser}
        onManage={onManageProperty}
      />
      {isCurrentUser && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-600 text-black font-bold text-xs">
          You
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
