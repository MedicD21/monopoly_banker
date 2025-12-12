# Monopoly Banker - Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "monopoly-banker" (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in **test mode**" (we'll secure it later)
4. Select a location (choose one close to your users)
5. Click "Enable"

## Step 3: Set Up Realtime Database

1. In Firebase Console, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in **test mode**"
4. Click "Enable"

## Step 4: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the **web icon** (</>) to add a web app
5. Enter app nickname: "Monopoly Banker Web"
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 5: Add Configuration to Your Project

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase values:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=monopoly-banker-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=monopoly-banker-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=monopoly-banker-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
   ```

3. **IMPORTANT**: `.env` is in `.gitignore` - never commit it!

## Step 6: Test the App Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser

## Step 7: Deploy to Netlify

### Option A: Connect GitHub Repository

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables (same as your `.env` file):
   - Click "Site settings" → "Environment variables"
   - Add each `VITE_FIREBASE_*` variable
7. Click "Deploy"

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Step 8: Update Firebase Security Rules (Production)

Once everything works, secure your Firebase:

### Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection
    match /games/{gameId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null || true; // Relax for now

      // Players sub-collection
      match /players/{playerId} {
        allow read: if true;
        allow write: if true;
      }

      // Events sub-collection
      match /events/{eventId} {
        allow read: if true;
        allow create: if true;
      }
    }
  }
}
```

### Realtime Database Rules:
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Troubleshooting

### "Firebase not configured" error
- Check that all `VITE_FIREBASE_*` variables are set in `.env`
- Restart dev server after adding `.env` file

### "Permission denied" errors
- Make sure Firebase rules are in "test mode"
- Check Firebase Console → Firestore/Realtime Database → Rules

### QR codes not scanning properly
- Make sure you're using HTTPS (Netlify provides this automatically)
- Test with your actual deployed URL, not localhost

## Next Steps

Once deployed, you can:
- Share the game code or QR code with friends
- Each player joins on their own device
- Real-time multiplayer works across all devices!

Need help? Check the Firebase docs or reach out!
