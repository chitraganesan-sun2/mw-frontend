import { parseCookies } from "nookies";

export const CONSENT_COOKIE = "cookieConsent";
/** Fired on `window` whenever the visitor answers the cookie banner. */
export const CONSENT_EVENT = "mw-consent-change";

export type ConsentChoice = "accepted" | "declined" | undefined;

export function getConsent(): ConsentChoice {
    if (typeof document === "undefined") return undefined;
    const value = parseCookies()[CONSENT_COOKIE];
    return value === "accepted" || value === "declined" ? value : undefined;
}

/** True when the browser asks not to be tracked (Do Not Track or Global Privacy Control). */
export function doNotTrackEnabled(): boolean {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    const w = window as Window & { doNotTrack?: string };
    return nav.doNotTrack === "1" || w.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

/**
 * Analytics (Google Analytics, PostHog) may only run after the visitor clicked Allow and only
 * if their browser isn't asking not to be tracked. Same rule on the website and in the Android
 * app (the app shows the same banner; PostHog itself never runs in the app).
 */
export function analyticsAllowed(): boolean {
    if (typeof window === "undefined") return false;
    return getConsent() === "accepted" && !doNotTrackEnabled();
}
