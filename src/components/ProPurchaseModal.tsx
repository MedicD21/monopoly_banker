import React, { useState, useEffect } from 'react';
import { X, Crown, Check } from 'lucide-react';
import { usePro } from '../context/ProContext';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

interface ProPurchaseModalProps {
  onClose: () => void;
}

export default function ProPurchaseModal({ onClose }: ProPurchaseModalProps) {
  const { purchasePro, restorePurchases, isLoading } = usePro();
  const [purchasing, setPurchasing] = useState(false);
  const [priceString, setPriceString] = useState('$1.99');

  // Fetch the actual price from RevenueCat
  useEffect(() => {
    const fetchPrice = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current && offerings.current.availablePackages && offerings.current.availablePackages.length > 0) {
            const proPackage = offerings.current.availablePackages.find(
              pkg => pkg.product.identifier === 'digital_banker_pro'
            ) || offerings.current.availablePackages[0];

            if (proPackage?.product.priceString) {
              setPriceString(proPackage.product.priceString);
            }
          }
        } catch (error) {
          console.error('Error fetching price:', error);
          // Keep default $1.99 if fetch fails
        }
      }
    };

    fetchPrice();
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const success = await purchasePro();
      setPurchasing(false);

      if (success) {
        alert('🎉 Pro features unlocked! You can now access all game variants.');
        onClose();
      }
      // Error handling is done in ProContext, so we don't need to show another alert here
    } catch (error) {
      setPurchasing(false);
      console.error('Unexpected purchase error:', error);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restorePurchases();
    setPurchasing(false);

    if (success) {
      alert('✅ Purchases restored successfully!');
      onClose();
    } else {
      alert('No previous purchases found.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border-2 border-amber-500/50 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-amber-300"
          disabled={purchasing}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-4">
              <Crown className="w-12 h-12 text-black" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">
            Upgrade to Pro
          </h2>
          <p className="text-amber-600 text-sm">
            One-time purchase • {priceString}
          </p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mb-6 space-y-3">
          <h3 className="text-amber-400 font-bold mb-3">Pro Features:</h3>

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Free Parking Jackpot</p>
              <p className="text-gray-400 text-sm">Collect taxes and fees in a jackpot</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Double GO Bonus</p>
              <p className="text-gray-400 text-sm">Get $400 when landing on GO</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Property Auctions</p>
              <p className="text-gray-400 text-sm">Auction unpurchased properties</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Speed Die Mode</p>
              <p className="text-gray-400 text-sm">Roll 3 dice for faster gameplay</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={purchasing || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Purchase Pro • {priceString}
              </>
            )}
          </button>

          <button
            onClick={handleRestore}
            disabled={purchasing || isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore Purchases
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Pro features are tied to your Apple ID. One-time payment unlocks all game variants when hosting.
          </p>
        </div>
      </div>
    </div>
  );
}
