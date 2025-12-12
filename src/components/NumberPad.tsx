import React from 'react';

interface NumberPadProps {
  onNumber: (num: number) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export default function NumberPad({ onNumber, onClear, onSubmit }: NumberPadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onNumber(num)}
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-2xl font-bold py-4 rounded transition-colors border border-zinc-700 active:scale-95"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onClear}
        className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xl font-bold py-4 rounded transition-colors border border-zinc-700 active:scale-95"
      >
        CLR
      </button>
      <button
        onClick={() => onNumber(0)}
        className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-2xl font-bold py-4 rounded transition-colors border border-zinc-700 active:scale-95"
      >
        0
      </button>
      <button
        onClick={onSubmit}
        className="bg-amber-600 hover:bg-amber-500 text-black text-xl font-bold py-4 rounded transition-colors active:scale-95"
      >
        OK
      </button>
    </div>
  );
}
