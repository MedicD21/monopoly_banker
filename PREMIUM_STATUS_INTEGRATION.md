# Premium Status Integration Summary

## Overview

The AI monetization system now recognizes **THREE** ways for users to get premium access (100 AI messages/month):

1. ✅ **Subscription** - `pro` entitlement (recurring)
2. ✅ **One-time Purchase (Current)** - `digital_banker_pro_v2` product
3. ✅ **One-time Purchase (Legacy)** - `digital_banker_pro` product (backward compatibility)

## How It Works

### Client Side (RevenueCat)

The `ProContext` (`src/context/ProContext.tsx`) checks RevenueCat for active entitlements:

```typescript
const hasPro = customerInfo.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
```

This checks if the user has the `pro` entitlement, which is granted by:
- Active subscription
- Valid one-time purchase (`digital_banker_pro_v2` or `digital_banker_pro`)

The `isPro` status is then stored on the player object and synced across the game.

### Server Side (Cloud Functions)

**Location**: `cloud-functions/src/index.ts`

The cloud function verifies premium status using the `PREMIUM_ENTITLEMENTS` array:

```typescript
const PREMIUM_ENTITLEMENTS = [
  "pro",                      // Subscription entitlement
  "digital_banker_pro",       // One-time purchase (legacy)
  "digital_banker_pro_v2",    // One-time purchase (current)
];
```

**Verification Process**:

1. Client sends `isPremium` status from RevenueCat
2. Server calls `verifyAndStorePremiumStatus()`
3. Checks if user has any of the premium entitlements
4. Stores verified status in `users/{userId}` collection
5. Uses verified status for AI usage limits

**Storage**:
```javascript
// users/{userId}
{
  isPremium: true,
  activeEntitlements: ["pro"], // or ["digital_banker_pro_v2"]
  lastVerified: Timestamp
}
```

## RevenueCat Configuration

### Products

| Product ID | Type | Description |
|-----------|------|-------------|
| `digital_banker_pro_v2` | Non-consumable | One-time purchase (current) |
| `digital_banker_pro` | Non-consumable | One-time purchase (legacy) |
| `monthly_subscription` | Subscription | Monthly recurring |
| `yearly_subscription` | Subscription | Yearly recurring |

### Entitlements

| Entitlement ID | Granted By | AI Limit |
|----------------|------------|----------|
| `pro` | ANY of the above products | 100 messages/month |

**Important**: All products should grant the same `pro` entitlement in RevenueCat.

## Setup Instructions

### 1. RevenueCat Dashboard

1. Go to your app in RevenueCat
2. Navigate to **Products**
3. Ensure these products exist:
   - `digital_banker_pro_v2` (non-consumable)
   - `digital_banker_pro` (non-consumable) - if you have legacy users
   - Your subscription products (if offering subscriptions)

4. Navigate to **Entitlements**
5. Create/verify the `pro` entitlement
6. Attach ALL premium products to the `pro` entitlement

### 2. App Store Connect / Google Play Console

1. Create the in-app purchase products
2. Use the EXACT same product IDs as in RevenueCat
3. Set appropriate pricing
4. Submit for review

### 3. Firebase Cloud Functions

Deploy the updated function:

```bash
cd cloud-functions
firebase deploy --only functions
```

### 4. Firestore Security Rules

Add rules to protect the `users` collection:

```javascript
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Only cloud functions
}
```

## Testing

### Test One-Time Purchase

1. Open app on iOS/Android
2. Trigger the purchase flow
3. Complete purchase of `digital_banker_pro_v2`
4. RevenueCat should grant `pro` entitlement
5. Check `isPro` status in app
6. Send AI message to chatbot
7. Check Firestore `users/{userId}` for verified premium status

### Test Subscription

1. Purchase a subscription product
2. RevenueCat grants `pro` entitlement
3. Same verification flow as above

### Test Legacy Purchase

1. If you have users with `digital_banker_pro` already purchased
2. They should automatically get premium AI access
3. No re-purchase needed

## Migration Notes

### For Existing Users

**No action required!** The system is backward compatible:

- Users with `digital_banker_pro` (old) → Still get 100 messages
- Users with subscriptions → Still get 100 messages
- New users purchase `digital_banker_pro_v2` → Get 100 messages

### For New Deployments

1. Deploy cloud functions first
2. Then deploy app update
3. Monitor Firestore `users` collection for verification logs
4. Check Firebase Functions logs for any errors

## Troubleshooting

### User reports "Not premium" despite purchase

**Check**:
1. RevenueCat dashboard - does user have active entitlement?
2. Product IDs match exactly between App Store and RevenueCat
3. Firestore `users/{userId}` - what's the `isPremium` value?
4. Firebase Functions logs - any verification errors?

### AI limit shows 5 instead of 100

**Check**:
1. `isPro` status on player object in game
2. Firestore `users/{userId}` - `isPremium` field
3. Firestore `aiUsage/{userId}` - `isPremium` field
4. Cloud function logs for verification output

### Legacy users can't access premium

**Solution**:
Add `digital_banker_pro` to `PREMIUM_ENTITLEMENTS` array in cloud function (already done).

## Code Locations

| Feature | File | Lines |
|---------|------|-------|
| Premium entitlements list | `cloud-functions/src/index.ts` | 25-29 |
| Premium verification | `cloud-functions/src/index.ts` | 32-64 |
| Frontend premium check | `monopoly.tsx` | 140-145 |
| RevenueCat integration | `src/context/ProContext.tsx` | 82-99 |

## Summary

✅ **Subscription users** → 100 messages/month
✅ **One-time purchase users** → 100 messages/month (lifetime)
✅ **Legacy purchase users** → 100 messages/month (backward compatible)
✅ **Free users** → 5 messages/month

The system treats all premium access methods equally, providing the same generous AI usage limit regardless of how the user paid.
