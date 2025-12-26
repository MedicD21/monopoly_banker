import {
  HttpsError,
  onCall,
  CallableRequest,
} from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- Global Setup ----------
setGlobalOptions({ maxInstances: 10, region: "us-central1" });

admin.initializeApp();
const db = admin.firestore();

// Gemini (uses Firebase project billing automatically)
// Gemini API key (Functions v2 secret)
const GOOGLE_API_KEY = defineSecret("GOOGLE_API_KEY");

// ---------- AI Usage Limits ----------
const AI_LIMITS = {
  FREE: 5, // Free users: 5 messages/month
  PREMIUM: 100, // Premium users with AI subscription: 100/month
};

// RevenueCat entitlement IDs that grant AI access (100 messages/month)
const AI_ENTITLEMENTS = [
  "ai", // AI subscription entitlement (monthly/yearly)
];

// RevenueCat entitlement/product IDs that grant game features
const PRO_ENTITLEMENTS = [
  "pro", // Game features entitlement (subscription + one-time)
  "ai", // AI subscription also includes game features
  "digital_banker_pro", // One-time purchase (legacy)
  "digital_banker_pro_v2", // One-time purchase (current)
];

// ---------- Helper: Verify AI and Pro status ----------
async function verifyUserStatus(
  userId: string,
  clientReportedPro: boolean,
  activeEntitlements?: string[]
): Promise<{ hasAI: boolean; hasPro: boolean }> {
  try {
    let hasAI = false;
    let hasPro = clientReportedPro;

    // If client provides entitlement list, verify server-side
    if (activeEntitlements && activeEntitlements.length > 0) {
      // Check for AI subscription (100 messages/month)
      hasAI = activeEntitlements.some((entitlement) =>
        AI_ENTITLEMENTS.includes(entitlement)
      );

      // Check for Pro game features
      hasPro = activeEntitlements.some((entitlement) =>
        PRO_ENTITLEMENTS.includes(entitlement)
      );
    }

    // Store status in Firestore for audit trail
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          hasAI,
          hasPro,
          activeEntitlements: activeEntitlements || [],
          lastVerified: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return { hasAI, hasPro };
  } catch (error) {
    logger.error("Error verifying user status", error);
    // On error, trust client-reported status (fail open for better UX)
    return { hasAI: false, hasPro: clientReportedPro };
  }
}

// ---------- Helper: Check and update AI usage ----------
async function checkAndUpdateAIUsage(
  userId: string,
  isPremium: boolean
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const currentMonth = `${now.getFullYear()}-${String(monthNum).padStart(
    2,
    "0"
  )}`;

  const usageRef = db.collection("aiUsage").doc(userId);

  try {
    const result = await db.runTransaction(
      async (transaction: admin.firestore.Transaction) => {
        const doc = await transaction.get(usageRef);
        const limit = isPremium ? AI_LIMITS.PREMIUM : AI_LIMITS.FREE;

        let currentUsage = 0;
        let storedMonth = currentMonth;

        if (doc.exists) {
          const data = doc.data();
          storedMonth = data?.month || currentMonth;
          currentUsage = data?.count || 0;

          // Reset counter if it's a new month
          if (storedMonth !== currentMonth) {
            currentUsage = 0;
            storedMonth = currentMonth;
          }
        }

        // Check if user has exceeded limit
        if (currentUsage >= limit) {
          return {
            allowed: false,
            remaining: 0,
            limit,
          };
        }

        // Increment usage
        transaction.set(usageRef, {
          month: storedMonth,
          count: currentUsage + 1,
          lastUsed: admin.firestore.FieldValue.serverTimestamp(),
          isPremium,
        });

        return {
          allowed: true,
          remaining: limit - (currentUsage + 1),
          limit,
        };
      }
    );

    return result;
  } catch (error) {
    logger.error("Error checking AI usage", error);
    throw new HttpsError("internal", "Failed to check AI usage limits");
  }
}

