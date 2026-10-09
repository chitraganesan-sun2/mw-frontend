import { clearCookies } from "@/utils/auth";
import { unregisterTokenBeforeLogout } from "@/services/push-notifications";

/**
 * Shared sign-out used by the app Sidebar and the onboarding header.
 *
 * Unregisters this device's push token first (awaited, bounded - it needs the
 * still-valid auth cookie to identify the token), clears the auth cookies, then does
 * a full page load to "/" rather than an SPA navigation so the previous user's
 * react-query cache and in-memory stores don't survive on a shared device.
 */
export async function signOut() {
    await unregisterTokenBeforeLogout();
    clearCookies();
    window.location.href = "/";
}
