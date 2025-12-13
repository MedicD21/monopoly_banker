import React, { useState, useEffect } from 'react';
import { X, ArrowRight, RefreshCw } from 'lucide-react';
import { TradeOffer } from '../types/game';

interface Property {
  name: string;
  houses: number;
  hotel: boolean;
  mortgaged?: boolean;
}

interface Player {
  id: number | string;
  name: string;
  balance: number;
  color: string;
  piece?: { name: string; icon: string };
  pieceId?: string;
  properties: Property[];
}

interface TradeOfferModalProps {
  isOpen: boolean;
  tradeOffer: TradeOffer;
  fromPlayer: Player;
  toPlayer: Player;
  currentPlayerId: string | number;
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: (
    offerMoney: number,
    offerProperties: string[],
    requestMoney: number,
    requestProperties: string[]
  ) => void;
}

export default function TradeOfferModal({
  isOpen,
  tradeOffer,
  fromPlayer,
  toPlayer,
  currentPlayerId,
  onAccept,
  onReject,
  onCounterOffer,
}: TradeOfferModalProps) {
  // Initialize state with the current offer
  const [offerMoney, setOfferMoney] = useState(tradeOffer.offerMoney.toString());
  const [requestMoney, setRequestMoney] = useState(tradeOffer.requestMoney.toString());
  const [offerProperties, setOfferProperties] = useState<string[]>(tradeOffer.offerProperties);
  const [requestProperties, setRequestProperties] = useState<string[]>(tradeOffer.requestProperties);

  // Reset state when trade offer changes
  useEffect(() => {
    setOfferMoney(tradeOffer.offerMoney.toString());
    setRequestMoney(tradeOffer.requestMoney.toString());
    setOfferProperties(tradeOffer.offerProperties);
    setRequestProperties(tradeOffer.requestProperties);
  }, [tradeOffer]);

  if (!isOpen) return null;

  const isRecipient = String(currentPlayerId) === String(tradeOffer.toPlayerId);
  const isInitiator = String(currentPlayerId) === String(tradeOffer.fromPlayerId);

  // Check if any changes were made
  const hasChanges =
    offerMoney !== tradeOffer.offerMoney.toString() ||
    requestMoney !== tradeOffer.requestMoney.toString() ||
    JSON.stringify(offerProperties.sort()) !== JSON.stringify(tradeOffer.offerProperties.sort()) ||
    JSON.stringify(requestProperties.sort()) !== JSON.stringify(tradeOffer.requestProperties.sort());

  const toggleOfferProperty = (propertyName: string) => {
    setOfferProperties((prev) =>
      prev.includes(propertyName)
        ? prev.filter((p) => p !== propertyName)
        : [...prev, propertyName]
    );
  };

  const toggleRequestProperty = (propertyName: string) => {
    setRequestProperties((prev) =>
      prev.includes(propertyName)
        ? prev.filter((p) => p !== propertyName)
        : [...prev, propertyName]
    );
  };

  const handleCounterOffer = () => {
    const offerMoneyNum = parseInt(offerMoney) || 0;
    const requestMoneyNum = parseInt(requestMoney) || 0;

    if (offerMoneyNum < 0 || requestMoneyNum < 0) {
      alert('Money amounts cannot be negative');
      return;
    }

    // Note: When countering, the values flip perspective
    // What you're changing becomes the new offer from you to them
    onCounterOffer(
      requestMoneyNum, // What they give (from their perspective)
      requestProperties,
      offerMoneyNum, // What you give (from their perspective)
      offerProperties
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-amber-400">
              {isRecipient ? 'Trade Offer Received' : 'Trade Offer Sent'}
            </h3>
            {tradeOffer.isCounterOffer && (
              <p className="text-sm text-orange-400 flex items-center gap-1 mt-1">
                <RefreshCw className="w-4 h-4" />
                Counter Offer
              </p>
            )}
          </div>
          {!isRecipient && (
            <button onClick={onReject} className="text-amber-400 hover:text-amber-300">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="bg-zinc-800 p-3 rounded mb-4 border border-amber-900/30">
          <p className="text-amber-100 text-center">
            <span className="font-bold text-amber-400">{fromPlayer.name}</span>
            <ArrowRight className="inline w-5 h-5 mx-2" />
            <span className="font-bold text-green-400">{toPlayer.name}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* What fromPlayer gives */}
          <div className="bg-zinc-800 p-4 rounded border border-amber-900/30">
            <h4 className="font-bold text-amber-400 mb-3">{fromPlayer.name} Gives</h4>

            {/* Money */}
            <div className="mb-3">
              <label className="text-amber-100 text-sm mb-1 block">Money</label>
              {isRecipient ? (
                <input
                  type="number"
                  value={offerMoney}
                  onChange={(e) => setOfferMoney(e.target.value)}
                  className="w-full bg-zinc-900 text-amber-50 border border-amber-900/30 rounded px-3 py-2"
                  min="0"
                  max={fromPlayer.balance}
                />
              ) : (
                <div className="text-2xl font-bold text-amber-400">
                  ${parseInt(offerMoney || '0').toLocaleString()}
                </div>
              )}
            </div>

            {/* Properties */}
            <div>
              <label className="text-amber-100 text-sm mb-1 block">Properties</label>
              {fromPlayer.properties.length === 0 ? (
                <p className="text-amber-600 text-sm">No properties</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {fromPlayer.properties.map((prop) => {
                    const isOffered = offerProperties.includes(prop.name);
                    const isDisabled = prop.houses > 0 || prop.hotel || prop.mortgaged;

                    return (
                      <button
                        key={prop.name}
                        onClick={() => isRecipient && !isDisabled && toggleOfferProperty(prop.name)}
                        disabled={!isRecipient || isDisabled}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isOffered
                            ? 'bg-amber-700 text-white'
                            : isDisabled
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                            : isRecipient
                            ? 'bg-zinc-900 text-amber-100 hover:bg-zinc-800'
                            : 'bg-zinc-900 text-amber-100'
                        }`}
                      >
                        {prop.name}
                        {(prop.houses > 0 || prop.hotel) && <span className="text-xs ml-1">(has buildings)</span>}
                        {prop.mortgaged && <span className="text-xs ml-1">(mortgaged)</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* What toPlayer gives */}
          <div className="bg-zinc-800 p-4 rounded border border-amber-900/30">
            <h4 className="font-bold text-green-400 mb-3">{toPlayer.name} Gives</h4>

            {/* Money */}
            <div className="mb-3">
              <label className="text-amber-100 text-sm mb-1 block">Money</label>
              {isRecipient ? (
                <input
                  type="number"
                  value={requestMoney}
                  onChange={(e) => setRequestMoney(e.target.value)}
                  className="w-full bg-zinc-900 text-amber-50 border border-amber-900/30 rounded px-3 py-2"
                  min="0"
                  max={toPlayer.balance}
                />
              ) : (
                <div className="text-2xl font-bold text-green-400">
                  ${parseInt(requestMoney || '0').toLocaleString()}
                </div>
              )}
            </div>

            {/* Properties */}
            <div>
              <label className="text-amber-100 text-sm mb-1 block">Properties</label>
              {toPlayer.properties.length === 0 ? (
                <p className="text-amber-600 text-sm">No properties</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {toPlayer.properties.map((prop) => {
                    const isRequested = requestProperties.includes(prop.name);
                    const isDisabled = prop.houses > 0 || prop.hotel || prop.mortgaged;

                    return (
                      <button
                        key={prop.name}
                        onClick={() => isRecipient && !isDisabled && toggleRequestProperty(prop.name)}
                        disabled={!isRecipient || isDisabled}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isRequested
                            ? 'bg-green-700 text-white'
                            : isDisabled
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                            : isRecipient
                            ? 'bg-zinc-900 text-amber-100 hover:bg-zinc-800'
                            : 'bg-zinc-900 text-amber-100'
                        }`}
                      >
                        {prop.name}
                        {(prop.houses > 0 || prop.hotel) && <span className="text-xs ml-1">(has buildings)</span>}
                        {prop.mortgaged && <span className="text-xs ml-1">(mortgaged)</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {isRecipient ? (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
            >
              Reject
            </button>
            {hasChanges && (
              <button
                onClick={handleCounterOffer}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Counter Offer
              </button>
            )}
            <button
              onClick={onAccept}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded transition-colors"
            >
              Accept
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-amber-400 mb-3">Waiting for {toPlayer.name} to respond...</p>
            <button
              onClick={onReject}
              className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Cancel Trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
