import React from "react";
import PlayerProperties from "./PlayerProperties";
import { GAME_PIECES } from "../constants/monopolyData";

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
  onReceive: (playerId: string | number) => void;
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
  onReceive,
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

  return (
    <div
      className={`bg-zinc-900 rounded-lg p-4 border-2 transition-all flex flex-col gap-3 ${
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
            <div className="text-2xl font-bold text-green-400">
              ${player.balance.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentUser && (
            <div className="px-4 py-2 rounded font-bold bg-amber-600 text-black">
              You
            </div>
          )}
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
            onClick={() => onReceive(player.id)}
            className="w-auto h-11 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
          >
            <img src="/images/Bank.svg" alt="Bank" className="w-full h-12" />
            Receive
          </button>

          <button
            onClick={onOpenTrade}
            className="w-auto h-11 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
          >
            <img src="/images/Trade.svg" alt="Trade" className="w-auto h-12" />
            Trade
          </button>

          <button
            onClick={onOpenTax}
            className="w-auto h-11 bg-red-700 hover:bg-red-600 content-center text-white px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-1"
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
    </div>
  );
};

export default PlayerCard;