// ---------- Helper: calculate player metrics ----------
function calculateMetrics(players: any[]) {
  const results = players.map((p: any) => {
    const houseCount = (p.properties || []).reduce(
      (sum: number, prop: any) => sum + (prop.hotel ? 0 : prop.houses || 0),
      0
    );
    const hotelCount = (p.properties || []).reduce(
      (sum: number, prop: any) => sum + (prop.hotel ? 1 : 0),
      0
    );

    // Rough net worth approximation without property price data
    const houseValue = houseCount * 50;
    const hotelValue = hotelCount * 100;
    const netWorth = (p.balance || p.cash || 0) + houseValue + hotelValue;

    return {
      name: p.name || "Player",
      cash: p.balance || p.cash || 0,
      netWorth,
      properties: p.properties?.length || 0,
      houses: houseCount,
      hotels: hotelCount,
    };
  });

  const totalWorth = results.reduce(
    (sum: number, p: any) => sum + p.netWorth,
    0
  );

  return results.map((p: any) => ({
    ...p,
    winPercent: totalWorth ? Math.round((p.netWorth / totalWorth) * 100) : 0,
  }));
}

// ---------- Callable AI Function ----------
export const analyzeMonopolyGame = onCall(
  { secrets: [GOOGLE_API_KEY] },
  async (request: CallableRequest) => {
    const { gameId, message, userId, isPremium, activeEntitlements } =
      request.data;

    if (!gameId || !message || !userId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: gameId, message, or userId"
      );
    }

    // 1️⃣ Verify AI subscription and Pro status
    const userStatus = await verifyUserStatus(
      userId,
      isPremium || false,
      activeEntitlements
    );

    logger.info(
      `User ${userId} - AI: ${userStatus.hasAI}, Pro: ` + `${userStatus.hasPro}`
    );

    // 2️⃣ Check AI usage limits BEFORE calling Gemini
    // Users with AI subscription get 100 messages/month
    // Without AI subscription (one-time purchase) get 5 messages/month
    const usageCheck = await checkAndUpdateAIUsage(userId, userStatus.hasAI);

    if (!usageCheck.allowed) {
      const limitMsg =
        "AI usage limit reached. You've used all " +
        `${usageCheck.limit} messages this month. `;
      const upsellMsg = userStatus.hasAI ?
        "Your limit will reset next month." :
        "Subscribe to AI Chat for 100 messages/month! " +
          "Only $1.99/month or $14.99/year.";

      throw new HttpsError("resource-exhausted", limitMsg + upsellMsg);
    }

    logger.info(
      `AI usage: ${usageCheck.remaining}/${usageCheck.limit} ` +
        `remaining for user ${userId}`
    );

    // Initialize Gemini INSIDE the function
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY.value());

    // 3️⃣ Load players
    const playersSnap = await db.collection(`games/${gameId}/players`).get();
    const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const metrics = calculateMetrics(players);

    // 4️⃣ AI prompt
    const prompt = `
You are a helpful Monopoly assistant for the Digital Banker app.

Current game metrics:
${JSON.stringify(metrics, null, 2)}

User question:
"${message}"

Digital Banker App Guide (answer app usage questions):
- **Buy Property**: Tap player → "Buy Property" → amount → confirm
- **Sell Property**: Tap player → "Sell Property" → amount → confirm
- **Add Houses/Hotels**: Tap player → "Add House/Hotel" → property
- **Remove Houses/Hotels**: Tap player → "Remove House/Hotel"
- **Pass GO**: Tap player → "Pass GO" → gets $200
- **Pay/Receive**: Tap player → "Pay" or "Receive" → amount
- **Game Variants**: Set in Host Setup (Free Parking, etc.)
- **AI Chat**: Ask me strategy or app questions!

Instructions:
1. Answer app questions with clear steps from guide above
2. Answer strategy questions using current game metrics
3. Be conversational, helpful, and concise but snarky to players losing
4. Keep response under 200 characters when possible
5. Use actual player names when discussing game state

Examples:
App: "Tap the player → 'Buy Property' → enter amount!"
Game: "[Answer]. [Player] is leading with $[amount]."
`;

    logger.info("Sending prompt to Gemini");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return {
        reply: response,
        leaderboard: metrics,
        usage: {
          remaining: usageCheck.remaining,
          limit: usageCheck.limit,
          hasAI: userStatus.hasAI,
          hasPro: userStatus.hasPro,
        },
      };
    } catch (err: any) {
      logger.error("Gemini call failed", err);
      throw new HttpsError(
        "internal",
        "AI unavailable. Check function logs for details."
      );
    }
  }
);
// ---------- End of File ----------
