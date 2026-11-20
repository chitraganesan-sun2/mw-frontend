// Shared, framework-agnostic routing decision logic consumed by both
// middleware.ts (web/edge, reads req.cookies, redirects via NextResponse)
// and RouteGuard.tsx (native/Capacitor, reads cookies/localStorage,
// redirects via router.replace). Keeping this in one place means a status
// or route change only has to be made once instead of hand-synced twice.

export type Role = "learner" | "volunteer" | undefined;

export type OnboardedStatus =
    | ""
    | "details_pending"
    | "partially_filled"
    | "verification_pending"
    | "verification_rejected"
    | "verification_completed";

export interface AuthState {
    isAuthenticated: boolean;
    role: Role;
    onboardedStatus: OnboardedStatus;
}

const KNOWN_ONBOARDED_STATUSES: OnboardedStatus[] = [
    "",
    "details_pending",
    "partially_filled",
    "verification_pending",
    "verification_rejected",
    "verification_completed",
];

// NOTE: role / onboarded_status come from client-writable cookies, so this
// guard is a UX router, not a security boundary — every privileged API must
// re-check the caller's real onboarding state server-side. What we can do here
// is refuse to honour a value that isn't even a real status (treat it as
// "not onboarded" rather than letting it fall through and grant access).
function normalizeStatus(status: OnboardedStatus): OnboardedStatus {
    return status && KNOWN_ONBOARDED_STATUSES.includes(status) ? status : "details_pending";
}

/**
 * Compare the (client-writable) cookie status with the status the server reports for the
 * signed-in member. The server value is the only authoritative one: `status` is null when the
 * server value is missing/unknown (treat as "could not verify"), `changed` is true when the
 * cookie must be corrected and the route re-evaluated.
 */
export function reconcileOnboardedStatus(
    cookieStatus: string | undefined,
    serverStatus: unknown
): { status: OnboardedStatus | null; changed: boolean } {
    if (typeof serverStatus !== "string" || serverStatus === "") return { status: null, changed: false };
    if (!KNOWN_ONBOARDED_STATUSES.includes(serverStatus as OnboardedStatus)) return { status: null, changed: false };
    return { status: serverStatus as OnboardedStatus, changed: serverStatus !== (cookieStatus || "") };
}

export const LANDING_PAGE_ROUTES = [
    "/",
    "/about-us",
    "/donate",
    "/donate/success",
    "/join-us",
    "/join-us/step-1",
    "/join-us/step-2",
    "/join-us/step-3",
    "/join-us/success",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/delete-account",
];

export function isPublicLandingRoute(pathname: string): boolean {
    return LANDING_PAGE_ROUTES.includes(pathname);
}

const AUTH_ROUTE_PREFIXES = ["/onboarding"];

// Public-looking pages that only make sense for a signed-in member (they call an authenticated
// API). A signed-out visitor used to render them, hit a 401 and be thrown out with a "session
// expired" message; they are sent to the landing page (where Log In is) instead.
export const SIGNED_IN_ONLY_PUBLIC_ROUTES = ["/donate/history"];

// A path under a real section of the app (protected app routes, onboarding) that an
// unauthenticated visitor isn't allowed to see yet - as opposed to a path that isn't
// part of the app at all. Only the former should bounce to "/"; a genuinely unknown
// path (typo, dead backlink, old bookmark) should fall through and let Next.js render
// its real not-found page instead of silently landing on the homepage with no
// indication anything was wrong.
function isKnownGatedRoute(pathname: string): boolean {
    return [...PROTECTED_ROUTES, ...AUTH_ROUTE_PREFIXES].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

// "/donate/success" is where Stripe returns a donor after checkout - a verified user
// must land there too, not get bounced to their schedule with no confirmation.
export const ALWAYS_ACCESSIBLE_ROUTES = [
    "/donate",
    "/donate/success",
    "/donate/history",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/delete-account",
];

export const PROTECTED_ROUTES = ["/learner", "/volunteer"];

// The Schedule dashboard is the signed-in landing page for both roles (the learner used to
// land on Instant Sessions). Onboarding / verification / admin redirects are decided above
// this in getRedirectForRoute and are unaffected.
export function getDefaultRouteForRole(role: Role): string {
    return role === "learner" ? "/learner/schedule" : "/volunteer/schedule";
}

/**
 * Pure routing decision: returns the path to redirect to, or null to allow
 * the current pathname to render as-is. Callers own reading auth state and
 * performing the actual redirect.
 */
export function getRedirectForRoute(pathname: string, auth: AuthState): string | null {
    const onboardedStatus = normalizeStatus(auth.onboardedStatus);
    auth = { ...auth, onboardedStatus };

    // A token without a role cookie can't be routed anywhere sensible (every default route is
    // role-specific, and "/volunteer/..." fails the "/undefined" prefix check on the way back,
    // which redirected a page to itself forever). Treat it as signed out.
    if (!auth.isAuthenticated || !auth.role) {
        if (SIGNED_IN_ONLY_PUBLIC_ROUTES.includes(pathname)) return "/";
        if (isPublicLandingRoute(pathname)) return null;
        return isKnownGatedRoute(pathname) ? "/" : null;
    }

    if (auth.onboardedStatus !== "verification_completed" && LANDING_PAGE_ROUTES.includes(pathname)) {
        return null;
    }

    if (auth.onboardedStatus === "details_pending" || auth.onboardedStatus === "partially_filled") {
        return pathname === "/onboarding" ? null : "/onboarding";
    }

    if (auth.onboardedStatus === "verification_pending" || auth.onboardedStatus === "verification_rejected") {
        if (auth.role === "learner") {
            return pathname === "/onboarding/verification" ? null : "/onboarding/verification";
        }
        if (LANDING_PAGE_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding")) {
            return getDefaultRouteForRole(auth.role);
        }
        return null;
    }

    if (auth.onboardedStatus === "verification_completed") {
        if (ALWAYS_ACCESSIBLE_ROUTES.includes(pathname)) return null;
        if (
            LANDING_PAGE_ROUTES.includes(pathname) ||
            !pathname.startsWith(`/${auth.role}`) ||
            PROTECTED_ROUTES.includes(pathname)
        ) {
            return getDefaultRouteForRole(auth.role);
        }
        return null;
    }

    return null;
}
