"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import { getCookie, setCookie } from "@/utils/auth";
import {
    getRedirectForRoute,
    reconcileOnboardedStatus,
    type OnboardedStatus,
    type Role,
} from "@/utils/routeGuard";

export type VerifiedSession =
    | { phase: "checking"; role: undefined; onboardedStatus: undefined; retry: () => void }
    | { phase: "error"; role: Role; onboardedStatus: undefined; retry: () => void }
    | { phase: "verified"; role: Role; onboardedStatus: OnboardedStatus; retry: () => void };

/**
 * Asks the server (GET onboarding/status/{role}/{id}, owner-or-admin only) what the signed-in
 * member's onboarding status really is, instead of trusting the `onboarded_status` cookie.
 *
 * The cookies (role, ids, onboarded_status) are writable by the user, so they are only a UX
 * hint for routing; the private shell must not render on their word alone. Server authorization
 * on every endpoint remains the real security boundary - this just stops a forged cookie from
 * painting the member UI and fabricating an identity. If the server disagrees with the cookie,
 * the cookie is corrected and the route is re-evaluated.
 */
export default function useVerifiedSession(): VerifiedSession {
    const router = useRouter();
    const pathname = usePathname();
    // Cookies are read after mount so the first client render matches the server's (hydration).
    const [identity, setIdentity] = useState<{ role: Role; id?: string; cookieStatus?: string } | null>(null);
    useEffect(() => {
        const role = getCookie("role") as Role;
        setIdentity({
            role,
            id: getCookie(role === "volunteer" ? "volunteer_id" : "learner_id"),
            cookieStatus: getCookie("onboarded_status"),
        });
    }, []);

    const role = identity?.role;
    const id = identity?.id;
    const enabled = !!identity && (role === "learner" || role === "volunteer") && !!id;

    const query = useQuery({
        queryKey: ["sessionVerification", role, id],
        enabled,
        staleTime: 60 * 1000,
        retry: 1,
        queryFn: async () => {
            const res: any = await GET_API(endpoints.onboarding.getOnboardingStatus(id as string, role as "learner" | "volunteer"));
            return (res?.data?.onboarded_status ?? null) as string | null;
        },
    });

    const reconciled = query.isSuccess
        ? reconcileOnboardedStatus(identity?.cookieStatus, query.data)
        : { status: null, changed: false };

    useEffect(() => {
        if (!reconciled.changed || !reconciled.status) return;
        setCookie({ onboarded_status: reconciled.status });
        const redirectTo = getRedirectForRoute(pathname, {
            isAuthenticated: true,
            role,
            onboardedStatus: reconciled.status,
        });
        if (redirectTo && redirectTo !== pathname) router.replace(redirectTo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reconciled.changed, reconciled.status]);

    // No usable session cookies at all: the proxy / native RouteGuard send the visitor to "/".
    useEffect(() => {
        if (identity && !enabled) router.replace("/");
    }, [identity, enabled, router]);

    const retry = () => {
        void query.refetch();
    };

    if (!identity || !enabled || query.isPending) return { phase: "checking", role: undefined, onboardedStatus: undefined, retry };
    if (query.isError || !reconciled.status) return { phase: "error", role, onboardedStatus: undefined, retry };
    return { phase: "verified", role, onboardedStatus: reconciled.status, retry };
}
