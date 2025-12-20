# How to Deploy Your Chatbot (Step-by-Step)

## ⚠️ Can't Find Secrets in Firebase Console?

Don't worry! Use **Google Cloud Console** instead - it's more reliable.

---

## 🚀 Complete Deployment Guide

### STEP 1: Get Your Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"** (or "Get API Key")
3. Select **"Create API key in new project"** or use an existing project
4. **Copy the API key** (starts with `AIza...`)
5. Keep this tab open - you'll need it in Step 2

---

### STEP 2: Add Secret to Google Cloud

**Go to Google Cloud Secret Manager:**

1. Visit: https://console.cloud.google.com/security/secret-manager
2. At the top, select your project: **monopoly-banker-2c367**
3. Click **"+ CREATE SECRET"** (blue button at top)

**Fill in the form:**

4. **Name**: `GOOGLE_API_KEY` (exact spelling, all caps)
5. **Secret value**: Paste your Gemini API key from Step 1
6. Leave everything else as default
7. Click **"CREATE SECRET"** at the bottom

**Grant Access to Cloud Functions:**

8. After creating, you'll see the secret details page
9. Click the **"PERMISSIONS"** tab
10. Click **"+ GRANT ACCESS"**
11. In "New principals", enter:
   ```
   monopoly-banker-2c367@appspot.gserviceaccount.com
   ```
12. In "Role", search for and select: **"Secret Manager Secret Accessor"**
13. Click **"SAVE"**

✅ Secret is now configured!

---

### STEP 3: Deploy the Cloud Function

**Option A: Using GitHub (If you have GitHub Actions set up)**

Just push your code:
```bash
git add .
git commit -m "Add chatbot with Gemini AI"
git push
```

If you have GitHub Actions configured for Firebase, it will auto-deploy.

**Option B: From Your Local Machine (Not Codespaces)**

If you have the project on your local computer:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to your project
cd /path/to/monopoly_banker

# Deploy only the functions
firebase deploy --only functions
```

**Option C: Manual Deploy via Firebase Console**

1. Go to: https://console.firebase.google.com/project/monopoly-banker-2c367/functions
2. Click **"Create function"** or **"Deploy"**
3. Upload the `cloud-functions` folder
4. The function name should be: `analyzeMonopolyGame`

---

### STEP 4: Verify Deployment

1. Go to: https://console.firebase.google.com/project/monopoly-banker-2c367/functions
2. You should see: **`analyzeMonopolyGame`** in the functions list
3. Status should be: **Active** (green)

---

### STEP 5: Test the Chatbot

1. Open your app: http://localhost:5175/
2. Click the **"Rules Chat"** button (blue button)
3. **Without a game**: Ask "How do I get out of jail?"
4. **With a multiplayer game**: Ask "Who is winning?"

---

## 🐛 Troubleshooting

### "Secret GOOGLE_API_KEY is not defined"

- Make sure you named it exactly: `GOOGLE_API_KEY` (all caps)
- Check that you granted access to the service account
- Redeploy the function after creating the secret

### "Permission denied" or "Unauthenticated"

- Enable billing in Google Cloud (Gemini requires it, but has a free tier)
- Make sure the service account has Secret Manager Secret Accessor role

### Function not deploying

- Check Firebase Console → Functions → Logs for errors
- Make sure billing is enabled
- Verify `cloud-functions/lib/index.js` exists (it does!)

### Still can't find Secret Manager?

Direct links:
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=monopoly-banker-2c367
- Firebase Functions: https://console.firebase.google.com/project/monopoly-banker-2c367/functions
- Billing: https://console.cloud.google.com/billing?project=monopoly-banker-2c367

---

## 📊 Current Status

✅ Chatbot UI created
✅ Cloud function code written
✅ Dependencies installed
✅ Function compiled (`cloud-functions/lib/index.js`)
⏳ Secret needs to be set (STEP 2)
⏳ Function needs to be deployed (STEP 3)

---

## 💡 Quick Reference

- **Secret name**: `GOOGLE_API_KEY`
- **Function name**: `analyzeMonopolyGame`
- **Region**: us-central1
- **Get API key**: https://aistudio.google.com/app/apikey
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager

---

Need help? The chatbot is fully coded and ready - just needs the API key and deployment!
