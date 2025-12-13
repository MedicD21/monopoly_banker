import React from 'react';
import { X, Clock } from 'lucide-react';
import { HistoryEntry } from '../types/game';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
}

export default function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dice':
        return 'text-blue-400';
      case 'transaction':
        return 'text-red-400';
      case 'property':
        return 'text-purple-400';
      case 'passGo':
        return 'text-green-400';
      case 'auction':
        return 'text-amber-400';
      case 'tax':
        return 'text-orange-400';
      case 'freeParking':
        return 'text-cyan-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] border-2 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-amber-400">Game History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-black rounded-lg p-4 max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No history yet. Start playing to see game events!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 hover:border-amber-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`font-semibold ${getTypeColor(entry.type)}`}>
                        {entry.message}
                      </p>
                      {entry.playerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          Player: {entry.playerName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
