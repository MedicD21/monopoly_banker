import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

interface ProContextType {
  isPro: boolean;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  isLoading: boolean;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

// RevenueCat API Keys (set these in your .env file or Capacitor config)
const REVENUECAT_API_KEY_IOS = import.meta.env.VITE_REVENUECAT_IOS_KEY || 'your_ios_key_here';
const REVENUECAT_API_KEY_ANDROID = import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'your_android_key_here';
const PRO_ENTITLEMENT_ID = 'pro'; // RevenueCat entitlement ID
const PRO_PRODUCT_ID = 'digital_banker_pro'; // Product ID in App Store/Play Store

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize RevenueCat and check pro status
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Configure RevenueCat
        const platform = Capacitor.getPlatform();
        const apiKey = platform === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

        await Purchases.configure({
          apiKey,
          appUserID: undefined, // Let RevenueCat generate anonymous ID
        });

        // Set log level for debugging (remove in production)
        if (import.meta.env.DEV) {
          await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        }

        // Check current entitlements
        await checkProStatus();
      } else {
        // Web platform - use localStorage for testing
        const proStatus = localStorage.getItem('digital_banker_pro');
        setIsPro(proStatus === 'true');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      setIsPro(false);
      setIsLoading(false);
    }
  };

  const checkProStatus = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const customerInfo = await Purchases.getCustomerInfo();

        // Check if user has the pro entitlement
        const hasPro = customerInfo.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);
      } else {
        // Web fallback
        const proStatus = localStorage.getItem('digital_banker_pro');
        setIsPro(proStatus === 'true');
      }
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
      if (Capacitor.isNativePlatform()) {
        // Get available packages
        const offerings = await Purchases.getOfferings();

        if (offerings.current === null || offerings.current === undefined) {
          throw new Error('No offerings available');
        }

        // Find the pro package by product id, otherwise fall back to the first available
        const proPackage =
          offerings.current.availablePackages.find(
            (pkg) => pkg.product.identifier === PRO_PRODUCT_ID
          ) || offerings.current.availablePackages[0];

        if (!proPackage) {
          throw new Error('Pro package not found');
        }

        // Purchase the package
        const purchaseResult = await Purchases.purchasePackage({
          aPackage: proPackage,
        });

        // Check if purchase was successful
        const hasPro = purchaseResult.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);

        return hasPro;
      } else {
        // Web fallback - simulate purchase for testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.setItem('digital_banker_pro', 'true');
        setIsPro(true);
        return true;
      }
    } catch (error: any) {
      console.error('Error purchasing pro:', error);

      // Handle user cancellation gracefully
      if (error.code === '1' || error.message?.includes('user cancelled') || error.message?.includes('cancelled')) {
        console.log('Purchase cancelled by user');
        return false;
      }

      // Handle specific RevenueCat errors
      if (error.code === '2') {
        console.error('Store problem - product not available');
      } else if (error.code === '3') {
        console.error('Purchase not allowed - check parental controls or restrictions');
      } else if (error.code === '4') {
        console.error('Product already purchased');
      }

      // Return false instead of throwing to prevent infinite spinner
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Restore purchases through RevenueCat
        const customerInfo = await Purchases.restorePurchases();

        // Check if user has pro entitlement after restore
        const hasPro = customerInfo.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);

        return hasPro;
      } else {
        // Web fallback
        const proStatus = localStorage.getItem('digital_banker_pro');
        if (proStatus === 'true') {
          setIsPro(true);
          return true;
        }
        return false;
      }
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
