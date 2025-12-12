import React, { useState } from 'react';
import { X } from 'lucide-react';
import NumberPad from './NumberPad';

interface NumberPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title?: string;
  initialValue?: string;
}

export default function NumberPadModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Enter Amount',
  initialValue = '',
}: NumberPadModalProps) {
  const [displayValue, setDisplayValue] = useState(initialValue);

  if (!isOpen) return null;

  const handleNumber = (num: number) => {
    setDisplayValue((prev) => prev + num.toString());
  };

  const handleClear = () => {
    setDisplayValue('');
  };

  const handleSubmit = () => {
    const numValue = parseInt(displayValue);
    if (!isNaN(numValue) && numValue > 0) {
      onConfirm(numValue);
      setDisplayValue('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-amber-400">{title}</h3>
          <button
            onClick={() => {
              setDisplayValue('');
              onClose();
            }}
            className="text-amber-400 hover:text-amber-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-amber-50 min-h-[3rem] flex items-center justify-center">
            ${displayValue || '0'}
          </div>
        </div>

        <NumberPad onNumber={handleNumber} onClear={handleClear} onSubmit={handleSubmit} />

        <button
          onClick={() => {
            setDisplayValue('');
            onClose();
          }}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
