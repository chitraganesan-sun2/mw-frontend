"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isNativePlatform } from '@/utils/platform';
import { initNativeGoogleAuth } from '@/services/native-auth';
import { enablePushForSignedInUser, registerPushListeners } from '@/services/push-notifications';
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
      // 1. Initialize app lifecycle (back button, status bar, keyboard) FIRST and synchronously: the back button must
      //    work even if a later native call is slow.
      let cleanupLifecycle: () => void = () => {};
      try {
        cleanupLifecycle = initAppLifecycle(router);
      } catch (e) {
        console.warn('[Mobile] App lifecycle init failed:', e);
      }

      // 2. Initialize native Google Auth
      try {
        await initNativeGoogleAuth();
      } catch (e) {
        console.warn('[Mobile] Google auth init failed:', e);
      }

      // 3. Push notifications: only for a member who is already signed in (app resume). A fresh
      //    login / sign-up calls enablePushForSignedInUser itself, so the OS permission prompt is
      //    never shown to a visitor who has not logged in.
      if (getCookie('token')) {
        void enablePushForSignedInUser();
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
            // Only in-app paths: the payload is data, not trusted navigation.
            const route = notification.data?.route;
            if (typeof route === 'string' && route.startsWith('/') && !route.startsWith('//')) {
              router.push(route);
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
