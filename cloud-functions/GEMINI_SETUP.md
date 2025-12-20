# Gemini AI Setup for Monopoly Banker

The chatbot uses Google's Gemini AI to answer Monopoly rules questions and analyze game state.

## How It Works

The chatbot is connected to Gemini through Firebase Cloud Functions:

1. **Frontend**: User types a question in the chatbot modal
2. **Firebase Function**: The `analyzeMonopolyGame` function in `cloud-functions/src/index.ts` receives the message
3. **Gemini AI**: The function calls Google's Gemini 1.5 Pro model with:
   - The user's question
   - Current game state (player balances, properties, houses, hotels)
   - Monopoly rules context
4. **Response**: Gemini generates a helpful response explaining rules or analyzing the game

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated API key

### 2. Configure Firebase Functions Secret

The Gemini API key is stored as a Firebase secret for security. Set it up using:

```bash
# Navigate to your project root
cd /workspaces/monopoly_banker

# Set the secret (Firebase will prompt you to paste your API key)
firebase functions:secrets:set GOOGLE_API_KEY
```

When prompted, paste your Gemini API key.

### 3. Deploy the Function

```bash
# Build and deploy the cloud function
cd cloud-functions
npm install
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

### 4. Test the Chatbot

1. Start your dev server: `npm run dev`
2. Click the "Rules Chat" button
3. Start or join a multiplayer game for game-specific analysis
4. Ask questions like:
   - "Who is winning right now?"
   - "What should I do next?"
   - "How do I get out of jail?"
   - "Explain mortgage rules"

## Function Details

The `analyzeMonopolyGame` function:
- **Location**: `cloud-functions/src/index.ts`
- **Model**: Gemini 1.5 Pro
- **Region**: us-central1
- **Cost**: Uses Firebase project billing (Gemini has a generous free tier)

### What It Analyzes:
- Player cash balances
- Net worth (cash + property value)
- Number of properties owned
- Houses and hotels built
- Win percentages

### Example Prompts:
- "Who is winning?" → Analyzes all players and explains who's ahead
- "Should I buy Boardwalk?" → Strategic advice based on game state
- "How do I win from here?" → Personalized strategy recommendations

## Troubleshooting

### Error: "AI unavailable"
- Make sure you set the `GOOGLE_API_KEY` secret
- Check function logs: `firebase functions:log`
- Verify the function is deployed: `firebase functions:list`

### Error: "Missing gameId or message"
- For game analysis, you need to be in a multiplayer game
- For general rules, the chatbot provides static guidance

### No response from chatbot
- Open browser console to see error details
- Check that Firebase Functions are enabled in your project
- Verify billing is enabled (required for Gemini API calls)

## Cost Information

Gemini 1.5 Pro pricing (as of Dec 2024):
- Free tier: 15 requests per minute
- Paid: $0.00125 per 1K characters for prompts under 128K

For typical Monopoly questions, costs are minimal (~$0.001 per question).
