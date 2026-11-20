import { useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { clearCookies, getCookie } from "@/utils/auth";
import { unregisterTokenBeforeLogout } from "@/services/push-notifications";
import { INACTIVITY_TIMEOUT_MS, LAST_ACTIVITY_COOKIE_DAYS, isIdleExpired } from "@/utils/inactivity";

const WRITE_THROTTLE_MS = 10 * 1000; // don't rewrite the cookie on every mousemove
const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

/**
 * Signs the member out after 30 minutes without activity - including time the browser / app was
 * closed (the timestamp lives in a cookie that outlasts the idle timeout).
 *
 * Unlike the first version this does not decide once at mount whether a session exists: login is a
 * client-side navigation (no remount), so the listeners and the periodic check run for the whole
 * app lifetime and simply do nothing until a token cookie exists.
 */
const useAutoLogout = (router: any) => {
  const clearSession = useCallback(async () => {
    // Awaited (bounded) and before clearCookies() - it needs the still-valid auth
    // cookie to identify which device's token to remove.
    await unregisterTokenBeforeLogout();
    clearCookies();
    // Full reload (like Log Out) rather than router.refresh(): an SPA refresh kept the
    // previous user's react-query cache and in-memory store alive on a shared device.
    if (typeof window !== "undefined") {
      window.location.href = "/?session=expired";
    } else {
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    let lastWrite = 0;
    let signingOut = false;

    const stamp = () => {
      lastWrite = Date.now();
      Cookies.set("lastActivity", String(lastWrite), { expires: LAST_ACTIVITY_COOKIE_DAYS, path: "/" });
    };

    const onActivity = () => {
      if (signingOut || !getCookie("token")) return;
      if (Date.now() - lastWrite < WRITE_THROTTLE_MS) return;
      stamp();
    };

    const check = () => {
      if (signingOut || !getCookie("token")) return;
      const last = Cookies.get("lastActivity");
      if (!last) {
        stamp(); // session without a timestamp (e.g. just logged in): start counting now
        return;
      }
      if (isIdleExpired(last, Date.now(), INACTIVITY_TIMEOUT_MS)) {
        signingOut = true;
        void clearSession();
      }
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", check);
    check(); // returning to a tab / reopening the app after a long gap
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", check);
      clearInterval(interval);
    };
  }, [clearSession]);

  return null;
};

export default useAutoLogout;
