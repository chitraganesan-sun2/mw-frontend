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
    return KNOWN_ONBOARDED_STATUSES.includes(status) ? status : "details_pending";
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
    "/privacy-policy",
    "/terms-and-conditions",
];

// Public routes with a dynamic sub-path (e.g. /blogs/[id]) that LANDING_PAGE_ROUTES'
// exact-match `.includes()` can never match. Before this existed, every unauthenticated
// visitor AND search-engine bot hitting /blogs or any individual post was redirected to
// "/" - the public blog was structurally unreachable by anyone not logged in, which is
// the entire audience it exists for (see [[production-readiness-audit-2026-09-23]]).
export const PUBLIC_ROUTE_PREFIXES = ["/blogs"];

export function isPublicLandingRoute(pathname: string): boolean {
    if (LANDING_PAGE_ROUTES.includes(pathname)) return true;
    return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const AUTH_ROUTE_PREFIXES = ["/onboarding"];

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

export const ALWAYS_ACCESSIBLE_ROUTES = ["/donate", "/donate/history", "/privacy-policy", "/terms-and-conditions"];

export const PROTECTED_ROUTES = ["/learner", "/volunteer"];

export function getDefaultRouteForRole(role: Role): string {
    return role === "learner" ? "/learner/instant-sessions" : "/volunteer/schedule";
}

/**
 * Pure routing decision: returns the path to redirect to, or null to allow
 * the current pathname to render as-is. Callers own reading auth state and
 * performing the actual redirect.
 */
export function getRedirectForRoute(pathname: string, auth: AuthState): string | null {
    const onboardedStatus = normalizeStatus(auth.onboardedStatus);
    auth = { ...auth, onboardedStatus };

    if (!auth.isAuthenticated) {
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
