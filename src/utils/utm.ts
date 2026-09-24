import Cookies from "js-cookie";

export const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export type UtmParam = (typeof UTM_PARAMS)[number];
export type UtmValues = Partial<Record<UtmParam, string>>;

const UTM_COOKIE_NAME = "mw_utm";

/**
 * First-touch UTM capture, independent of PostHog (PostHog deliberately
 * strips query strings from captured URLs for PII reasons - see
 * src/providers/PostHog - so its autocapture never sees these params).
 *
 * Reads utm_* from the current URL once and stores them in a cookie so they
 * survive internal navigation (Next.js <Link> doesn't carry query strings
 * between routes). Never overwrites an existing capture - the first
 * campaign that brought the visitor in is the one that should get credit,
 * not whatever internal link they clicked last.
 */
export function captureUtmParams() {
    if (typeof window === "undefined") return;
    if (Cookies.get(UTM_COOKIE_NAME)) return;

    const searchParams = new URLSearchParams(window.location.search);
    const values: UtmValues = {};
    UTM_PARAMS.forEach((key) => {
        const value = searchParams.get(key);
        if (value) values[key] = value;
    });

    if (Object.keys(values).length === 0) return;

    Cookies.set(UTM_COOKIE_NAME, JSON.stringify(values), { expires: 30, path: "/", sameSite: "Lax" });
}

/** Reads back the first-touch UTM values captured this session, if any. */
export function getUtmParams(): UtmValues | null {
    if (typeof window === "undefined") return null;
    const raw = Cookies.get(UTM_COOKIE_NAME);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
