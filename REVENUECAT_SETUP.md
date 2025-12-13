# RevenueCat IAP Setup Guide

This app uses RevenueCat for in-app purchases. Follow these steps to configure IAP for App Store submission.

## 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and sign up
2. Create a new project for "Digital Banker"

## 2. Configure iOS App

### App Store Connect Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Create your app if not already created
3. Go to **Features** > **In-App Purchases**
4. Click **+** to create a new in-app purchase
   - **Type**: Non-Consumable (one-time purchase)
   - **Reference Name**: Digital Banker Pro
   - **Product ID**: `digital_banker_pro`
   - **Price**: Set your price (e.g., $4.99)
   - **Localization**: Add display name and description
5. Submit for review (required before testing)

### RevenueCat iOS Configuration

1. In RevenueCat Dashboard, go to your project
2. Click **Apps** > **+ New**
3. Select **iOS**
4. Enter your **Bundle ID**: `com.dushin.digitalbanker.app`
5. Upload your **App Store Connect API Key**:
   - Go to App Store Connect > Users and Access > Keys
   - Create a new key with **App Manager** role
   - Download the `.p8` file
   - Upload to RevenueCat
6. Copy your **iOS API Key** from RevenueCat

## 3. Configure Android App (Optional)

### Google Play Console Setup

1. Go to [Google Play Console](https://play.google.com/console/)
2. Create your app if not already created
3. Go to **Monetize** > **Products** > **In-app products**
4. Create a new product:
   - **Product ID**: `digital_banker_pro`
   - **Name**: Digital Banker Pro
   - **Description**: Unlock Pro features
   - **Price**: Set your price
5. Activate the product

### RevenueCat Android Configuration

1. In RevenueCat Dashboard, click **Apps** > **+ New**
2. Select **Android**
3. Enter your **Package Name**: `com.dushin.digitalbanker.app`
4. Upload your **Google Play Service Account JSON**:
   - Go to Google Cloud Console
   - Create a service account
   - Grant **Financial data viewer** permission
   - Download JSON key
   - Upload to RevenueCat
5. Copy your **Android API Key** from RevenueCat

## 4. Configure Entitlements

1. In RevenueCat Dashboard, go to **Entitlements**
2. Click **+ New**
3. Create an entitlement:
   - **Identifier**: `pro`
   - **Display Name**: Pro Features
4. Click on the entitlement and attach the product:
   - Click **Attach Product**
   - Select `digital_banker_pro`

## 5. Configure Offering

1. In RevenueCat Dashboard, go to **Offerings**
2. The **Default Offering** should already exist
3. Click on it and add a package:
   - **Identifier**: `pro_package`
   - **Product**: `digital_banker_pro`
   - **Type**: Lifetime (one-time purchase)

## 6. Add API Keys to Your App

1. Copy `.env.example` to `.env`
2. Add your RevenueCat API keys:
   ```
   VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxx
   VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxx
   ```

## 7. Testing IAP

### iOS Sandbox Testing

1. In App Store Connect, go to **Users and Access** > **Sandbox Testers**
2. Create a test account with a unique email
3. On your iOS device:
   - Sign out of your real Apple ID in Settings > App Store
   - Install the app through Xcode or TestFlight
   - When prompted for payment, sign in with sandbox tester account
4. Test the purchase flow

### Android Testing

1. In Google Play Console, add test accounts under **Settings** > **License Testing**
2. Install app through internal testing track
3. Test the purchase flow

## 8. Production Checklist

Before App Store submission:

- [ ] App Store Connect in-app purchase is approved
- [ ] RevenueCat is configured with production API keys
- [ ] `.env` file has correct RevenueCat keys
- [ ] Tested purchase flow on real device with sandbox account
- [ ] Tested restore purchases functionality
- [ ] Verified entitlements unlock Pro features
- [ ] Privacy Policy mentions in-app purchases
- [ ] App description mentions Pro features and pricing

## 9. Important Notes

- **Product ID** must match exactly: `digital_banker_pro`
- **Entitlement ID** must match exactly: `pro`
- RevenueCat handles receipt validation automatically
- Purchases are tied to Apple ID / Google account, not device
- Use Sandbox accounts for testing, never real purchases
- RevenueCat provides analytics and subscription management

## Support

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Capacitor SDK](https://github.com/RevenueCat/purchases-capacitor)
- [App Store In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
