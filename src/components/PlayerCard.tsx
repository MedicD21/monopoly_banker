import React from "react";
import PlayerProperties from "./PlayerProperties";
import { GAME_PIECES, PROPERTIES } from "../constants/monopolyData";

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
};

type PlayerCardProps = {
  player: Player;
  isCurrentUser: boolean;
  onPayRent: (landlordId: string | number) => void;
  onPayCustom: (toPlayerId: string | number) => void;
  onOpenPayModal: () => void;
  onOpenTrade: () => void;
  onOpenTax: () => void;
  onManageProperty: (propertyName: string) => void;
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentUser,
  onPayRent,
  onPayCustom,
  onOpenPayModal,
  onOpenTrade,
  onOpenTax,
  onManageProperty,
}) => {
  const jailBadge = player.inJail ? (
    <span className="ml-2 px-2 py-0.5 rounded bg-red-800 text-red-100 text-xs font-bold">
      JAIL
    </span>
  ) : null;

  const piece =
    player.piece || GAME_PIECES.find((p) => p.id === player.pieceId);

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
            <h3 className="text-xl font-bold text-amber-50 text-center flex items-center gap-2">
              {player.name}
              {player.isPro && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold shadow-lg">
                  PRO
                </span>
              )}
              {jailBadge}
            </h3>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-400">
                ${player.balance.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-400">
                (${netWorth.toLocaleString()} net)
              </div>
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
              alt="Tax"
              className="w-auto h-12"
            />
            Pay Tax
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
