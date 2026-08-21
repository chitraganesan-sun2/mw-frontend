import { isNativePlatform } from '@/utils/platform';

/**
 * Runtime API configuration for MelodyWings.
 * 
 * On web: Uses NEXT_PUBLIC_API_URL (baked at build time by Next.js)
 * On native mobile: Uses hardcoded production URL since process.env
 * is baked at build time and we want the mobile app to always hit prod.
 */

// Production API URL - used by the mobile app
// api.melodywings.org does not resolve (no DNS record) - use the Cloud Run URL directly
const PRODUCTION_API_URL = 'https://melodywings-backend-781782361175.us-central1.run.app';

/** Get the base API URL based on current platform */
export const getApiBaseUrl = (): string => {
  if (isNativePlatform()) {
    return PRODUCTION_API_URL;
  }
  // On web, use the env variable (standard Next.js behavior)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/** Get the full API v1 URL */
export const getApiUrl = (): string => {
  return `${getApiBaseUrl()}/api/v1`;
};
