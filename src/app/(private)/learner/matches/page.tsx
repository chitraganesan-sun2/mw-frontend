"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LottieLoader from "@/components/common/Loader/Lottie";

// My Matches is now a tab of Seek Volunteer; this path is kept so older links and
// match_found notifications that already went out still land on it.
export default function MatchesRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/learner/volunteer?tab=matches");
    }, [router]);
    return <LottieLoader isLoading={true} />;
}
