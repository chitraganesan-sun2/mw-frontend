import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie";
import { isNativePlatform } from '@/utils/platform';

// On native, Capacitor cookies are async through the native bridge, so a
// Cookies.set() immediately followed by Cookies.get() is unreliable, and
// cookies can be lost entirely on hard navigation in the WebView.
// localStorage is synchronous and persistent, so we use it as the source of
// truth for auth state on native and keep cookies in sync for the axios header.
const AUTH_STORAGE_KEY = "mw_auth_backup";

const persistToStorage = (data: Record<string, string>) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
        } catch { }
    }
};

const restoreFromStorage = (): Record<string, string> | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/**
 * Read an auth value. On native, prefer localStorage (reliable) and lazily
 * re-sync the cookie so the axios interceptor still has it for the Authorization header.
 */
const readAuthValue = (key: string): string | undefined => {
    const cookieVal = Cookies.get(key);
    if (cookieVal) return cookieVal;

    if (isNativePlatform()) {
        const stored = restoreFromStorage();
        const val = stored?.[key];
        if (val) {
            // Re-sync cookie for axios (fire-and-forget, don't depend on it being readable immediately)
            Cookies.set(key, val, { expires: 1, path: "/" });
            return val;
        }
    }
    return undefined;
};

const isJwtExpired = (token: string): boolean => {
    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return Boolean(decodedToken.exp && decodedToken.exp < currentTime);
    } catch {
        return true;
    }
};

export const isAuthenticated = () => {
    const token = readAuthValue("token");
    const role = readAuthValue("role");
    const onboarded_status = readAuthValue("onboarded_status");
    const learner_id = readAuthValue("learner_id");
    const volunteer_id = readAuthValue("volunteer_id");

    return Boolean(
        token &&
        !isJwtExpired(token) &&
        onboarded_status &&
        (role === "learner" || role === "volunteer") &&
        (role === "learner" ? learner_id : volunteer_id)
    );
};

export const isCookiesFound = (cookies: any) => {
    const token = cookies.get("token")?.value;
    const role = cookies.get("role")?.value;
    const onboarded_status = cookies.get("onboarded_status")?.value;
    const learner_id = cookies.get("learner_id")?.value;
    const volunteer_id = cookies.get("volunteer_id")?.value;

    const cookiesFound = token && role && onboarded_status && (role === "learner" ? learner_id : volunteer_id);
    return Boolean(cookiesFound);
};

export const isTokenValid = (cookies: any) => {
    const token = cookies.get("token")?.value;
    if (!token) return false;
    return !isJwtExpired(token);
};

export const getCookie = (key: string) => {
    if (!key) return undefined;
    return readAuthValue(key);
}

export const setCookie = (cookieData: Object) => {
    const entries = Object.entries(cookieData);
    entries.forEach(([key, value]) => {
        if (value) Cookies.set(key, value, { expires: 1, path: "/" })
    });

    // Persist to localStorage for native WebView resilience (source of truth on native)
    if (isNativePlatform()) {
        const existing = restoreFromStorage() || {};
        entries.forEach(([key, value]) => {
            if (value) existing[key] = String(value);
        });
        persistToStorage(existing);
    }
}

export const removeCookie = (key: string) => {
    Cookies.remove(key, { path: "/" });
}

export const clearCookies = () => {
    const cookies = ["token", "role", "onboarded_status", "learner_id", "volunteer_id", "cookieConsent", "lastActivity"];
    cookies.map(cookie => removeCookie(cookie));

    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.clear();
        sessionStorage.clear();
    }
}