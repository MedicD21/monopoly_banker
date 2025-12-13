# App Store Submission Checklist

Complete checklist for submitting Digital Banker to the Apple App Store and Google Play Store.

## Pre-Submission Requirements

### 1. Code & Build Quality
- [x] All unused files removed (backup files, debug docs, test images)
- [x] Debug console.log statements removed from production code
- [x] Production build succeeds without errors (`npm run build`)
- [x] iOS build synced (`npx cap sync ios`)
- [x] Android build synced (`npx cap sync android`)
- [x] No TypeScript compilation errors
- [x] All dependencies up to date and legitimate

### 2. In-App Purchase Setup
- [ ] RevenueCat account created
- [ ] iOS product created in App Store Connect (`digital_banker_pro`)
- [ ] Android product created in Google Play Console (if publishing to Android)
- [ ] RevenueCat entitlements configured (`pro` entitlement)
- [ ] RevenueCat API keys added to `.env` file
- [ ] IAP tested with sandbox account
- [ ] Restore purchases tested and working

### 3. Firebase Configuration
- [x] Firebase project created
- [x] Firestore database configured
- [x] Firebase credentials in `.env` file
- [ ] Firebase security rules reviewed and production-ready
- [ ] Firebase usage limits appropriate for expected traffic

### 4. App Configuration
- [x] App ID set correctly: `com.dushin.digitalbanker.app`
- [x] App name: "Digital Banker"
- [ ] Version number set (e.g., 1.0.0)
- [ ] Build number set
- [ ] App icon assets generated (all sizes)
- [ ] Splash screen configured
- [ ] Safe area insets handled for notched devices

### 5. Legal & Compliance
- [ ] Privacy Policy created and accessible
- [ ] Terms of Service created (if needed)
- [ ] App description written
- [ ] App keywords chosen (for App Store)
- [ ] Screenshots prepared (all required sizes)
- [ ] App preview video (optional but recommended)

## iOS App Store Submission

### 1. Xcode Configuration
1. Open project in Xcode:
   ```bash
   npx cap open ios
   ```

2. Configure signing:
   - Select your team in **Signing & Capabilities**
   - Ensure **Automatic Signing** is enabled
   - Bundle Identifier: `com.dushin.digitalbanker.app`

3. Set version and build number:
   - General > Identity > Version: `1.0.0`
   - General > Identity > Build: `1`

4. Add capabilities:
   - [x] In-App Purchase (should be auto-added by RevenueCat)

5. Configure App Icon:
   - Add icon assets to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 2. Build & Archive
1. Select **Any iOS Device** as target
2. Product > Archive
3. Wait for archive to complete
4. Click **Distribute App**
5. Select **App Store Connect**
6. Upload build

### 3. App Store Connect Configuration
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. My Apps > Digital Banker
3. Fill out all required information:
   - **App Information**:
     - Name: Digital Banker
     - Subtitle: Monopoly Banking Made Easy
     - Category: Games > Board
     - Content Rights: (your info)

   - **Pricing and Availability**:
     - Price: Free
     - Availability: All countries

   - **App Privacy**:
     - Data collection: Document what data you collect
     - Link to privacy policy

   - **Version Information**:
     - Screenshots (required sizes: 6.7", 6.5", 5.5")
     - Description
     - Keywords
     - Support URL
     - Marketing URL (optional)
     - Version: 1.0.0
     - Copyright
     - Age Rating (select EVERYONE)

4. Select your uploaded build
5. Submit for review

### 4. Review Notes
Add these notes for App Review:

```
Digital Banker is a companion app for playing Monopoly. It helps players track money and property transactions during board game sessions.

KEY FEATURES:
- Create and join games with other players
- Track player balances and property ownership
- Handle rent payments and property trades
- Pass GO and collect money
- Free Parking jackpot (optional rule)
- Property auctions
- Transaction history

TESTING THE APP:
1. Tap "Start Game" on home screen
2. Configure game settings
3. Add players and select game pieces
4. Start the game
5. Use the banking interface to manage money and properties

PRO FEATURES (In-App Purchase):
The Pro version unlocks:
- Unlimited multiplayer games
- Advanced property management
- Custom game rules
- No ads

Test Account for IAP (if needed):
- Use Apple's Sandbox environment
- Test account: [your sandbox test email]

No demo account needed - the app works in local mode without sign-in.
```

## Android Play Store Submission (Optional)

### 1. Build Configuration
1. Open in Android Studio:
   ```bash
   npx cap open android
   ```

2. Build signed AAB:
   - Build > Generate Signed Bundle / APK
   - Select Android App Bundle
   - Create or use existing keystore
   - Build release variant

### 2. Play Console Setup
1. Go to [Play Console](https://play.google.com/console/)
2. Create application
3. Fill out store listing:
   - App name: Digital Banker
   - Short description
   - Full description
   - App icon (512x512)
   - Screenshots
   - Feature graphic (1024x500)
   - Category: Board Games
   - Content rating questionnaire
   - Privacy policy URL

4. Upload AAB
5. Submit for review

## Post-Submission

### Monitor Status
- [ ] Check App Store Connect for review status
- [ ] Respond to any rejection feedback promptly
- [ ] Test the live app once approved

### Marketing
- [ ] Announce launch on social media
- [ ] Create app website or landing page
- [ ] Request reviews from initial users
- [ ] Monitor user feedback and ratings

## Common Rejection Reasons & Fixes

### 1. Incomplete App Information
- **Fix**: Ensure all required fields in App Store Connect are filled
- Double-check screenshots show actual app content

### 2. Privacy Policy Issues
- **Fix**: Privacy policy must cover all data collection
- Must be accessible from within the app
- Must mention in-app purchases

### 3. In-App Purchase Issues
- **Fix**: Ensure IAP product is approved before app submission
- Test restore purchases functionality
- Clearly describe what Pro features unlock

### 4. Crash on Launch
- **Fix**: Test on real device before submission
- Check all environment variables are set
- Ensure Firebase is configured correctly

### 5. Monopoly Trademark
- **Fix**: App is clearly described as a companion tool, not the game itself
- No use of official Monopoly branding or logos
- Generic game piece icons (not official Monopoly pieces)

## Support Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## Emergency Contacts

If app is rejected:
1. Read the rejection reason carefully
2. Fix the specific issues mentioned
3. Test thoroughly before resubmission
4. Add detailed response notes explaining changes made

**Good luck with your submission! 🚀**
