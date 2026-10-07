"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import ThankyouCard from "@/components/landingpage/ThankyouCard";
import { LearnerRejectedMessage, LearnerThankyouCardConstants } from "@/constants/learner";
import { VolunteerRejectedMessage, VolunteerThankyouCardConstants } from "@/constants/volunteer";
import { getCookie } from "@/utils/auth";
import { getDefaultRouteForRole } from "@/utils/routeGuard";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "volunteer" | "learner";
type OnboardingStatus = {
    onboarded_status: "verification_pending" | "verification_completed";
};

export default function VerificationPage() {
    const router = useRouter();

    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server (role/id unknown -> query disabled ->
    // renders the ThankYou content immediately) differ from the client's first
    // render (real role/id -> query enabled -> renders the spinner), a hydration
    // mismatch on every load of this page. Deferring to an effect keeps the first
    // client render identical to the server's.
    const [role, setRole] = useState<UserRole | undefined>(undefined);
    const [onboarded_status, setOnboardedStatus] = useState<string | undefined>(undefined);
    const [id, setId] = useState<string | undefined>(undefined);
    // `cookiesRead` gates the "no id -> go home" redirect below. Without it that effect
    // ran in the same commit as the cookie-reading effect, still saw the initial
    // `id === undefined`, and pushed every pending/rejected user to "/" on every visit.
    const [cookiesRead, setCookiesRead] = useState(false);
    useEffect(() => {
        const r = getCookie("role") as UserRole;
        setRole(r);
        setOnboardedStatus(getCookie("onboarded_status"));
        setId(getCookie(r === "volunteer" ? "volunteer_id" : "learner_id"));
        setCookiesRead(true);
    }, []);

    useEffect(() => { if (typeof window !== "undefined") window.scrollTo({ top: 0 }) }, []);
    useEffect(() => { if (cookiesRead && !id) router.push("/"); }, [cookiesRead, id, router]);

    const getOnboardingStatus = async () => {
        const { data } = await GET_API(endpoints.onboarding.getOnboardingStatus(id as string, role as UserRole));
        const currentStatus = data?.onboarded_status;
        if (currentStatus === "verification_completed") {
            Cookies.set("onboarded_status", "verification_completed", { expires: 1 });
            router.push(getDefaultRouteForRole(role as UserRole));
        }else if(currentStatus === "verification_rejected"){
            Cookies.set("onboarded_status", "verification_rejected", { expires: 1 });
            // Keep the rendered message in sync with what polling just found, instead
            // of only switching to the rejection copy after a manual reload.
            setOnboardedStatus("verification_rejected");
        }
        return data;
    }

    const { isLoading, isError } = useQuery<OnboardingStatus, Error>({
        queryKey: ["onboardingStatus", id, role],
        queryFn: getOnboardingStatus,
        enabled: !!id,
        refetchInterval: 15000,
    });

    if (isLoading || !role) {
        return (
            <div className="flex h-[60dvh] bg-background-input items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[60dvh] bg-background-input items-center justify-center">
                <p className="text-gray-500 text-lg">Failed to check your verification status. Please try again.</p>
            </div>
        );
    }

    const isRejected = onboarded_status === "verification_rejected";
    const verificationContent =
        role === "learner"
            ? isRejected
                ? LearnerRejectedMessage
                : LearnerThankyouCardConstants
            : isRejected
                ? VolunteerRejectedMessage
                : VolunteerThankyouCardConstants;
    const verificationTheme =
        role === "learner"
            ? { iconBgColor: "#DFF5FF", iconAccentColor: "#09BAEE" }
            : { iconBgColor: "#FFF0E6", iconAccentColor: "#E35D0B" };

    return (
        <div className="flex min-h-[60dvh] bg-background-input items-center justify-center flex-col gap-5 md:px-10">
            <ThankyouCard
                title={verificationContent.title}
                description={verificationContent.description}
                iconBgColor={verificationTheme.iconBgColor}
                iconAccentColor={verificationTheme.iconAccentColor}
            />
        </div>
    );
}