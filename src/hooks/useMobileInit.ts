"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isNativePlatform } from '@/utils/platform';
import { initNativeGoogleAuth } from '@/services/native-auth';
import { initPushNotifications, registerPushListeners, registerTokenWithBackend } from '@/services/push-notifications';
import { initAppLifecycle } from '@/services/app-lifecycle';
import { getCookie } from '@/utils/auth';
import { getApiUrl } from '@/config/api';
import { getAPI_URL } from '@/definitions';

/**
 * Hook to initialize all mobile-specific features.
 * Should be called once at the app root level.
 * 
 * Initializes:
 * - Native Google Auth
 * - Push Notifications (FCM)
 * - App lifecycle (back button, status bar, keyboard)
 * - Network monitoring
 */
export default function useMobileInit() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isNativePlatform() || initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // 1. Initialize native Google Auth
      await initNativeGoogleAuth();

      // 2. Initialize app lifecycle (back button, status bar, keyboard)
      const cleanupLifecycle = initAppLifecycle(router);

      // 3. Initialize push notifications (graceful — won't crash without Firebase)
      let fcmToken: string | null = null;
      try {
        fcmToken = await initPushNotifications();
      } catch (e) {
        console.warn('[Mobile] Push notifications unavailable:', e);
      }

      if (fcmToken) {
        // Register token with backend if user is logged in
        const userId = getCookie('learner_id') || getCookie('volunteer_id');
        if (userId) {
          await registerTokenWithBackend(fcmToken, userId, getAPI_URL());
        }
      }

      // 4. Register push notification listeners (safe even without FCM)
      try {
        registerPushListeners(
          // On notification received in foreground
          (notification) => {
          },
          // On notification tapped
          (notification) => {
            // Navigate based on notification data
            if (notification.data?.route) {
              router.push(notification.data.route);
            }
          }
        );
      } catch (e) {
        console.warn('[Mobile] Push listeners unavailable:', e);
      }

      // Return cleanup
      return cleanupLifecycle;
    };

    let cleanup: (() => void) | undefined;
    init().then((c) => { cleanup = c; });

    return () => {
      cleanup?.();
    };
  }, [router]);
}
