import { endpoints } from "@/api/constants";
import { POST_API } from "@/api/request";
import { clearCookies } from "@/utils/auth";
import { unregisterTokenBeforeLogout } from "@/services/push-notifications";

/**
 * Tell the server this person logged out, so the token they were using stops working (tokens are otherwise valid
 * for 7 days and a copy of one would survive the log out). Bounded and best effort: a slow or failing server never
 * stops the log out itself. Needs the still-valid auth cookie, so it runs before clearCookies().
 */
async function endServerSession(): Promise<void> {
    try {
        await Promise.race([POST_API(endpoints.user.logout), new Promise<void>((resolve) => setTimeout(resolve, 2000))]);
    } catch {
        // offline / already expired: the cookies are cleared below either way
    }
}

/**
 * Shared sign-out used by the app Sidebar and the onboarding header.
 *
 * Unregisters this device's push token first (awaited, bounded - it needs the
 * still-valid auth cookie to identify the token), ends the session on the server, clears the auth
 * cookies, then does a full page load to "/" rather than an SPA navigation so the previous user's
 * react-query cache and in-memory stores don't survive on a shared device.
 */
export async function signOut() {
    await unregisterTokenBeforeLogout();
    await endServerSession();
    clearCookies();
    window.location.href = "/";
}
