import React from 'react';
import { X } from 'lucide-react';

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerBalance: number;
  onPayTax: (amount: number, taxType: string) => void;
  onOpenCustomTaxNumberPad: () => void;
}

export default function TaxModal({
  isOpen,
  onClose,
  playerBalance,
  onPayTax,
  onOpenCustomTaxNumberPad,
}: TaxModalProps) {
  if (!isOpen) return null;

  const jailFee = 50;

  const handleJailFee = () => {
    onPayTax(jailFee, 'Jail Fee');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">Pay Fee</h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Jail Fee */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-amber-900/30">
            <h3 className="font-bold text-amber-50 mb-2">Jail Fee</h3>
            <p className="text-sm text-amber-300 mb-3">Pay $50 to leave jail</p>
            <button
              onClick={handleJailFee}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Pay $50 Jail Fee
            </button>
          </div>

          {/* Custom Fee */}
          <div className="bg-zinc-800 rounded-lg p-4 border border-amber-900/30">
            <h3 className="font-bold text-amber-50 mb-2">Custom Fee Amount</h3>
            <p className="text-sm text-amber-300 mb-3">Enter any amount</p>
            <button
              onClick={() => {
                onOpenCustomTaxNumberPad();
                onClose();
              }}
              className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Enter Custom Amount
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
