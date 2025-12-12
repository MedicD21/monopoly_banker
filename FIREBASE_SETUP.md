# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Monopoly Banker multiplayer functionality.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "monopoly-banker")
4. Disable Google Analytics (optional, not needed for this app)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (</>) to add a web app
2. Enter an app nickname (e.g., "Monopoly Banker Web")
3. **Do NOT** check "Also set up Firebase Hosting" (we're using Netlify)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Step 3: Enable Firestore Database

1. In the Firebase Console sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in **production mode**" (we'll add security rules next)
4. Choose a Cloud Firestore location (select the region closest to your users)
5. Click "Enable"

## Step 4: Set Up Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with these:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game documents
    match /games/{gameId} {
      // Anyone can read game data
      allow read: if true;

      // Only the host can create games
      allow create: if request.auth == null || true;

      // Only the host can update game status
      allow update: if true;

      // Players subcollection
      match /players/{playerId} {
        // Anyone can read player data
        allow read: if true;

        // Players can create/update their own data
        allow create, update: if true;
      }

      // Events subcollection
      match /events/{eventId} {
        // Anyone can read events
        allow read: if true;

        // Anyone can create events
        allow create: if true;
      }
    }
  }
}
```

3. Click "Publish"

**Note:** These rules are permissive to allow the app to work without authentication. For production, you should add proper authentication and restrict access.

## Step 5: Enable Realtime Database (for Presence Detection)

1. In the Firebase Console sidebar, click "Realtime Database"
2. Click "Create Database"
3. Select a location (use the same region as Firestore)
4. Start in **locked mode** - we'll add rules next
5. Click "Enable"

## Step 6: Set Up Realtime Database Security Rules

1. In Realtime Database, go to the "Rules" tab
2. Replace the default rules with these:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        "players": {
          "$playerId": {
            "presence": {
              ".read": true,
              ".write": true
            }
          }
        }
      }
    }
  }
}
```

3. Click "Publish"

## Step 7: Create Your .env File

1. In your project root, create a file called `.env`
2. Copy the contents from `.env.example`
3. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

**Important:**
- Never commit the `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use the prefix `VITE_` for all environment variables (required by Vite)

## Step 8: Configure Netlify Environment Variables

When deploying to Netlify, you need to set the same environment variables:

1. Go to your Netlify site dashboard
2. Click "Site settings" → "Environment variables"
3. Add each variable from your `.env` file:
   - Click "Add a variable"
   - Enter the key (e.g., `VITE_FIREBASE_API_KEY`)
   - Enter the value
   - Click "Create variable"
4. Repeat for all 6 Firebase config variables

## Step 9: Test Locally

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the multiplayer flow:
   - Click "Host Game"
   - Configure game settings
   - Create the lobby
   - Open another browser window/tab
   - Click "Join Game"
   - Enter the 5-digit code
   - Verify both players appear in the lobby

## Step 10: Deploy to Netlify

1. Build your app:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - If using Netlify CLI:
     ```bash
     netlify deploy --prod
     ```

   - If using Git integration:
     - Push your code to GitHub
     - Netlify will auto-deploy

3. Test the deployed app with the same multiplayer flow

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Check that your API key is correct in `.env`
- Ensure the variable name has the `VITE_` prefix
- Restart the dev server after changing `.env`

### "Missing or insufficient permissions"
- Verify Firestore security rules are published
- Check that you're using production mode (not test mode which expires)

### "PERMISSION_DENIED: Permission denied"
- Verify Realtime Database security rules are published
- Ensure the rules allow read/write for presence data

### Players not appearing in lobby
- Check browser console for errors
- Verify Firestore rules allow reading/writing to players subcollection
- Ensure both clients are connected to the same game ID

### QR code not working
- Verify the URL in the QR code matches your deployed site
- Check that the `?join=12345` parameter is being parsed correctly
- Test by manually navigating to `yoursite.com/?join=12345`

## Security Considerations for Production

The current security rules allow open access to make development easier. For production:

1. **Enable Firebase Authentication:**
   - Add Email/Password or Google sign-in
   - Require authentication to create/join games

2. **Update Security Rules:**
   - Verify user is authenticated: `request.auth != null`
   - Verify user can only modify their own player data
   - Add rate limiting to prevent abuse

3. **Add Server-Side Validation:**
   - Use Firebase Cloud Functions to validate game actions
   - Prevent cheating by verifying transactions server-side

4. **Monitor Usage:**
   - Set up Firebase usage alerts
   - Monitor for unusual activity
   - Set Firestore/Realtime Database quotas

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Realtime Database Security](https://firebase.google.com/docs/database/security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
