import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dushin.digitalbanker.app',
  appName: 'digital banker',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
