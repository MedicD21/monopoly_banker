# Debug Guide: Testing Pro IAP Features

## Steps to Test:

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Browser
Open: http://localhost:5173

### 3. Navigate to Multiplayer Lobby
1. Click **"Host Game"** button on home screen
2. Configure game settings (any settings are fine)
3. Click **"Create Game"**
4. You should now be in the **Lobby Screen**

### 4. Verify Pro Features Section Exists
In the lobby, you should see these sections (in order):
- ✅ Join Code (with QR code)
- ✅ Your Setup (name, piece, color selection)
- ✅ **Game Variants** ← THIS IS THE PRO SECTION!
- ✅ Players List

### 5. What You Should See in "Game Variants"

**Without Pro (default):**
- Section title "Game Variants"
- Gold banner saying "Unlock Pro Features"
- "Upgrade to Pro • $1.99" button
- 4 greyed-out settings with lock icons:
  - Free Parking Jackpot
  - Double GO Bonus
  - Property Auctions
  - Speed Die Mode

**With Pro:**
- Section title "Game Variants" with crown badge
- All 4 settings enabled with toggle switches
- No banner/upgrade button

### 6. How to Enable Pro for Testing

**Option A: Use the UI**
1. Click the "Upgrade to Pro" button
2. Click "Purchase Pro • $1.99" in the modal
3. Features unlock immediately

**Option B: Use Console**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.setItem('digital_banker_pro_v2', 'true')`
4. Refresh the page
5. Pro features should now be unlocked

### 7. How to Disable Pro
In browser console:
```javascript
localStorage.removeItem('digital_banker_pro_v2')
```
Then refresh.

## Troubleshooting

### "I don't see Game Variants section"
- Make sure you clicked "Host Game", not "Join Game"
- Make sure you're in the lobby (should see join code and players list)
- Check browser console for errors

### "Page won't load"
```bash
# Clear build and restart
rm -rf dist node_modules/.vite
npm run dev
```

### "Changes not showing"
```bash
# Hard refresh in browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

## File Locations
- Pro Context: `src/context/ProContext.tsx`
- Pro Modal: `src/components/ProPurchaseModal.tsx`
- Lobby with Settings: `src/components/LobbyScreen.tsx` (line 245-381)
- Game Settings Handler: `src/pages/LobbyPage.tsx`
