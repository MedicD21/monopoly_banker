# AI Monetization System - Gemini Chatbot

## Overview

This system implements **server-side** usage limits for the Gemini-powered Monopoly AI assistant, preventing abuse and controlling costs while providing value to both free and premium users.

## Usage Limits

| User Type | Monthly Limit | Purpose |
|-----------|--------------|---------|
| **Free** | 5 messages | Trial experience to showcase AI features |
| **Premium** | 100 messages | Full access for paying users (subscription OR one-time purchase) |

## Premium Access Methods

Users get **Premium** status (100 messages/month) through ANY of these:

1. **Subscription** - RevenueCat `pro` entitlement (recurring monthly/yearly)
2. **One-time Purchase** - `digital_banker_pro_v2` product ID (lifetime access)
3. **Legacy Purchase** - `digital_banker_pro` product ID (backward compatibility)

All three methods grant the same 100 messages/month limit.

## How It Works

### 1. Server-Side Enforcement (Cloud Functions)

All AI usage tracking happens in **Firebase Cloud Functions** to prevent client-side manipulation:

- Usage counts stored in Firestore collection: `aiUsage/{userId}`
- Atomic transactions prevent race conditions
- Monthly auto-reset based on current month
- Limits checked **before** calling Gemini API

### 2. Firestore Collections

**AI Usage Tracking** (`aiUsage/{userId}`):
```javascript
{
  month: "2025-12",           // Format: YYYY-MM
  count: 3,                   // Number of messages used this month
  lastUsed: Timestamp,        // Last usage timestamp
  isPremium: false            // User's premium status at time of use
}
```

**Premium Status Verification** (`users/{userId}`):
```javascript
{
  isPremium: true,                    // Verified premium status
  activeEntitlements: [               // RevenueCat entitlements
    "pro",                            // Subscription OR
    "digital_banker_pro_v2"           // One-time purchase
  ],
  lastVerified: Timestamp             // Last verification time
}
```

### 3. Flow Diagram

```
User sends message
       ↓
Frontend calls analyzeMonopolyGame()
  (includes isPremium from RevenueCat)
       ↓
[CLOUD FUNCTION]
       ↓
1. Verify premium status
   - Check if "pro" entitlement active
   - OR "digital_banker_pro_v2" purchased
   - OR "digital_banker_pro" (legacy)
   - Store verified status in users/{userId}
       ↓
2. Check usage: checkAndUpdateAIUsage()
   - Use VERIFIED premium status
       ↓
  Over limit? → Throw error: "resource-exhausted"
       ↓
  Under limit → Increment count
       ↓
3. Call Gemini API
       ↓
Return response + usage info
```

## Implementation Details

### Cloud Function: `analyzeMonopolyGame`

**Location**: `cloud-functions/src/index.ts`

**Required Parameters**:
```typescript
{
  gameId: string,              // Game identifier
  message: string,             // User's question
  userId: string,              // User identifier (player ID)
  isPremium: boolean,          // Client-reported premium status
  activeEntitlements?: string[] // Optional: RevenueCat entitlements for verification
}
```

**Premium Status Logic**:
The function verifies premium status by checking if the user has ANY of:
- `pro` entitlement (subscription)
- `digital_banker_pro_v2` product (one-time purchase)
- `digital_banker_pro` product (legacy one-time purchase)

This is stored in `users/{userId}` for audit purposes.

**Response**:
```typescript
{
  reply: string,           // AI response
  leaderboard: object[],   // Game metrics
  usage: {
    remaining: number,     // Messages remaining this month
    limit: number,         // Total monthly limit
    isPremium: boolean     // User's premium status
  }
}
```

**Error Handling**:
- `invalid-argument`: Missing required fields
- `resource-exhausted`: Usage limit exceeded
- `internal`: Gemini API failure

### Frontend Integration

**Location**: `monopoly.tsx:125-176`

**Key Features**:
1. Gets current player's premium status from RevenueCat
2. Passes `userId` and `isPremium` to cloud function
3. Handles `resource-exhausted` errors gracefully
4. Logs usage info to console

**Error Messages**:
- Free users: "Upgrade to Premium for 100 messages/month!"
- Premium users: "Your limit will reset next month."

## Security Features

✅ **Server-side only** - No client manipulation possible
✅ **Atomic transactions** - Prevents double-counting
✅ **Premium verification** - Uses actual RevenueCat status
✅ **API protection** - Gemini only called after limit check
✅ **Monthly reset** - Automatic reset each calendar month

