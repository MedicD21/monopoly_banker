import React, { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";

interface JoinScreenProps {
  onBack: () => void;
  onJoin: (code: string) => void;
}

export default function JoinScreen({ onBack, onJoin }: JoinScreenProps) {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-join when all 5 digits entered
    if (newCode.every((d) => d) && index === 4) {
      handleJoin(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleJoin = (fullCode: string) => {
    if (fullCode.length !== 5) {
      setError("Please enter a 5-digit code");
      return;
    }
    setError("");
    onJoin(fullCode);
  };

  return (
    <div className="h-full bg-black text-amber-50 p-4" style={{ minHeight: '100%' }}>
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">
            Join Game
          </h1>
          <p className="text-red-600">Enter the 5-digit game code</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-8 border border-amber-900/30 mb-6">
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 text-center text-3xl font-bold bg-zinc-800 border-2 border-amber-900/30 focus:border-amber-600 rounded text-amber-400 focus:outline-none"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button
            onClick={() => handleJoin(code.join(""))}
            disabled={code.some((d) => !d)}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Join Game
          </button>
        </div>

        <div className="text-center">
          <div className="inline-block bg-zinc-900 rounded-lg p-6 border border-amber-900/30">
            <p className="text-amber-400 mb-3">OR</p>
            <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
              <Camera className="w-5 h-5" />
              Scan QR Code
            </button>
            <p className="text-xs text-amber-600 mt-2">
              (QR scanning coming soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
