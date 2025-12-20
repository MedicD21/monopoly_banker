# Chatbot Setup Guide

Your Monopoly Rules Chatbot is ready! Follow these steps to activate it.

## ✅ What's Already Done:

1. ✅ Chatbot UI integrated (click "Rules Chat" button)
2. ✅ Firebase Cloud Function created (`analyzeMonopolyGame`)
3. ✅ Gemini AI integration coded
4. ✅ Cloud Functions dependencies installed

## 🔧 Setup Steps:

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza...`)

### Step 2: Add the API Key to Firebase

**Option A: Via Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **monopoly-banker-2c367**
3. In the left menu, click **Functions**
4. Click the **Secrets** tab
5. Click **+ Add Secret**
6. Enter:
   - Secret name: `GOOGLE_API_KEY`
   - Secret value: Your Gemini API key from Step 1
7. Click **Save**

**Option B: Via Command Line (If you have Firebase CLI access)**

```bash
# From your local machine (not in Codespaces)
firebase login
firebase functions:secrets:set GOOGLE_API_KEY
# Paste your Gemini API key when prompted
```

### Step 3: Deploy the Cloud Function

**Option A: Via Firebase Console**

1. In Firebase Console, go to **Functions**
2. The `analyzeMonopolyGame` function should appear once you deploy

**Option B: Via Command Line**

```bash
# Build the function
cd cloud-functions
npm run build

# Deploy (requires authentication)
firebase deploy --only functions
```

**Option C: Deploy via GitHub Actions**

If your repository has GitHub Actions set up for Firebase deployment, push your changes and the function will auto-deploy.

### Step 4: Test the Chatbot

1. Make sure your app is running: `npm run dev`
2. Open the app in your browser
3. Click the **"Rules Chat"** button (blue button next to History)
4. For game-specific questions:
   - Start or join a multiplayer game first
   - Ask "Who is winning?"
5. For general rules:
   - Ask "How do I get out of jail?"
   - Ask "How do mortgages work?"

## 🎮 Example Questions:

### With a Multiplayer Game:
- "Who is winning right now?"
- "What should my strategy be?"
- "Should I buy Park Place?"
- "Who has the most properties?"

### General Rules (No game needed):
- "How do I get out of jail?"
- "What happens on Free Parking?"
- "How do mortgages work?"
- "When can I buy houses?"
- "What's the best strategy?"

## 🐛 Troubleshooting:

### Chatbot shows "Failed to get a response"
- Check that you set the `GOOGLE_API_KEY` secret in Firebase
- Verify the cloud function is deployed (check Firebase Console → Functions)
- Make sure billing is enabled (Gemini requires it, but has a free tier)

### "Start or join a multiplayer game"
- This message appears for game-specific questions when not in a game
- General rules questions will still work

### Browser Console Errors
- Open browser DevTools (F12) to see detailed error messages
- Common: `UNAUTHENTICATED` means the secret isn't set
- Common: `PERMISSION_DENIED` means billing needs to be enabled

## 💰 Costs:

Gemini 1.5 Pro is very affordable:
- **Free tier**: 15 requests per minute
- **Paid**: ~$0.001 per typical question
- For casual use, you'll likely stay in the free tier!

## 📁 Files:

- Chatbot UI: `src/components/ChatbotModal.tsx`
- Cloud Function: `cloud-functions/src/index.ts`
- Button: `src/components/BankerHeader.tsx` (line 45-50)
- Integration: `monopoly.tsx` (line 125-160)

---

**Need help?** Check the detailed guide: `cloud-functions/GEMINI_SETUP.md`
