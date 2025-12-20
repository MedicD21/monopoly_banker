import { HttpsError, onCall } from "firebase-functions/v2/https";
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
  async (request) => {
    const { gameId, message } = request.data;

    if (!gameId || !message) {
      throw new HttpsError("invalid-argument", "Missing gameId or message");
    }

    // Initialize Gemini INSIDE the function
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY.value());

    // 1️⃣ Load players
    const playersSnap = await db.collection(`games/${gameId}/players`).get();
    const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const metrics = calculateMetrics(players);

    // 2️⃣ AI prompt
    const prompt = `
You are a Monopoly game analyst.

Rules:
- Standard US Monopoly rules
- Explain strategy, risk, and momentum but only if asked.
- NEVER invent game data
- if not asked any rules then skip this section.

Current game metrics:
${JSON.stringify(metrics, null, 2)}
- Only game metrics with no other text.

User question:
"${message}"

Respond with:
- Plain english answer to user question. 
- Keep answer short and concise under 100 characters.
- Don't ask follow up questions unless required for a rule explaination. 

`;

    logger.info("Sending prompt to Gemini");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return {
        reply: response,
        leaderboard: metrics,
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
