/** @format */

import { isNativePlatform } from '@/utils/platform';

// Production API URL for mobile app
// api.melodywings.org does not resolve (no DNS record) - use the Cloud Run URL directly
const MOBILE_API_URL = 'https://melodywings-backend-781782361175.us-central1.run.app/api/v1';

// For web, this is baked at build time from .env
const WEB_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/v1`;

// Use a getter to evaluate at runtime (not module load time)
export const getAPI_URL = (): string => {
  if (isNativePlatform()) {
    return MOBILE_API_URL;
  }
  return WEB_API_URL;
};

// Keep backward compatibility - but this will be the web URL at build time
// Components that need mobile support should use getAPI_URL() instead
export const API_URL = typeof window !== 'undefined' && isNativePlatform() 
  ? MOBILE_API_URL 
  : WEB_API_URL;

export const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_IOS_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID;
export const GOOGLE_IOS_URL_SCHEME = process.env.NEXT_PUBLIC_GOOGLE_IOS_URL_SCHEME;
export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
export const VIEW_DEMO_LINK = process.env.NEXT_PUBLIC_VIEW_DEMO_LINK;
export const VIEW_DEMO_LINK_FOR_VOLUNTEER = process.env.NEXT_PUBLIC_VIEW_DEMO_LINK_FOR_VOLUNTEER;
export const PAGINATION = process.env.NEXT_PUBLIC_PAGINATION;
