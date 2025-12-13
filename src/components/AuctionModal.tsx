import React, { useState, useEffect } from "react";
import { X, Gavel, Clock } from "lucide-react";

interface AuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyPrice: number;
  players: Array<{ id: string; name: string; balance: number }>;
  onAuctionComplete: (winnerId: string, winningBid: number) => void;
}

interface Bid {
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: number;
}

export default function AuctionModal({
  isOpen,
  onClose,
  propertyName,
  propertyPrice,
  players,
  onAuctionComplete,
}: AuctionModalProps) {
  const [countdown, setCountdown] = useState(30); // 30 second countdown
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || "");

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auction ended
          handleAuctionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleAuctionEnd = () => {
    if (bids.length === 0) {
      alert("No bids placed! Property remains unowned.");
      onClose();
      return;
    }

    // Get highest bid
    const highestBid = bids.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max
    , bids[0]);

    onAuctionComplete(highestBid.playerId, highestBid.amount);
    onClose();
  };

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return;

    if (amount > player.balance) {
      alert("Player doesn't have enough money!");
      return;
    }

    // Check if bid is higher than current highest
    const currentHighest = bids.length > 0
      ? Math.max(...bids.map(b => b.amount))
      : 0;

    if (amount <= currentHighest) {
      alert(`Bid must be higher than $${currentHighest.toLocaleString()}`);
      return;
    }

    // Add bid
    setBids([...bids, {
      playerId: selectedPlayerId,
      playerName: player.name,
      amount,
      timestamp: Date.now(),
    }]);

    setBidAmount("");

    // Reset countdown when new bid placed
    setCountdown(15); // Give 15 seconds after each bid
  };

  const handleQuickBid = (increment: number) => {
    const currentHighest = bids.length > 0
      ? Math.max(...bids.map(b => b.amount))
      : 0;
    setBidAmount((currentHighest + increment).toString());
  };

  if (!isOpen) return null;

  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
  const highestBidder = bids.length > 0
    ? bids.find(b => b.amount === highestBid)?.playerName
    : "None";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border-2 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-amber-400">Property Auction</h2>
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
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-red-400" />
            <div className="text-2xl font-bold text-red-400">
              {countdown}s
            </div>
          </div>
          <div className="text-xs text-center text-red-300 mt-1">
            Time Remaining
          </div>
        </div>

        {/* Current Highest Bid */}
        <div className="bg-emerald-900/30 border-2 border-emerald-600 rounded-lg p-3 mb-4">
          <div className="text-xs text-emerald-400 text-center">HIGHEST BID</div>
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
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded transition-colors"
          >
            Place Bid
          </button>
        </div>

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="text-xs text-amber-400 font-bold mb-2">BID HISTORY</div>
            <div className="space-y-1">
              {bids.slice().reverse().map((bid, idx) => (
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
          onClick={handleAuctionEnd}
          disabled={bids.length === 0}
          className="w-full mt-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-2 rounded transition-colors"
        >
          End Auction Now
        </button>
      </div>
    </div>
  );
}
