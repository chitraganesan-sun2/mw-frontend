"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getCookie } from '@/utils/auth';
import { isNativePlatform } from '@/utils/platform';
import { getRedirectForRoute, type OnboardedStatus, type Role } from '@/utils/routeGuard';

/**
 * Client-side Route Guard for Capacitor mobile app.
 *
 * Consumes the same routing decision logic as proxy.ts (via
 * utils/routeGuard.ts), since the Next.js proxy doesn't run in static
 * exports.
 *
 * Only activates on native platforms — web continues using the server proxy.
 */

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(!isNativePlatform());

  useEffect(() => {
    // Web uses the server proxy — skip client guard
    if (!isNativePlatform()) {
      setAuthorized(true);
      return;
    }

    const role = getCookie('role') as Role;
    const onboardedStatus = (getCookie('onboarded_status') || '') as OnboardedStatus;

    const redirectTo = getRedirectForRoute(pathname, {
      isAuthenticated: Boolean(isAuthenticated()),
      role,
      onboardedStatus,
    });

    if (redirectTo && redirectTo !== pathname) {
      router.replace(redirectTo);
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
