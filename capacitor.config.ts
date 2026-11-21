import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pitbullfit.app',
  appName: 'Pitbull Fit',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK' as const,
      backgroundColor: '#08080a',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#08080a',
      showSpinner: false
    }
  }
};

export default config;
