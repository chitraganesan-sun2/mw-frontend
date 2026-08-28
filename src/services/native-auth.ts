import { SocialLogin } from '@capgo/capacitor-social-login';
import { isNativePlatform } from '@/utils/platform';
import { GOOGLE_WEB_CLIENT_ID } from '@/definitions';

/**
 * Native Google Authentication using @capgo/capacitor-social-login.
 * This is used on Android/iOS instead of @react-oauth/google.
 * 
 * The flow:
 * 1. User taps "Sign In with Google"
 * 2. Native Google Sign-In UI appears (Credential Manager on Android)
 * 3. We get an access token
 * 4. Send to backend (same as web flow: Bearer {accessToken})
 * 5. Backend validates with Google and returns our JWT
 */

/** Initialize Google Auth for native platforms */
export const initNativeGoogleAuth = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID || '',
      },
    });
  } catch (error) {
    console.error('[NativeAuth] Failed to initialize Google Auth:', error);
  }
};

/** Perform native Google Sign-In and return the access token */
export const nativeGoogleSignIn = async (): Promise<string | null> => {
  try {
    const result = await SocialLogin.login({
      provider: 'google',
      options: {},
    });

    const loginResult = result?.result as any;

    // The token is nested: result.result.accessToken.token
    if (loginResult?.accessToken?.token) {
      return loginResult.accessToken.token;
    }

    // Fallback: direct accessToken string
    if (typeof loginResult?.accessToken === 'string') {
      return loginResult.accessToken;
    }

    // Fallback to idToken
    if (loginResult?.idToken?.token) {
      return loginResult.idToken.token;
    }

    if (typeof loginResult?.idToken === 'string') {
      return loginResult.idToken;
    }

    console.error('[NativeAuth] No token in sign-in result (unexpected shape)');
    return null;
  } catch (error) {
    console.error('[NativeAuth] Google Sign-In failed:', error);
    return null;
  }
};

/** Sign out from Google on native */
export const nativeGoogleSignOut = async (): Promise<void> => {
  try {
    await SocialLogin.logout({ provider: 'google' });
  } catch (error) {
    console.error('[NativeAuth] Sign-Out failed:', error);
  }
};

/** Check if user is currently logged into Google */
export const isNativeGoogleLoggedIn = async (): Promise<boolean> => {
  try {
    const result = await SocialLogin.isLoggedIn({ provider: 'google' });
    return result?.isLoggedIn || false;
  } catch {
    return false;
  }
};
