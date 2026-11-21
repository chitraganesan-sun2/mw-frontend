import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getPlatformName, isNativePlatform } from '@/utils/platform';
import { DELETE_API, POST_API } from '@/api/request';
import { endpoints } from '@/api/constants';
import { getCookie } from '@/utils/auth';
import { createPushTokenSync } from '@/services/pushTokenSync';

/**
 * Push Notifications Service for MelodyWings Mobile App.
 * 
 * Features:
 * - Firebase Cloud Messaging (FCM) push notifications
 * - Local notifications for in-app alerts
 * - Permission handling
 * - Token registration with backend
 */

export interface PushNotificationToken {
  value: string;
}

// Remembers the device token and keeps the backend's copy current (see pushTokenSync.ts): a token
// that arrives after we stopped waiting, or one Firebase refreshes mid-session, is still sent.
const tokenSync = createPushTokenSync({
  isSignedIn: () => !!getCookie('token'),
  send: async (token) => {
    await POST_API(endpoints.push_notifications.registerDevice, {
      fcm_token: token,
      // The backend stores one token per (user, platform); it already accepts 'ios'.
      platform: getPlatformName() === 'ios' ? 'ios' : 'android',
    });
  },
});

/** The FCM token from the most recent registration, if any. */
export const getCachedFcmToken = (): string | null => tokenSync.getToken();

/** Must match com.google.firebase.messaging.default_notification_channel_id in AndroidManifest.xml. */
export const ALERTS_CHANNEL_ID = 'melodywings_alerts';

/**
 * Android only: make sure the high-importance channel pushes are delivered on exists. Importance 4
 * ("high") is what lets a notification pop up over the current screen; the channel FCM falls back
 * to has no pop-up. Safe to call repeatedly (an existing channel keeps the user's own settings).
 * Content is hidden on a locked screen (visibility 0 = private): messages can be from minors.
 */
export const ensureAlertsChannel = async (): Promise<void> => {
  if (!isNativePlatform() || getPlatformName() !== 'android') return;
  try {
    await PushNotifications.createChannel({
      id: ALERTS_CHANNEL_ID,
      name: 'MelodyWings alerts',
      description: 'Messages, session updates and reminders',
      importance: 4,
      visibility: 0,
      vibration: true,
    });
  } catch (error) {
    console.warn('[Push] Could not create the notification channel:', error);
  }
};

// Waiters for the FIRST token of an initPushNotifications() call; the permanent listener below
// resolves them. The listeners are attached once - attaching again on every call stacked duplicates.
let tokenWaiters: Array<(token: string | null) => void> = [];
let tokenListenersAttached = false;

const attachTokenListeners = (): void => {
  if (tokenListenersAttached) return;
  tokenListenersAttached = true;
  PushNotifications.addListener('registration', (token) => {
    const waiters = tokenWaiters;
    tokenWaiters = [];
    waiters.forEach((resolve) => resolve(token.value));
    // Also covers a late first token and a token refreshed while the app is open.
    void tokenSync.onToken(token.value);
  }).catch(() => {
    tokenListenersAttached = false;
  });
  PushNotifications.addListener('registrationError', (error) => {
    console.error('[Push] Registration error:', error);
    const waiters = tokenWaiters;
    tokenWaiters = [];
    waiters.forEach((resolve) => resolve(null));
  }).catch(() => {});
};

/**
 * Request permission and register for push notifications.
 * Do not call this at cold start: the OS permission prompt belongs after the member has signed in
 * (use enablePushForSignedInUser).
 */
