import React, { useState, useEffect, useRef } from "react";
import { X, Gavel, UserMinus } from "lucide-react";
import { AuctionBid } from "../types/game";

interface AuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyPrice: number;
  players: Array<{ id: string | number; name: string; balance: number }>;
  bids: AuctionBid[];
  dropouts: Array<string | number>;
  currentPlayerId?: string | number | null;
  onPlaceBid: (playerId: string | number, amount: number) => void;
  onAuctionComplete: () => void;
  onDropOut: (playerId: string | number) => void;
}

export default function AuctionModal({
  isOpen,
  onClose,
  propertyName,
  propertyPrice,
  players,
  bids,
  dropouts,
  currentPlayerId,
  onPlaceBid,
  onAuctionComplete,
  onDropOut,
}: AuctionModalProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<
    string | number | undefined
  >(players[0]?.id);
  const [countdown, setCountdown] = useState(30);
  const hasCompletedRef = useRef(false);

  const hasDropped = (playerId: string | number | undefined | null) =>
    dropouts.some((d) => String(d) === String(playerId ?? ""));

  useEffect(() => {
    if (currentPlayerId !== undefined && currentPlayerId !== null) {
      setSelectedPlayerId(currentPlayerId);
    } else if (players[0]) {
      setSelectedPlayerId(players[0].id);
    }
  }, [currentPlayerId, players]);

  // Reset countdown when modal opens or property changes
  useEffect(() => {
    if (isOpen) {
      setCountdown(30);
      hasCompletedRef.current = false;
    }
  }, [isOpen, propertyName]);

  // Reset countdown to 15 seconds on each new bid
  useEffect(() => {
    if (isOpen && bids.length > 0) {
      setCountdown(15);
      hasCompletedRef.current = false;
    }
  }, [bids, isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onAuctionComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isOpen, onAuctionComplete]);

  if (!isOpen) return null;

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    if (hasDropped(selectedPlayerId)) {
      alert("This player has dropped out of the auction.");
      return;
    }

    if (amount > player.balance) {
      alert("Player doesn't have enough money!");
      return;
    }

    const currentHighest =
      bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;

    if (amount <= currentHighest) {
      alert(`Bid must be higher than $${currentHighest.toLocaleString()}`);
      return;
    }

    onPlaceBid(selectedPlayerId, amount);

    setBidAmount("");
  };

  const handleQuickBid = (increment: number) => {
    const currentHighest =
      bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;
    setBidAmount((currentHighest + increment).toString());
  };

  const highestBid =
    bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;
  const highestBidder =
    bids.length > 0
      ? bids.find((b) => b.amount === highestBid)?.playerName
      : "None";
  const currentPlayerDropped =
    currentPlayerId !== undefined && currentPlayerId !== null
      ? hasDropped(currentPlayerId)
      : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border-2 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-amber-400">
              Property Auction
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Property Info */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <div className="text-amber-300 font-bold text-lg">{propertyName}</div>
          <div className="text-zinc-400 text-sm">
            List Price: ${propertyPrice.toLocaleString()}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center gap-2 text-red-200">
            <span className="text-xs uppercase tracking-wide">
              Time Remaining
            </span>
            <span className="text-2xl font-bold text-red-300">
              {countdown}s
            </span>
          </div>
          <div className="text-xs text-center text-red-300 mt-1">
            Bids add 15s. Auction ends at zero or via End button.
          </div>
        </div>

        {/* Current Highest Bid */}
        <div className="bg-emerald-900/30 border-2 border-emerald-600 rounded-lg p-3 mb-4">
          <div className="text-xs text-emerald-400 text-center">
            HIGHEST BID
          </div>
          <div className="text-2xl font-bold text-emerald-300 text-center">
            ${highestBid.toLocaleString()}
          </div>
          <div className="text-sm text-emerald-400 text-center">
            {highestBidder}
          </div>
        </div>

        {/* Bidding Controls */}
        <div className="mb-4">
          <label className="block text-amber-300 text-sm font-bold mb-2">
            Select Player
          </label>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full bg-zinc-800 border border-amber-600 text-amber-50 rounded px-3 py-2 mb-3"
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} (${player.balance.toLocaleString()})
              </option>
            ))}
          </select>

          <label className="block text-amber-300 text-sm font-bold mb-2">
            Bid Amount
          </label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-amber-600 text-amber-50 rounded px-3 py-2 mb-3"
            placeholder="Enter bid amount"
          />

          {/* Quick Bid Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => handleQuickBid(10)}
              className="bg-zinc-700 hover:bg-zinc-600 text-amber-300 font-bold py-2 rounded text-sm"
            >
              +$10
            </button>
            <button
              onClick={() => handleQuickBid(50)}
              className="bg-zinc-700 hover:bg-zinc-600 text-amber-300 font-bold py-2 rounded text-sm"
            >
              +$50
            </button>
            <button
              onClick={() => handleQuickBid(100)}
              className="bg-zinc-700 hover:bg-zinc-600 text-amber-300 font-bold py-2 rounded text-sm"
            >
              +$100
            </button>
          </div>

          <button
            onClick={handlePlaceBid}
            disabled={
              !selectedPlayerId ||
              currentPlayerDropped ||
              hasDropped(selectedPlayerId)
            }
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded transition-colors"
          >
            Place Bid
          </button>

          <button
            onClick={() =>
              currentPlayerId != null && onDropOut(currentPlayerId)
            }
            disabled={!currentPlayerId || currentPlayerDropped}
            className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-amber-300 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <UserMinus className="w-4 h-4" />
            Drop Out
          </button>
          {currentPlayerDropped && (
            <div className="text-xs text-center text-red-300 mt-1">
              You have dropped out of this auction.
            </div>
          )}
        </div>

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="text-xs text-amber-400 font-bold mb-2">
              BID HISTORY
            </div>
            <div className="space-y-1">
              {bids
                .slice()
                .reverse()
                .map((bid, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-zinc-300 flex justify-between"
                  >
                    <span>{bid.playerName}</span>
                    <span className="text-emerald-400 font-bold">
                      ${bid.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Manual End Auction Button */}
        <button
          onClick={() => {
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              onAuctionComplete();
            }
          }}
          disabled={bids.length === 0}
          className="w-full mt-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-2 rounded transition-colors"
        >
          End Auction Now
        </button>
      </div>
    </div>
  );
}
