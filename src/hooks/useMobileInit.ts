"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isNativePlatform } from '@/utils/platform';
import { initNativeGoogleAuth } from '@/services/native-auth';
import { initPushNotifications, registerPushListeners, registerTokenWithBackend } from '@/services/push-notifications';
import { initAppLifecycle } from '@/services/app-lifecycle';
import { getCookie } from '@/utils/auth';

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
      try {
        await initNativeGoogleAuth();
      } catch (e) {
        console.warn('[Mobile] Google auth init failed:', e);
      }

      // 2. Initialize app lifecycle (back button, status bar, keyboard)
      let cleanupLifecycle: () => void = () => {};
      try {
        cleanupLifecycle = initAppLifecycle(router);
      } catch (e) {
        console.warn('[Mobile] App lifecycle init failed:', e);
      }

      // 3. Initialize push notifications (graceful — won't crash without Firebase)
      let fcmToken: string | null = null;
      try {
        fcmToken = await initPushNotifications();
      } catch (e) {
        console.warn('[Mobile] Push notifications unavailable:', e);
      }

      if (fcmToken) {
        // Covers app resume while already logged in - a fresh login/signup instead
        // registers the token itself once auth succeeds, since this mount effect
        // runs once at app start, typically before the user has signed in yet.
        const userId = getCookie('learner_id') || getCookie('volunteer_id');
        if (userId) {
          try {
            await registerTokenWithBackend(fcmToken);
          } catch (e) {
            console.warn('[Mobile] Registering the push token failed:', e);
          }
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
    init()
      .then((c) => { cleanup = c; })
      .catch((e) => { console.warn('[Mobile] Startup failed:', e); });

    return () => {
      cleanup?.();
    };
  }, [router]);
}
