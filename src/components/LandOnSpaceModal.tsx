import React from "react";
import { X } from "lucide-react";

type Property = {
  name: string;
  price: number;
  rent: number[];
  color: string;
  group: string;
};

type LandOnSpaceModalProps = {
  spaceName: string;
  property: Property | null;
  owner: { id: string | number; name: string } | null;
  isOwnProperty: boolean;
  playerBalance: number;
  auctionEnabled: boolean;
  chanceEffect?: 'doubleRailroad' | 'utilityDice';
  onBuy: () => void;
  onPass: () => void;
  onAuction?: () => void;
  onPayRent: () => void;
  onPayTax?: (amount: number, taxType: string) => void;
  onClose: () => void;
};

const LandOnSpaceModal: React.FC<LandOnSpaceModalProps> = ({
  spaceName,
  property,
  owner,
  isOwnProperty,
  playerBalance,
  auctionEnabled,
  chanceEffect,
  onBuy,
  onPass,
  onAuction,
  onPayRent,
  onPayTax,
  onClose,
}) => {
  // Tax spaces
  const isTaxSpace = spaceName === "Income Tax" || spaceName === "Luxury Tax";
  const taxAmount = spaceName === "Income Tax" ? 200 : spaceName === "Luxury Tax" ? 100 : 0;
  const canAffordTax = playerBalance >= taxAmount;

  if (isTaxSpace && onPayTax) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-yellow-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">
              {spaceName}
            </h2>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <img
              src={`/images/${spaceName.replace(" ", "_")}.svg`}
              alt={spaceName}
              className="w-32 h-32"
            />
          </div>

          <div className="bg-zinc-800 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Tax Amount:</span>
              <span className="text-yellow-400 font-bold">
                ${taxAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Your Balance:</span>
              <span className={`font-bold ${canAffordTax ? "text-green-400" : "text-red-400"}`}>
                ${playerBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {!canAffordTax && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">
                ⚠️ You don't have enough money to pay this tax
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onPayTax(taxAmount, spaceName);
                onClose();
              }}
              disabled={!canAffordTax}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors"
            >
              Pay Tax
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Special spaces (not properties)
  if (!property) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-amber-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-400">
              Landed on {spaceName}
            </h2>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-amber-50 text-center mb-4">
            This is a special space. Follow the board instructions.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Player owns this property
  if (isOwnProperty) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-green-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-400">Your Property</h2>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className={`${property.color} rounded-lg p-4 mb-4`}>
            <h3 className="text-xl font-bold text-center text-white">
              {property.name}
            </h3>
          </div>
          <p className="text-amber-50 text-center mb-4">
            You landed on your own property!
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Someone else owns this property
  if (owner) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-red-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-400">Pay Rent</h2>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className={`${property.color} rounded-lg p-4 mb-4`}>
            <h3 className="text-xl font-bold text-center text-white">
              {property.name}
            </h3>
          </div>
          <div className="text-center mb-4">
            <p className="text-amber-50 mb-2">
              Owned by <span className="font-bold text-amber-400">{owner.name}</span>
            </p>
            {property.rent && property.rent.length > 0 && (
              <p className="text-sm text-zinc-400">
                Base rent: ${property.rent[0].toLocaleString()}
              </p>
            )}
          </div>

          {/* Chance Card Special Rent Warning */}
          {chanceEffect === 'doubleRailroad' && property.group === 'railroad' && (
            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-3 mb-4">
              <p className="text-orange-400 text-sm text-center font-bold">
                ⚠️ Chance Card: Pay DOUBLE railroad rent!
              </p>
            </div>
          )}
          {chanceEffect === 'utilityDice' && property.group === 'utility' && (
            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-3 mb-4">
              <p className="text-orange-400 text-sm text-center font-bold">
                ⚠️ Chance Card: Dice will be rolled and you pay 10x the result!
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPayRent}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Pay Rent
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Property is available for purchase
  const canAfford = playerBalance >= property.price;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">
            Property Available
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={`${property.color} rounded-lg p-4 mb-4`}>
          <h3 className="text-xl font-bold text-center text-white">
            {property.name}
          </h3>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400">Price:</span>
            <span className="text-amber-400 font-bold">
              ${property.price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400">Your Balance:</span>
            <span className={`font-bold ${canAfford ? "text-green-400" : "text-red-400"}`}>
              ${playerBalance.toLocaleString()}
            </span>
          </div>
          {property.rent && property.rent.length > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Base Rent:</span>
              <span className="text-amber-50 font-bold">
                ${property.rent[0].toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {!canAfford && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm text-center">
              ⚠️ You don't have enough money to buy this property
            </p>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            Buy for ${property.price.toLocaleString()}
          </button>

          {auctionEnabled && onAuction && (
            <button
              onClick={onAuction}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Start Auction
            </button>
          )}

          <button
            onClick={onPass}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandOnSpaceModal;
