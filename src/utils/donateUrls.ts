// Self-contained (no imports) so the node unit tests can load it directly.

/** Public web origin Stripe returns the donor to when the app runs inside the Android WebView
 *  (window.location.origin there is https://localhost, which nobody can be sent back to). */
export const DEFAULT_SITE_URL = "https://melodywings.org";

function trimTrailingSlash(url: string): string {
    return url.replace(/\/+$/, "");
}

/** Origin used for Stripe's success / cancel URLs. Native -> the public site; web -> the origin
 *  the donor is actually on (so staging and the production domain each return to themselves). */
export function getDonationReturnOrigin(opts: {
    isNative: boolean;
    windowOrigin?: string;
    siteUrl?: string;
}): string {
    const site = trimTrailingSlash((opts.siteUrl || "").trim() || DEFAULT_SITE_URL);
    if (opts.isNative) return site;
    return trimTrailingSlash(opts.windowOrigin || "") || site;
}

/** The checkout URL comes back from the API; only follow it when it is a plain https URL. */
export function isSafeCheckoutRedirect(url: unknown): url is string {
    if (typeof url !== "string" || url.length > 2048) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && !parsed.username && !parsed.password;
    } catch {
        return false;
    }
}

/** Stripe appends ?session_id={CHECKOUT_SESSION_ID} to the success URL; without a real-looking id
 *  nobody has been through checkout, so the success page must not thank them. */
export function isStripeCheckoutSessionId(value: unknown): value is string {
    return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]{8,200}$/.test(value);
}
