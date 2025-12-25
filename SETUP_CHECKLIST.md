# Setup Checklist - AI Chat Subscriptions

## ✅ What's Already Done (Backend)

The cloud functions have been updated to support your new subscription structure:

- ✅ One-time purchase (`digital_banker_pro_v2`) → Game features, 5 AI messages/month
- ✅ Monthly subscription (`ai_banker_chat_monthly`) → Game features + 100 AI messages/month
- ✅ Yearly subscription (`ai_banker_chat_yearly`) → Game features + 100 AI messages/month

## 📋 What You Still Need To Do

### 1. RevenueCat Configuration

#### Products Setup
Ensure these products exist in RevenueCat:

| Product ID | Type | Price | Description |
|-----------|------|-------|-------------|
| `digital_banker_pro_v2` | Non-consumable | (your price) | One-time purchase - game features only |
| `ai_banker_chat_monthly` | Subscription (monthly) | $1.99/month | AI Chat + game features |
| `ai_banker_chat_yearly` | Subscription (yearly) | $14.99/year | AI Chat + game features |

#### Entitlements Setup
You need TWO entitlements:

**1. `pro` Entitlement** (Game Features)
- Attach products:
  - ✅ `digital_banker_pro_v2`
  - ✅ `ai_banker_chat_monthly`
  - ✅ `ai_banker_chat_yearly`

**2. `ai` Entitlement** (AI Chat Access - 100 messages)
- Attach products:
  - ✅ `ai_banker_chat_monthly`
  - ✅ `ai_banker_chat_yearly`
  - ❌ **DO NOT** attach `digital_banker_pro_v2` here

This way:
- One-time purchase users get `pro` entitlement only → Game features + 5 AI messages
- Subscription users get BOTH `pro` AND `ai` entitlements → Game features + 100 AI messages

### 2. App Store Connect / Google Play Console

1. Create the subscription products:
   - Product ID: `ai_banker_chat_monthly`
   - Product ID: `ai_banker_chat_yearly`
2. Use the EXACT same product IDs as RevenueCat
3. Set pricing: $1.99/month, $14.99/year
4. Set subscription group (if needed)
5. Submit for review

### 3. Update ProPurchaseModal UI

You need to update the purchase modal to show all three options. Here's what needs to be added:

**Current**: Only shows one-time purchase button

**New**: Should show three purchase options:

```
┌─────────────────────────────────────┐
│  Digital Banker Pro                 │
│  One-time purchase                  │
│  • All game variants                │
│  • 5 AI chat messages/month         │
│  [Buy for $X.XX]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AI Chat Monthly ⭐ Most Popular    │
│  $1.99/month                        │
│  • All game variants                │
│  • 100 AI chat messages/month       │
│  [Subscribe Monthly]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AI Chat Yearly 💰 Best Value       │
│  $14.99/year (Save 37%)             │
│  • All game variants                │
│  • 100 AI chat messages/month       │
│  [Subscribe Yearly]                 │
└─────────────────────────────────────┘
```

**File to edit**: `src/components/ProPurchaseModal.tsx`

I can help you update this file if needed!

### 4. Update ProContext (If Needed)

The `ProContext` currently checks for the `pro` entitlement. This should work automatically since all three products grant the `pro` entitlement.

**No changes needed** unless you want to separately track AI subscription status on the client side.

### 5. Firebase Deployment

Deploy the updated cloud functions:

```bash
cd cloud-functions
firebase deploy --only functions
```

### 6. Firestore Security Rules

Update your Firestore rules to include the new fields:

```javascript
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Only cloud functions
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🧪 Testing Checklist

### Test One-Time Purchase (`digital_banker_pro_v2`)
- [ ] Purchase the one-time product
- [ ] Verify "PRO" badge shows in game
- [ ] Verify game variants are unlocked
- [ ] Send AI chat message
- [ ] Should work (within 5 message limit)
- [ ] Try to send 6th message this month
- [ ] Should get error: "Subscribe to AI Chat for 100 messages/month!"

### Test Monthly Subscription (`ai_banker_chat_monthly`)
- [ ] Subscribe to monthly plan
- [ ] Verify "PRO" badge shows in game
- [ ] Verify game variants are unlocked
- [ ] Send AI chat message
- [ ] Should work (within 100 message limit)
- [ ] Check Firestore `users/{userId}`
  - [ ] `hasAI: true`
  - [ ] `hasPro: true`
  - [ ] `activeEntitlements: ["pro", "ai"]`

### Test Yearly Subscription (`ai_banker_chat_yearly`)
- [ ] Subscribe to yearly plan
- [ ] Same verification as monthly
- [ ] Should also get `hasAI: true` and `hasPro: true`

### Test Limit Reset
- [ ] Wait until next month (or manually change month in Firestore)
- [ ] Verify usage counter resets
- [ ] Both 5 and 100 message limits should reset

## 📊 Expected Behavior Summary

| User Type | Game Features | AI Messages/Month | Monthly Cost |
|-----------|--------------|-------------------|--------------|
| Free | ❌ | 5 | $0 |
| One-time Purchase | ✅ | 5 | $0 (after initial purchase) |
| Monthly Subscription | ✅ | 100 | $1.99 |
| Yearly Subscription | ✅ | 100 | $1.25/month ($14.99/year) |

## 🔍 Monitoring

### Check User Status
```javascript
// Firestore: users/{userId}
{
  hasAI: true,           // Has AI subscription (100 messages)
  hasPro: true,          // Has game features
  activeEntitlements: ["pro", "ai"],
  lastVerified: Timestamp
}
```

### Check AI Usage
```javascript
// Firestore: aiUsage/{userId}
{
  month: "2025-12",
  count: 15,             // Messages used this month
  lastUsed: Timestamp,
  isPremium: true        // Using 100 message limit
}
```

### Firebase Functions Logs
```bash
firebase functions:log --only analyzeMonopolyGame
```

Look for:
```
User {userId} - AI: true, Pro: true
AI usage: 85/100 remaining for user {userId}
```

## 💡 Tips

1. **Testing in Sandbox**: Use sandbox accounts for testing subscriptions
2. **Pricing**: The 37% savings on yearly is calculated as: `(1.99 * 12 - 14.99) / (1.99 * 12) * 100 ≈ 37%`
3. **Upgrade Path**: Users with one-time purchase can upgrade to subscription to get more AI messages
4. **Downgrade**: If subscription expires, user keeps game features but drops to 5 AI messages

## 🚨 Important Notes

- **Cloud functions MUST be deployed** before releasing the app update
- **RevenueCat entitlements** must be correctly configured (2 separate entitlements)
- **Product IDs** must match exactly between App Store/Play Store and RevenueCat
- **Test thoroughly** in sandbox before production release

## ❓ Need Help?

If you need help updating the ProPurchaseModal UI to show all three purchase options, let me know! I can write the complete component code for you.
