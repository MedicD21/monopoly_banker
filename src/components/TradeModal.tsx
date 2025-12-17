import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GAME_PIECES } from '../types/game';
import NumberPadModal from './NumberPadModal';

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

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  allPlayers: Player[];
  onProposeTrade: (
    toPlayerId: number | string,
    offerMoney: number,
    offerProperties: string[],
    requestMoney: number,
    requestProperties: string[]
  ) => void;
}

export default function TradeModal({
  isOpen,
  onClose,
  currentPlayer,
  allPlayers,
  onProposeTrade,
}: TradeModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | string | null>(null);
  const [offerMoney, setOfferMoney] = useState('0');
  const [requestMoney, setRequestMoney] = useState('0');
  const [offerProperties, setOfferProperties] = useState<string[]>([]);
  const [requestProperties, setRequestProperties] = useState<string[]>([]);
  const [showOfferPad, setShowOfferPad] = useState(false);
  const [showRequestPad, setShowRequestPad] = useState(false);

  if (!isOpen) return null;

  const opponents = allPlayers.filter((p) => p.id !== currentPlayer.id);
  const selectedOpponent = opponents.find((p) => p.id === selectedPlayer);

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

  const handlePropose = () => {
    if (!selectedPlayer) {
      alert('Please select a player to trade with');
      return;
    }

    const offerMoneyNum = parseInt(offerMoney) || 0;
    const requestMoneyNum = parseInt(requestMoney) || 0;

    if (offerMoneyNum < 0 || requestMoneyNum < 0) {
      alert('Money amounts cannot be negative');
      return;
    }

    if (offerMoneyNum > currentPlayer.balance) {
      alert('You cannot offer more money than you have');
      return;
    }

    if (offerProperties.length === 0 && requestProperties.length === 0 && offerMoneyNum === 0 && requestMoneyNum === 0) {
      alert('Trade must include at least something');
      return;
    }

    onProposeTrade(selectedPlayer, offerMoneyNum, offerProperties, requestMoneyNum, requestProperties);

    // Reset form
    setSelectedPlayer(null);
    setOfferMoney('0');
    setRequestMoney('0');
    setOfferProperties([]);
    setRequestProperties([]);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
        <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-amber-400">Propose Trade</h3>
            <button onClick={onClose} className="text-amber-400 hover:text-amber-300">
              <X className="w-6 h-6" />
            </button>
          </div>

        {!selectedPlayer ? (
          <div>
            <p className="text-amber-100 mb-4">Select a player to trade with:</p>
            <div className="space-y-3">
              {opponents.map((player) => {
                const piece = player.piece || GAME_PIECES.find(p => p.id === player.pieceId);
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 border border-amber-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${player.color} rounded flex items-center justify-center p-1`}>
                        {piece && (
                          <img
                            src={piece.icon}
                            alt={piece.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-amber-50">{player.name}</h4>
                        <p className="text-sm text-amber-400">${player.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-zinc-800 p-3 rounded border border-amber-900/30">
              <span className="text-amber-100">Trading with: <span className="font-bold text-amber-400">{selectedOpponent?.name}</span></span>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-amber-600 hover:text-amber-400 text-sm"
              >
                Change
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Your Offer */}
              <div className="bg-zinc-800 p-4 rounded border border-amber-900/30">
                <h4 className="font-bold text-amber-400 mb-3">You Give</h4>

                {/* Offer Money */}
                <div className="mb-3">
                  <label className="text-amber-100 text-sm mb-1 block">Money</label>
                  <input
                    type="text"
                    value={offerMoney}
                    onClick={() => setShowOfferPad(true)}
                    readOnly
                    className="w-full bg-zinc-900 text-amber-50 border border-amber-900/30 rounded px-3 py-2 cursor-pointer"
                  />
                  <p className="text-xs text-amber-600 mt-1">Available: ${currentPlayer.balance.toLocaleString()}</p>
                </div>

                {/* Offer Properties */}
                <div>
                  <label className="text-amber-100 text-sm mb-1 block">Properties</label>
                  {currentPlayer.properties.length === 0 ? (
                    <p className="text-amber-600 text-sm">No properties to offer</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {currentPlayer.properties.map((prop) => (
                        <button
                          key={prop.name}
                          onClick={() => toggleOfferProperty(prop.name)}
                          disabled={prop.houses > 0 || prop.hotel || prop.mortgaged}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            offerProperties.includes(prop.name)
                              ? 'bg-amber-700 text-white'
                              : prop.houses > 0 || prop.hotel || prop.mortgaged
                              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 text-amber-100 hover:bg-zinc-800'
                          }`}
                        >
                          {prop.name}
                          {(prop.houses > 0 || prop.hotel) && <span className="text-xs ml-1">(has buildings)</span>}
                          {prop.mortgaged && <span className="text-xs ml-1">(mortgaged)</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Your Request */}
              <div className="bg-zinc-800 p-4 rounded border border-amber-900/30">
                <h4 className="font-bold text-green-400 mb-3">You Receive</h4>

                {/* Request Money */}
                <div className="mb-3">
                  <label className="text-amber-100 text-sm mb-1 block">Money</label>
                  <input
                    type="text"
                    value={requestMoney}
                    onClick={() => setShowRequestPad(true)}
                    readOnly
                    className="w-full bg-zinc-900 text-amber-50 border border-amber-900/30 rounded px-3 py-2 cursor-pointer"
                  />
                  <p className="text-xs text-amber-600 mt-1">They have: ${selectedOpponent?.balance.toLocaleString()}</p>
                </div>

                {/* Request Properties */}
                <div>
                  <label className="text-amber-100 text-sm mb-1 block">Properties</label>
                  {(selectedOpponent?.properties.length || 0) === 0 ? (
                    <p className="text-amber-600 text-sm">They have no properties</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedOpponent?.properties.map((prop) => (
                        <button
                          key={prop.name}
                          onClick={() => toggleRequestProperty(prop.name)}
                          disabled={prop.houses > 0 || prop.hotel || prop.mortgaged}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            requestProperties.includes(prop.name)
                              ? 'bg-green-700 text-white'
                              : prop.houses > 0 || prop.hotel || prop.mortgaged
                              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 text-amber-100 hover:bg-zinc-800'
                          }`}
                        >
                          {prop.name}
                          {(prop.houses > 0 || prop.hotel) && <span className="text-xs ml-1">(has buildings)</span>}
                          {prop.mortgaged && <span className="text-xs ml-1">(mortgaged)</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedPlayer(null);
                  setOfferMoney('0');
                  setRequestMoney('0');
                  setOfferProperties([]);
                  setRequestProperties([]);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
              >
                Back
              </button>
              <button
                onClick={handlePropose}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded transition-colors"
              >
                Propose Trade
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      <NumberPadModal
        isOpen={showOfferPad}
        onClose={() => setShowOfferPad(false)}
        onConfirm={(val) => setOfferMoney(String(val))}
        title="Offer Money"
        initialValue={offerMoney}
      />
      <NumberPadModal
        isOpen={showRequestPad}
        onClose={() => setShowRequestPad(false)}
        onConfirm={(val) => setRequestMoney(String(val))}
        title="Request Money"
        initialValue={requestMoney}
      />
    </>
  );
}
