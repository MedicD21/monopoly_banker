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
        console.log('🛒 Starting purchase flow...');

        // Get available packages
        console.log('📦 Fetching offerings from RevenueCat...');
        const offerings = await Purchases.getOfferings();
        console.log('📦 Offerings received:', JSON.stringify(offerings, null, 2));

        if (offerings.current === null || offerings.current === undefined) {
          console.error('❌ No current offering found');
          throw new Error('No offerings available. Please contact support.');
        }

        console.log('📦 Available packages:', offerings.current.availablePackages.length);
        offerings.current.availablePackages.forEach((pkg, idx) => {
          console.log(`  Package ${idx}: ${pkg.product.identifier} - ${pkg.product.title} - ${pkg.product.priceString}`);
        });

        // Find the pro package by product id, otherwise fall back to the first available
        const proPackage =
          offerings.current.availablePackages.find(
            (pkg) => pkg.product.identifier === PRO_PRODUCT_ID
          ) || offerings.current.availablePackages[0];

        if (!proPackage) {
          console.error('❌ Pro package not found in offerings');
          throw new Error('Pro package not found. Please contact support.');
        }

        console.log('✅ Found package:', proPackage.product.identifier);
        console.log('💰 Price:', proPackage.product.priceString);

        // Purchase the package
        console.log('💳 Initiating purchase...');
        const purchaseResult = await Purchases.purchasePackage({
          aPackage: proPackage,
        });
        console.log('✅ Purchase completed!');
        console.log('📄 Customer info:', JSON.stringify(purchaseResult.customerInfo, null, 2));

        // Check if purchase was successful
        const hasPro = purchaseResult.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
        console.log('🎉 Has Pro entitlement:', hasPro);
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
      console.error('❌ Purchase error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // Handle user cancellation gracefully
      if (error.code === '1' || error.message?.includes('user cancelled') || error.message?.includes('cancelled')) {
        console.log('🚫 Purchase cancelled by user');
        alert('Purchase cancelled');
        return false;
      }

      // Handle specific RevenueCat errors with user-friendly messages
      if (error.code === '2') {
        console.error('❌ Store problem - product not available');
        alert('Product not available in the App Store. Please try again later.');
      } else if (error.code === '3') {
        console.error('❌ Purchase not allowed - check parental controls or restrictions');
        alert('Purchase not allowed. Please check Screen Time or parental controls.');
      } else if (error.code === '4') {
        console.error('❌ Product already purchased');
        alert('You already own this product. Try "Restore Purchases" instead.');
      } else {
        // Generic error
        alert(`Purchase failed: ${error.message || 'Unknown error'}`);
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
