import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from '@/utils/platform';

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

/** Request permission and register for push notifications */
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
          resolve(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          clearTimeout(timeout);
          console.error('[Push] Registration error:', error);
          resolve(null);
        });
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
    });
  });

  // Notification tapped (app opened from notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    onNotificationTapped?.(action.notification);
  });
};

/** Send FCM token to backend for targeted notifications */
export const registerTokenWithBackend = async (
  token: string,
  userId: string,
  apiUrl: string
): Promise<void> => {
  try {
    await fetch(`${apiUrl}/notifications/register-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcm_token: token,
        user_id: userId,
        platform: 'android',
      }),
    });
  } catch (error) {
    console.error('[Push] Failed to register token with backend:', error);
  }
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
