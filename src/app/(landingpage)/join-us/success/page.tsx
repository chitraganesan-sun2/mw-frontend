"use client";

import { useEffect } from "react";
import { useJoinUsStore } from "@/store/useJoinUsStore";
import { ThankyouCardBase } from "@/components/landingpage/ThankyouCard";

const JoinUsSuccessPage = () => {
    const { clearStore } = useJoinUsStore();

    useEffect(() => {
        // Clear all form data once application is finished and user sees success
        clearStore();
    }, [clearStore]);

    return (
        <div className="flex min-h-[60dvh] bg-background-input items-center justify-center flex-col gap-5 md:px-10">
            <ThankyouCardBase
                title="Thank You for Your Application!"
                // Role-neutral page: neutral icon instead of the volunteer-orange default.
                iconBgColor="#EDEDED"
                iconAccentColor="#121212"
                description="Thank you for applying to join Melody Wings. We appreciate your interest and enthusiasm in becoming part of our community. Our team will review your application and get back to you soon. We look forward to connecting with you and exploring the possibilities ahead."
            />
        </div>
    );
};

export default JoinUsSuccessPage;