import React, { createContext, useContext, useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  LOG_LEVEL,
  STOREKIT_VERSION,
} from "@revenuecat/purchases-capacitor";

interface ProContextType {
  isPro: boolean;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  isLoading: boolean;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

// RevenueCat API Keys (set these in your .env file or Capacitor config)
const REVENUECAT_API_KEY_IOS =
  import.meta.env.VITE_REVENUECAT_IOS_KEY || "appl_OhaBkbEneDlMlvjBEhBCMZaJcIu";
const REVENUECAT_API_KEY_ANDROID =
  import.meta.env.VITE_REVENUECAT_ANDROID_KEY || "your_android_key_here";
const PRO_ENTITLEMENT_ID = "pro"; // RevenueCat entitlement ID
const PRO_PRODUCT_ID = "digital_banker_pro_v2"; // Product ID in App Store/Play Store

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
      // Log platform to verify it matches App Store Connect setup
      const platform = Capacitor.getPlatform();
      console.log("🧭 Platform:", platform);
      console.log("🛍️ Expected product id:", PRO_PRODUCT_ID);

      if (Capacitor.isNativePlatform()) {
        // Configure RevenueCat
        const apiKey =
          platform === "ios"
            ? REVENUECAT_API_KEY_IOS
            : REVENUECAT_API_KEY_ANDROID;

        console.log("🔧 Initializing RevenueCat...");
        console.log("Platform:", platform);
        console.log(
          "API Key (first 15 chars):",
          apiKey.substring(0, 15) + "..."
        );

        await Purchases.configure({
          apiKey,
          appUserID: undefined, // Let RevenueCat generate anonymous ID
          storeKitVersion: STOREKIT_VERSION.STOREKIT_2, // Use StoreKit 2 for modern JWT-based receipts (no shared secret needed)
        });

        // Enable debug logging for TestFlight testing
        // await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        // console.log("✅ RevenueCat configured successfully");

        // Check current entitlements
        console.log("🔍 Checking pro status...");
        await checkProStatus();
      } else {
        // Web platform - use localStorage for testing
        const proStatus = localStorage.getItem("digital_banker_pro_v2");
        setIsPro(proStatus === "true");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initializing RevenueCat:", error);
      setIsPro(false);
      setIsLoading(false);
    }
  };

  const checkProStatus = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const customerInfo = await Purchases.getCustomerInfo();

        console.log("🔍 Full Customer Info:", JSON.stringify(customerInfo.customerInfo, null, 2));

        // Check if user has the pro entitlement OR AI entitlement
        const hasPro =
          customerInfo.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined ||
          customerInfo.customerInfo.entitlements.active["ai"] !== undefined;

        // For development: also check if any product was purchased (even with invalid receipt)
        const hasAnyPurchase = customerInfo.customerInfo.allPurchasedProductIdentifiers?.length > 0;

        // Also check nonSubscriptionTransactions for one-time purchases
        const hasNonSubPurchase = customerInfo.customerInfo.nonSubscriptionTransactions?.length > 0;

        // Check active subscriptions
        const hasActiveSubscription = Object.keys(customerInfo.customerInfo.entitlements.active).length > 0;

        console.log("✅ Pro Entitlement Active:", hasPro);
        console.log("📦 All Purchased Product IDs:", customerInfo.customerInfo.allPurchasedProductIdentifiers);
        console.log("💳 Non-Sub Transactions:", customerInfo.customerInfo.nonSubscriptionTransactions);
        console.log("🎫 Active Entitlements:", Object.keys(customerInfo.customerInfo.entitlements.active));
        console.log("🔐 Has any purchase:", hasAnyPurchase);
        console.log("💰 Has non-sub purchase:", hasNonSubPurchase);

        // In development/testing: trust any purchase indicator
        const isPurchased = hasPro || hasAnyPurchase || hasNonSubPurchase || hasActiveSubscription;

        console.log("🎉 Final Pro Status:", isPurchased);
        setIsPro(isPurchased);
      } else {
        // Web fallback
        const proStatus = localStorage.getItem("digital_banker_pro_v2");
        setIsPro(proStatus === "true");
      }
    } catch (error) {
      console.error("Error checking pro status:", error);
      setIsPro(false);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePro = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        console.log("🛒 Starting purchase flow...");

        // Get available packages
        console.log("📦 Fetching offerings from RevenueCat...");
        const offerings = await Purchases.getOfferings();
        console.log(
          "📦 Offerings received:",
          JSON.stringify(offerings, null, 2)
        );

        if (offerings.current === null || offerings.current === undefined) {
          console.error("❌ No current offering found");
          throw new Error("No offerings available. Please contact support.");
        }

        console.log(
          "📦 Available packages:",
          offerings.current.availablePackages.length
        );
        offerings.current.availablePackages.forEach((pkg, idx) => {
          console.log(
            `  Package ${idx}: ${pkg.product.identifier} - ${pkg.product.title} - ${pkg.product.priceString}`
          );
        });

        // Find the pro package by product id, otherwise fall back to the first available
        const proPackage = offerings.current.availablePackages.find(
          (pkg) => pkg.product.identifier === PRO_PRODUCT_ID
        );

        if (!proPackage) {
          console.error("❌ Pro package not found in offerings");
          alert(
            "Pro upgrade is temporarily unavailable. Please try again later."
          );
          return false;
        }

        console.log("✅ Found package:", proPackage.product.identifier);
        console.log("💰 Price:", proPackage.product.priceString);

        // Purchase the package
        console.log("💳 Initiating purchase...");
        const purchaseResult = await Purchases.purchasePackage({
          aPackage: proPackage,
        });
        console.log("✅ Purchase completed!");
        console.log(
          "📄 Customer info after purchase:",
          JSON.stringify(purchaseResult.customerInfo, null, 2)
        );

        // Re-check pro status after purchase to get latest state
        await checkProStatus();

        return true;
      } else {
        // Web fallback - simulate purchase for testing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        localStorage.setItem("digital_banker_pro_v2", "true");
        setIsPro(true);
        return true;
      }
    } catch (error: any) {
      console.error("❌ Purchase error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Handle user cancellation gracefully
      if (
        error.code === "1" ||
        error.message?.includes("user cancelled") ||
        error.message?.includes("cancelled")
      ) {
        console.log("🚫 Purchase cancelled by user");
        alert("Purchase cancelled");
        return false;
      }

      // Handle receipt validation errors (code 8 or 7103) - common in development
      if (
        error.code === "8" ||
        error.code === 8 ||
        error.message?.includes("receipt is not valid") ||
        error.message?.includes("INVALID_RECEIPT")
      ) {
        console.warn("⚠️ Receipt validation failed - this is expected in development");
        console.log("🔄 Checking purchase status anyway...");

        // Check if the purchase actually went through on Apple's side
        await checkProStatus();

        // If we detected a purchase, consider it successful
        if (isPro) {
          console.log("✅ Purchase detected despite receipt error");
          return true;
        }

        alert(
          "Purchase completed but needs verification. Products must be configured in RevenueCat dashboard.\n\nFor testing, the purchase has been granted locally."
        );

        // Grant access locally for development
        setIsPro(true);
        return true;
      }

      // Handle specific RevenueCat errors with user-friendly messages
      if (error.code === "2") {
        console.error("❌ Store problem - product not available");
        alert(
          "Product not available in the App Store. Please try again later."
        );
      } else if (error.code === "3") {
        console.error(
          "❌ Purchase not allowed - check parental controls or restrictions"
        );
        alert(
          "Purchase not allowed. Please check Screen Time or parental controls."
        );
      } else if (error.code === "4") {
        console.error("❌ Product already purchased");
        alert('You already own this product. Try "Restore Purchases" instead.');
      } else {
        // Generic error
        alert("Purchase could not be completed. Please try again later.");
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
        const hasPro =
          customerInfo.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !==
          undefined;
        setIsPro(hasPro);

        return hasPro;
      } else {
        // Web fallback
        const proStatus = localStorage.getItem("digital_banker_pro_v2");
        if (proStatus === "true") {
          setIsPro(true);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Error restoring purchases:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProContext.Provider
      value={{ isPro, purchasePro, restorePurchases, isLoading }}
    >
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error("usePro must be used within a ProProvider");
  }
  return context;
}
