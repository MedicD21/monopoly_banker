# Troubleshooting Guide

## ERR_BLOCKED_BY_CLIENT Errors

### What These Errors Mean
The `ERR_BLOCKED_BY_CLIENT` errors you're seeing in the console are caused by browser extensions (usually ad blockers or privacy extensions) blocking some Firebase requests.

### Impact
- **Low Impact:** These are non-critical Firebase internal requests
- The app should still work fine for gameplay
- Data sync should continue functioning
- Only affects some background analytics/tracking

### Solutions

**Option 1: Disable Ad Blocker (Recommended for Testing)**
1. Disable your ad blocker extension temporarily
2. Refresh the page
3. Errors should disappear

**Option 2: Whitelist localhost**
1. In your ad blocker settings
2. Add `localhost` to whitelist
3. Refresh the page

**Option 3: Use Incognito Mode**
1. Open browser in incognito/private mode
2. Extensions are usually disabled by default
3. Test the app there

**Option 4: Ignore Them**
- If the app works fine, you can ignore these errors
- They don't affect core functionality

## Common Issues & Solutions

### Issue: "Loading game..." Screen Stuck

**Possible Causes:**
1. Firebase credentials not set up
2. Network connectivity issues
3. Firestore rules blocking access

**Solutions:**
1. Check `.env` file exists with correct Firebase credentials
2. Verify Firebase project is set up (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
3. Check Firestore rules in Firebase Console
4. Open browser console to see actual error messages

### Issue: Players Not Syncing

**Symptoms:**
- Created game but joining players don't appear
- Balance changes don't sync across devices

**Solutions:**
1. Check Firestore rules allow read/write access
2. Verify all clients are using same game code
3. Check browser console for Firebase errors
4. Ensure all devices have internet connection
5. Try refreshing all browser windows

### Issue: "Game not found" Error

**Possible Causes:**
1. Invalid game code entered
2. Game expired/deleted
3. Firebase connection issues

**Solutions:**
1. Double-check the 5-digit code
2. Ensure host created the game successfully
3. Check Firebase Console to verify game exists
4. Try creating a new game

### Issue: Page Refresh Loses Game

**Expected Behavior:**
- Currently, refreshing during game setup might lose progress
- Once in the game, player data should persist

**Solutions:**
1. Avoid refreshing during lobby/setup
2. Once game started, refresh should reconnect
3. If stuck, navigate back to home and rejoin with code

### Issue: Can't Click Buttons / UI Not Responding

**Possible Causes:**
1. JavaScript error in console
2. React rendering issue
3. Firebase sync conflict

**Solutions:**
1. Check browser console for errors
2. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache
4. Try different browser

## Testing Checklist

When testing multiplayer, verify:

- [ ] Host can create game and get code
- [ ] Join screen accepts 5-digit code
- [ ] Players appear in lobby
- [ ] Piece/color selection works
- [ ] Ready button toggles status
- [ ] Start game navigates all players
- [ ] All players see each other's data
- [ ] Balance updates sync in real-time
- [ ] Dice rolls show on all screens
- [ ] Property purchases sync
- [ ] Rent payments work correctly

## Browser Console Tips

### Viewing Console
- **Chrome/Edge:** Press F12 → Console tab
- **Firefox:** Press F12 → Console tab
- **Safari:** Develop menu → Show JavaScript Console

### Filtering Errors
1. Look for red error messages (ignore yellow warnings)
2. Ignore `ERR_BLOCKED_BY_CLIENT` errors
3. Focus on Firebase or application errors

### Useful Console Commands

Check if Firebase is connected:
```javascript
console.log('Firebase initialized:', !!window.firebase);
```

Check current game context:
```javascript
// In React DevTools console
$r.props // Shows current component props
```

## Performance Issues

### Issue: App Running Slow

**Solutions:**
1. Close unnecessary browser tabs
2. Disable browser extensions
3. Check network speed
4. Clear browser cache
5. Use Chrome/Edge for best performance

### Issue: Lag When Rolling Dice

**Expected:**
- Dice animation takes ~1 second
- This is intentional for visual effect

**If Excessive:**
1. Check CPU usage
2. Close other applications
3. Reduce number of open browser windows

## Network Issues

### Issue: Offline/No Internet

**Current Behavior:**
- App requires internet for Firebase
- Offline mode not yet implemented

**Workaround:**
- Ensure stable internet connection
- Test on reliable WiFi network
- Avoid mobile hotspots for initial testing

### Issue: Slow Connection

**Symptoms:**
- Delays in sync (>2 seconds)
- Loading screens take long time

**Solutions:**
1. Test with faster internet
2. Reduce number of players (test with 2-3 first)
3. Check Firebase region matches your location
4. Try different time of day (off-peak)

## Firebase Console Debugging

### Viewing Game Data

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Navigate to `games` collection
5. Find your game by code

### Checking Players

1. In Firestore, open your game document
2. Expand `players` subcollection
3. Verify player data is correct
4. Check `balance`, `properties`, etc.

### Viewing Events

1. In your game document
2. Open `events` subcollection
3. See all game actions logged
4. Use for debugging transaction issues

## Local Development Issues

### Issue: "Module not found" Errors

**Solutions:**
1. Run `npm install` to install dependencies
2. Delete `node_modules` and run `npm install` again
3. Check for typos in import paths

### Issue: Build Fails

**Solutions:**
1. Check for TypeScript errors
2. Verify all imports are correct
3. Run `npm run build` and read error messages
4. Check [PHASE3_COMPLETE.md](PHASE3_COMPLETE.md) for known issues

### Issue: Hot Reload Not Working

**Solutions:**
1. Stop dev server (Ctrl+C)
2. Restart with `npm run dev`
3. Check file watcher limits (Linux)
4. Try hard refresh in browser

## Getting Help

### Information to Include

When reporting issues, include:
1. Browser and version
2. Operating system
3. Error messages from console (screenshot)
4. Steps to reproduce
5. What you expected vs what happened

### Useful Debug Info

Run this in browser console and share output:
```javascript
{
  browser: navigator.userAgent,
  firebase: typeof firebase !== 'undefined',
  reactVersion: React.version,
  url: window.location.href
}
```

## Still Having Issues?

1. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for setup steps
2. Review [PHASE3_COMPLETE.md](PHASE3_COMPLETE.md) for known limitations
3. Try the "Nuclear Option" below

### Nuclear Option: Fresh Start

If nothing works:
1. Clear all browser data for localhost
2. Delete `.env` file
3. Run `npm install` again
4. Rebuild `.env` with Firebase credentials
5. Restart dev server
6. Try in clean incognito window
