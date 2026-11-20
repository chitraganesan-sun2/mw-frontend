import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getPlatformName, isNativePlatform } from '@/utils/platform';
import { DELETE_API, POST_API } from '@/api/request';
import { endpoints } from '@/api/constants';

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

// The token is cached so it can be re-sent to the backend later in the session.
let cachedFcmToken: string | null = null;

/** The FCM token from the most recent initPushNotifications() call, if any. */
export const getCachedFcmToken = (): string | null => cachedFcmToken;

/**
 * Request permission and register for push notifications.
 * Do not call this at cold start: the OS permission prompt belongs after the member has signed in
 * (use enablePushForSignedInUser).
 */
export const initPushNotifications = async (): Promise<string | null> => {
  if (!isNativePlatform()) return null;

  try {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Register for push notifications
      // This requires google-services.json / Firebase to be configured
      // If Firebase is not set up, this will fail gracefully
      try {
        await PushNotifications.register();
      } catch (registerError) {
        console.warn('[Push] Registration failed (Firebase not configured?):', registerError);
        return null;
      }

      // Get the FCM token
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('[Push] Token registration timed out');
          resolve(null);
        }, 5000);

        PushNotifications.addListener('registration', (token) => {
          clearTimeout(timeout);
          cachedFcmToken = token.value;
          resolve(token.value);
        }).catch(() => resolve(null));

        PushNotifications.addListener('registrationError', (error) => {
          clearTimeout(timeout);
          console.error('[Push] Registration error:', error);
          resolve(null);
        }).catch(() => resolve(null));
      });
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
        const token = (await initPushNotifications()) ?? getCachedFcmToken();
        if (token) await registerTokenWithBackend(token);
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
 * Send the FCM token to the backend for targeted notifications.
 *
 * Uses the authenticated POST_API (attaches the JWT the backend's register-device
 * route requires) rather than a raw fetch - the backend derives the recipient from
 * the token itself, not a client-supplied user id.
 */
export const registerTokenWithBackend = async (token: string): Promise<void> => {
  try {
    await POST_API(endpoints.push_notifications.registerDevice, {
      fcm_token: token,
      // The backend stores one token per (user, platform); it already accepts 'ios'.
      platform: getPlatformName() === 'ios' ? 'ios' : 'android',
    });
  } catch (error) {
    console.error('[Push] Failed to register token with backend:', error);
  }
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