export const initPushNotifications = async (): Promise<string | null> => {
  if (!isNativePlatform()) return null;

  try {
    // Listen BEFORE registering so the token event can never be missed.
    attachTokenListeners();
    void ensureAlertsChannel();

    // Request permission
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // This requires google-services.json / Firebase to be configured
      // If Firebase is not set up, this will fail gracefully
      const firstToken = new Promise<string | null>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('[Push] Token registration timed out - it will still be sent if it arrives later');
          resolve(null);
        }, 5000);
        tokenWaiters.push((token) => {
          clearTimeout(timeout);
          resolve(token);
        });
      });
      try {
        await PushNotifications.register();
      } catch (registerError) {
        console.warn('[Push] Registration failed (Firebase not configured?):', registerError);
        return null;
      }
      return await firstToken;
    } else {
      console.warn('[Push] Permission denied');
      return null;
    }
  } catch (error) {
    console.warn('[Push] Init failed (Firebase not configured?):', error);
    return null;
  }
};

let enablePushInFlight: Promise<void> | null = null;

/**
 * For a SIGNED-IN member only (call after login/sign-up, or at app start when a session already
 * exists): asks for the notification permission, registers with FCM and sends the token to the
 * backend. Asking before login showed the OS prompt to people who had not even signed in.
 * Safe to call repeatedly; concurrent calls share one run.
 */
export const enablePushForSignedInUser = (): Promise<void> => {
  if (!isNativePlatform()) return Promise.resolve();
  if (!enablePushInFlight) {
    enablePushInFlight = (async () => {
      try {
        await initPushNotifications();
        // Sends the token if it is not on the backend yet (no-op when the listener already did).
        await tokenSync.sync();
      } catch (e) {
        console.warn('[Push] Could not enable push notifications:', e);
      } finally {
        enablePushInFlight = null;
      }
    })();
  }
  return enablePushInFlight;
};

/** Register push notification listeners */
export const registerPushListeners = (
  onNotificationReceived?: (notification: any) => void,
  onNotificationTapped?: (notification: any) => void
): void => {
  if (!isNativePlatform()) return;

  // At every app start, so the channel exists before the first push after an update.
  void ensureAlertsChannel();

  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    onNotificationReceived?.(notification);

    // Show as local notification since push won't show in foreground
    LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: notification.title || 'MelodyWings',
          body: notification.body || '',
          extra: notification.data,
        },
      ],
    }).catch(() => {});
  }).catch(() => {});

  // Notification tapped (app opened from notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    onNotificationTapped?.(action.notification);
  }).catch(() => {});
};

/**
 * Send the FCM token to the backend for targeted notifications (no-op if it is already there or
 * nobody is signed in). Uses the authenticated POST_API: the backend derives the recipient from
 * the login, not from a client-supplied user id.
 */
export const registerTokenWithBackend = async (token: string): Promise<void> => {
  await tokenSync.onToken(token);
};

/**
 * Clear this device's registered token at logout - a shared/reused device
 * (someone else signs in next) shouldn't keep receiving pushes meant for the
 * account that just signed out. Best-effort: a failure here shouldn't block
 * logout itself.
 */
export const unregisterTokenFromBackend = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  try {
    await DELETE_API(endpoints.push_notifications.unregisterDevice);
  } catch (error) {
    console.error('[Push] Failed to unregister token with backend:', error);
  } finally {
    // The backend may no longer hold this device's token: whoever signs in next must resend it.
    tokenSync.forget();
  }
};

/**
 * Unregister the device token and WAIT for it (bounded) before the caller clears the auth
 * cookies. The request interceptor reads the token cookie asynchronously, so firing this and
 * clearing cookies straight away sent the DELETE with no Authorization header (401).
 */
export const unregisterTokenBeforeLogout = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  await Promise.race([unregisterTokenFromBackend(), new Promise<void>((resolve) => setTimeout(resolve, 2000))]);
};

/** Show a local notification */
export const showLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!isNativePlatform()) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title,
        body,
        extra: data,
        schedule: { at: new Date(Date.now() + 100) },
      },
    ],
  });
};

/** Remove all delivered notifications */
export const clearAllNotifications = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  await PushNotifications.removeAllDeliveredNotifications();
};

/** Check current permission status */
export const checkNotificationPermissions = async (): Promise<string> => {
  if (!isNativePlatform()) return 'denied';

  const status = await PushNotifications.checkPermissions();
  return status.receive;
};
