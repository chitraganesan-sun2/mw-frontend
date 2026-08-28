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
    "/join-us",
    "/join-us/step-1",
    "/join-us/step-2",
    "/join-us/step-3",
    "/join-us/success",
    "/privacy-policy",
    "/terms-and-conditions",
];

export const ALWAYS_ACCESSIBLE_ROUTES = ["/donate", "/privacy-policy", "/terms-and-conditions"];

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
        return LANDING_PAGE_ROUTES.includes(pathname) ? null : "/";
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
