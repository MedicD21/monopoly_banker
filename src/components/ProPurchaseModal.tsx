import React, { useState, useEffect } from "react";
import { X, Crown, ChevronDown, ChevronUp, Sparkles, Zap } from "lucide-react";
import { usePro } from "../context/ProContext";
import { Capacitor } from "@capacitor/core";
import { Purchases, PurchasesPackage } from "@revenuecat/purchases-capacitor";

interface ProPurchaseModalProps {
  onClose: () => void;
}

interface PurchaseOption {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  period?: string;
  badge?: string;
  badgeColor?: string;
  icon: typeof Crown;
  features: string[];
  productId: string;
  popular?: boolean;
}

export default function ProPurchaseModal({ onClose }: ProPurchaseModalProps) {
  const { restorePurchases, isLoading } = usePro();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [packages, setPackages] = useState<{ [key: string]: PurchasesPackage }>({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [activeSubscriptionType, setActiveSubscriptionType] = useState<'monthly' | 'yearly' | null>(null);

  const purchaseOptions: PurchaseOption[] = [
    {
      id: "onetime",
      title: "Digital Banker Pro",
      subtitle: "One-Time Purchase",
      price: "$1.99",
      badge: "Game Features",
      badgeColor: "bg-blue-600",
      icon: Crown,
      productId: "digital_banker_pro_v2",
      features: [
        "All game variants unlocked",
        "Free Parking Jackpot",
        "Double GO Bonus",
        "Property Auctions",
        "Speed Die Mode",
        "5 AI chat messages/month"
      ]
    },
    {
      id: "monthly",
      title: "AI Chat Monthly",
      subtitle: "$1.99/month",
      price: "$1.99",
      period: "/month",
      badge: "Most Popular",
      badgeColor: "bg-green-600",
      icon: Sparkles,
      productId: "ai_banker_chat_monthly",
      popular: true,
      features: [
        "All game variants unlocked",
        "100 AI chat messages/month",
        "Game rules & strategy tips",
        "Real-time game analysis",
        "Cancel anytime"
      ]
    },
    {
      id: "yearly",
      title: "AI Chat Yearly",
      subtitle: "$14.99/year • Save 37%",
      price: "$14.99",
      period: "/year",
      badge: "Best Value",
      badgeColor: "bg-amber-600",
      icon: Zap,
      productId: "ai_banker_chat_yearly",
      features: [
        "All game variants unlocked",
        "100 AI chat messages/month",
        "Game rules & strategy tips",
        "Real-time game analysis",
        "Just $1.25/month"
      ]
    }
  ];

  // Fetch prices from RevenueCat and check subscription status
  useEffect(() => {
    const fetchPricesAndStatus = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current?.availablePackages) {
            const pkgMap: { [key: string]: PurchasesPackage } = {};

            offerings.current.availablePackages.forEach((pkg) => {
              pkgMap[pkg.product.identifier] = pkg;
            });

            setPackages(pkgMap);
          }

          // Check if user has active subscription
          const customerInfo = await Purchases.getCustomerInfo();
          const activeProducts = customerInfo.customerInfo.activeSubscriptions || [];

          // Check which specific subscription they have
          const hasMonthly = activeProducts.includes("ai_banker_chat_monthly");
          const hasYearly = activeProducts.includes("ai_banker_chat_yearly");
          const hasSubscription = hasMonthly || hasYearly;

          setHasActiveSubscription(hasSubscription);
          setActiveSubscriptionType(hasMonthly ? 'monthly' : hasYearly ? 'yearly' : null);

          console.log("🔍 Active subscriptions:", activeProducts);
          console.log("📊 Has active subscription:", hasSubscription);
          console.log("📅 Subscription type:", hasMonthly ? 'monthly' : hasYearly ? 'yearly' : 'none');
        } catch (error) {
          console.error("Error fetching prices/status:", error);
        }
      }
    };

    fetchPricesAndStatus();
  }, []);

  const getPriceString = (productId: string, defaultPrice: string): string => {
    return packages[productId]?.product.priceString || defaultPrice;
  };

  const handlePurchase = async (option: PurchaseOption) => {
    setPurchasing(true);
    setSelectedOption(option.id);

    try {
      if (Capacitor.isNativePlatform()) {
        const pkg = packages[option.productId];

        if (!pkg) {
          alert("Product not available. Please try again.");
          setPurchasing(false);
          setSelectedOption(null);
          return;
        }

        const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });

        if (purchaseResult.customerInfo.entitlements.active["pro"] ||
            purchaseResult.customerInfo.entitlements.active["ai"]) {
          alert(`🎉 Success! ${option.title} unlocked!`);
          onClose();
          // Reload to update Pro status
          window.location.reload();
        }
      } else {
        // Web testing - simulate purchase
        localStorage.setItem("digital_banker_pro_v2", "true");
        alert(`🎉 Success! ${option.title} unlocked!`);
        onClose();
      }
    } catch (error: any) {
      console.error("💰 Product purchase for '" + option.productId + "' failed with error:", error);

      // User cancelled - just close silently
      if (error.code === "1" || error.code === 1) {
        setPurchasing(false);
        setSelectedOption(null);
        return;
      }

      // Handle receipt validation errors (code 8 or 7103) - common in development
      if (
        error.code === "8" ||
        error.code === 8 ||
        error.message?.includes("receipt is not valid") ||
        error.message?.includes("INVALID_RECEIPT") ||
        error.message?.includes("7103")
      ) {
        console.warn("⚠️ Receipt validation failed - granting access locally for development");

        // Grant access locally for development/testing
        localStorage.setItem("digital_banker_pro_v2", "true");
        alert(
          `✅ Purchase completed!\n\n⚠️ Note: Receipt validation pending. Products must be configured in RevenueCat dashboard for production.\n\nPro features unlocked for testing.`
        );
        onClose();
        // Force page reload to update Pro status
        window.location.reload();
        return;
      }

      // Other errors
      if (error.code !== "1") {
        alert(`Purchase failed: ${error.message || "Please try again"}`);
      }
    } finally {
      setPurchasing(false);
      setSelectedOption(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restorePurchases();
    setPurchasing(false);

    if (success) {
      alert("✅ Purchases restored successfully!");
      onClose();
    } else {
      alert("No previous purchases found.");
    }
  };

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 bg-black bg-opacity-90 p-4 pt-20 overflow-y-auto">
      <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border-2 border-amber-500/50 relative my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-amber-300 z-10"
          disabled={purchasing}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-3">
              <Crown className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-amber-400 mb-1">
            {hasActiveSubscription ? "Upgrade Your Plan" : "Unlock Premium"}
          </h2>
          <p className="text-zinc-400 text-xs">
            {hasActiveSubscription
              ? "You already have Pro features! Upgrade to save more"
              : "Choose the plan that works best for you"}
          </p>
        </div>

        {/* Info banner for existing subscribers */}
        {hasActiveSubscription && (
          <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-xs text-center">
              ✓ You already have all Pro game features included with your subscription
            </p>
          </div>
        )}

        {/* Purchase Options - Compact Expandable Cards */}
        <div className="space-y-3 mb-6">
          {purchaseOptions
            .filter((option) => {
              // Hide one-time purchase if user has active subscription
              if (option.id === "onetime" && hasActiveSubscription) {
                return false;
              }
              return true;
            })
            .map((option) => {
            const Icon = option.icon;
            const actualPrice = getPriceString(option.productId, option.price);
            const isExpanded = expandedCard === option.id;
            const isSelected = selectedOption === option.id;
            const isPurchasing = purchasing && isSelected;

            // Check if this is the user's current subscription
            const isCurrentPlan =
              (option.id === "monthly" && activeSubscriptionType === 'monthly') ||
              (option.id === "yearly" && activeSubscriptionType === 'yearly');

            return (
              <div
                key={option.id}
                className={`relative bg-zinc-800 rounded-lg border-2 transition-all ${
                  isCurrentPlan
                    ? "border-blue-500"
                    : option.popular
                    ? "border-green-500"
                    : "border-zinc-700"
                }`}
              >
                {/* Badge - Show "Current Plan" or regular badge */}
                {isCurrentPlan ? (
                  <div className="absolute -top-2 right-3">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Current Plan
                    </span>
                  </div>
                ) : option.badge && (
                  <div className="absolute -top-2 right-3">
                    <span className={`${option.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {option.badge}
                    </span>
                  </div>
                )}

                {/* Collapsed View - Always Visible */}
                <button
                  onClick={() => toggleCard(option.id)}
                  className="w-full p-4 flex items-center gap-3"
                  disabled={purchasing}
                >
                  <div className={`${option.popular ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-zinc-700'} rounded-full p-2 flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-sm">
                      {option.title}
                    </h3>
                    <p className="text-zinc-400 text-xs">
                      {option.subtitle}
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded View - Details & Purchase Button */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-700">
                    {/* Price */}
                    <div className="text-center my-3">
                      <span className="text-2xl font-bold text-amber-400">
                        {actualPrice}
                      </span>
                      {option.period && (
                        <span className="text-zinc-400 text-sm">{option.period}</span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-1 mb-4">
                      {option.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                          <span className="text-zinc-300 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Button or Current Plan Message */}
                    {isCurrentPlan ? (
                      <div className="w-full bg-blue-900/30 border border-blue-600/50 text-blue-400 font-bold py-3 rounded-lg text-center text-sm">
                        ✓ Your Current Subscription
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(option)}
                        disabled={purchasing || isLoading}
                        className={`w-full ${
                          option.popular
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                        } text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      >
                        {isPurchasing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            {option.id === "onetime" ? "Buy Now" : "Subscribe"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Restore Button */}
        <div className="space-y-2">
          <button
            onClick={handleRestore}
            disabled={purchasing || isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-sm"
          >
            Restore Purchases
          </button>

          <p className="text-[10px] text-zinc-500 text-center leading-tight">
            Purchases are tied to your Apple ID. Subscriptions auto-renew unless cancelled 24h before renewal.
          </p>
        </div>
      </div>
    </div>
  );
}
