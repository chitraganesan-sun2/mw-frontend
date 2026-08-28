import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { isNativePlatform, isAndroid } from '@/utils/platform';

/**
 * App Lifecycle management for MelodyWings Mobile.
 * Handles back button, status bar, keyboard, and app state events.
 */

/** Initialize all native app features */
export const initAppLifecycle = (router: { back: () => void }): (() => void) => {
  if (!isNativePlatform()) return () => {};

  const cleanupFns: (() => void)[] = [];

  // Android back button handling
  if (isAndroid()) {
    const backListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        router.back();
      } else {
        App.exitApp();
      }
    });
    cleanupFns.push(() => backListener.then((l) => l.remove()));
  }

  // App state change (foreground/background)
  const stateListener = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      // Could refresh data here
    } else {
    }
  });
  cleanupFns.push(() => stateListener.then((l) => l.remove()));

  // Configure status bar
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {});

  // Keyboard events
  const keyboardShowListener = Keyboard.addListener('keyboardWillShow', (info) => {
    document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
  });
  cleanupFns.push(() => keyboardShowListener.then((l) => l.remove()));

  const keyboardHideListener = Keyboard.addListener('keyboardWillHide', () => {
    document.body.style.setProperty('--keyboard-height', '0px');
  });
  cleanupFns.push(() => keyboardHideListener.then((l) => l.remove()));

  // Return cleanup function
  return () => {
    cleanupFns.forEach((fn) => fn());
  };
};

/** Get app version info */
export const getAppInfo = async () => {
  if (!isNativePlatform()) return null;

  try {
    const info = await App.getInfo();
    return {
      name: info.name,
      id: info.id,
      build: info.build,
      version: info.version,
    };
  } catch {
    return null;
  }
};

/** Open a URL in the system browser */
export const openExternalUrl = async (url: string): Promise<void> => {
  if (!isNativePlatform()) {
    window.open(url, '_blank');
    return;
  }

  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url });
};
