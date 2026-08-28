import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.melodywings.app',
  appName: 'MelodyWings',
  webDir: 'out',
  android: {
    // Remote WebView debugging (chrome://inspect) exposes localStorage — which
    // holds the auth token backup (mw_auth_backup) — plus the DOM and network
    // to anyone with the APK. Off by default; opt in locally with
    // `CAP_DEBUG=true npx cap run android`.
    webContentsDebuggingEnabled: process.env.CAP_DEBUG === 'true',
  },
  server: {
    androidScheme: 'https',
    // Enable native HTTP handling - bypasses CORS for all requests
    // This is correct for mobile apps since CORS is a browser security feature
    allowNavigation: ['melodywings-backend-781782361175.us-central1.run.app'],
    cleartext: false,
    // For local dev, uncomment to use live reload:
    // url: 'http://10.0.2.2:3000',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body' as any,
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'LIGHT' as any,
      backgroundColor: '#FFFFFF',
    },
  },
};

export default config;
