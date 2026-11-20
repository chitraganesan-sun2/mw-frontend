"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSubmittedApplication } from "@/utils/applicationSuccess";
import { useJoinUsStore } from "@/store/useJoinUsStore";
import { ThankyouCardBase } from "@/components/landingpage/ThankyouCard";

const JoinUsSuccessPage = () => {
    const router = useRouter();
    const { clearStore } = useJoinUsStore();
    // null = still checking (the persisted store is read after mount).
    const [confirmed, setConfirmed] = useState<boolean | null>(null);

    useEffect(() => {
        // Only thank someone whose application was actually submitted (application id from the API
        // + step 3 done); a typed URL or old bookmark goes back to the form.
        if (hasSubmittedApplication(useJoinUsStore.getState())) {
            setConfirmed(true);
            // Clear all form data once application is finished and user sees success
            clearStore();
        } else {
            router.replace("/join-us");
        }
    }, [clearStore, router]);

    if (!confirmed) return null;

    return (
        <div className="flex min-h-[60dvh] bg-background-input items-center justify-center flex-col gap-5 md:px-10">
            <ThankyouCardBase
                title="Thank You for Your Application!"
                // Role-neutral page: neutral icon instead of the volunteer-orange default.
                iconBgColor="#EDEDED"
                iconAccentColor="#121212"
                description="Thank you for applying to join MelodyWings. We appreciate your interest and enthusiasm in becoming part of our community. Our team will review your application and get back to you soon. We look forward to connecting with you and exploring the possibilities ahead."
            />
        </div>
    );
};

export default JoinUsSuccessPage;