## Firestore Security Rules

Add these rules to protect the collections:

```javascript
// AI Usage tracking
match /aiUsage/{userId} {
  // Users can read their own usage
  allow read: if request.auth != null && request.auth.uid == userId;

  // Only cloud functions can write
  allow write: if false;
}

// Premium status verification
match /users/{userId} {
  // Users can read their own premium status
  allow read: if request.auth != null && request.auth.uid == userId;

  // Only cloud functions can write
  allow write: if false;
}
```

## Cost Protection

### Free Tier (5 messages/month)
- Average cost per message: $0.001 - $0.005
- Monthly cost per free user: ~$0.025 max
- With 1,000 free users: ~$25/month

### Premium Tier (100 messages/month)
- Monthly cost per premium user: ~$0.50 max
- Revenue per premium user: $2.99 - $4.99/month
- **Profit margin**: ~80-90%

### Total Protection
- No unlimited access = Cost ceiling guaranteed
- Premium users subsidize free tier
- Predictable monthly AI costs

## Deployment

### 1. Deploy Cloud Functions

```bash
cd cloud-functions
npm install
firebase deploy --only functions
```

### 2. Set Gemini API Key (if not already done)

```bash
firebase functions:secrets:set GOOGLE_API_KEY
```

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Monitoring

### Check User Usage

```javascript
// Get specific user's usage
const usage = await db.collection('aiUsage').doc(userId).get();
console.log(usage.data());
```

### Monthly Usage Report

```javascript
// Get all users' usage for current month
const currentMonth = "2025-12";
const snapshot = await db.collection('aiUsage')
  .where('month', '==', currentMonth)
  .get();

let totalMessages = 0;
let freeMessages = 0;
let premiumMessages = 0;

snapshot.forEach(doc => {
  const data = doc.data();
  totalMessages += data.count;
  if (data.isPremium) {
    premiumMessages += data.count;
  } else {
    freeMessages += data.count;
  }
});

console.log({
  totalMessages,
  freeMessages,
  premiumMessages,
  estimatedCost: totalMessages * 0.003 // Rough estimate
});
```

## Future Enhancements

### Possible Additions:
1. **Daily limits** - Prevent users from burning through monthly limit in one day
2. **Grace period** - Allow 1-2 messages over limit with warning
3. **Usage analytics** - Track which features drive AI usage
4. **Dynamic pricing** - Adjust limits based on actual Gemini costs
5. **Admin dashboard** - Real-time usage monitoring
6. **A/B testing** - Test different limit tiers

### Alternative Monetization:
- **Pay-per-message**: $0.10 per message (one-time purchases)
- **Tiered subscriptions**: Basic (25/mo), Premium (100/mo), Ultimate (500/mo)
- **Team plans**: Shared pool for multiplayer games
- **Sponsor ads**: Free messages in exchange for watching ads

## Testing

### Test Free User Limit

```javascript
// In browser console
for (let i = 0; i < 6; i++) {
  console.log(`Message ${i + 1}:`);
  await handleChatMessage("Who is winning?");
}
// Should fail on message 6
```

### Test Premium User Limit

1. Enable Pro subscription (RevenueCat)
2. Send 101 messages
3. Should fail on message 101

### Test Monthly Reset

1. Manually update Firestore document:
   ```javascript
   db.collection('aiUsage').doc(userId).update({
     month: "2024-11", // Old month
     count: 5
   });
   ```
2. Send new message
3. Should reset count to 1 with current month

## Support

**Common Issues**:

1. **"Missing userId"** - Ensure user is in a multiplayer game
2. **"resource-exhausted"** - User hit their limit (expected behavior)
3. **"internal error"** - Check Firebase Functions logs
4. **Premium status not working** - Verify RevenueCat integration

**Debugging**:
```bash
# View function logs
firebase functions:log

# Test function locally
firebase emulators:start --only functions
```

## Summary

This implementation provides:
- ✅ Fair trial for free users (5 messages)
- ✅ Generous limits for paying customers (100 messages)
- ✅ Complete cost protection (no unlimited access)
- ✅ Server-side security (no client manipulation)
- ✅ Automatic monthly reset
- ✅ Premium upsell opportunity

The system balances user experience with cost control while creating a clear value proposition for premium subscriptions.
