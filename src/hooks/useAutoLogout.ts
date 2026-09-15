import { useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { clearCookies, getCookie } from "@/utils/auth";
import { unregisterTokenFromBackend } from "@/services/push-notifications";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const COOKIE_EXPIRY_DAYS = INACTIVITY_TIMEOUT / (1000 * 60 * 60 * 24);
const DEBOUNCE_DELAY = 10 * 1000; // 10 seconds debounce

const useAutoLogout = (router: any) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  const clearSession = useCallback(() => {
    // Fire-and-forget, and before clearCookies() - it needs the still-valid auth
    // cookie to identify which device's token to remove.
    unregisterTokenFromBackend();
    clearCookies();
    router.refresh();
  }, [router]);

  const resetTimer = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      Cookies.set("lastActivity", Date.now().toString(), { expires: COOKIE_EXPIRY_DAYS, path: "/" });
      timerRef.current = setTimeout(clearSession, INACTIVITY_TIMEOUT);
    }, DEBOUNCE_DELAY);

  }, [clearSession]);

  useEffect(() => {
    // Skip auto-logout if user is not logged in
    const token = getCookie("token");
    if (!token) {
      initializedRef.current = true;
      return;
    }

    const lastActivity = Cookies.get("lastActivity");

    // Only clear if lastActivity cookie exists AND is expired
    if (lastActivity && Date.now() - parseInt(lastActivity) > INACTIVITY_TIMEOUT) {
      clearSession();
    } else {
      // Set lastActivity immediately if missing (prevents issues on next hard nav)
      if (!lastActivity) {
        Cookies.set("lastActivity", Date.now().toString(), { expires: COOKIE_EXPIRY_DAYS, path: "/" });
      }
      resetTimer();
    }

    initializedRef.current = true;

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default useAutoLogout;