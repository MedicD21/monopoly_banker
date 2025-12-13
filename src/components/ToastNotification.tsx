import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-emerald-900 border-2 border-emerald-500 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        <div className="flex-1">
          <p className="text-amber-50 font-semibold text-center">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-amber-400 hover:text-amber-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
