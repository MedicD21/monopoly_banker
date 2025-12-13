import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface ProContextType {
  isPro: boolean;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  isLoading: boolean;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has pro features
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    setIsLoading(true);
    try {
      // For now, check localStorage
      // TODO: Replace with actual in-app purchase verification
      const proStatus = localStorage.getItem('digital_banker_pro');
      setIsPro(proStatus === 'true');
    } catch (error) {
      console.error('Error checking pro status:', error);
      setIsPro(false);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePro = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Implement actual in-app purchase flow
      // For development, we'll simulate a purchase

      if (Capacitor.isNativePlatform()) {
        // In production, this would call native IAP APIs
        // Example flow:
        // 1. Initialize IAP
        // 2. Load products
        // 3. Purchase product with ID "digital_banker_pro"
        // 4. Verify receipt
        // 5. Grant access

        // For now, simulate purchase
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.setItem('digital_banker_pro', 'true');
        setIsPro(true);
        return true;
      } else {
        // Web fallback - just set it for testing
        localStorage.setItem('digital_banker_pro', 'true');
        setIsPro(true);
        return true;
      }
    } catch (error) {
      console.error('Error purchasing pro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Implement actual restore purchases flow
      // For now, check localStorage
      const proStatus = localStorage.getItem('digital_banker_pro');
      if (proStatus === 'true') {
        setIsPro(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProContext.Provider value={{ isPro, purchasePro, restorePurchases, isLoading }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}
