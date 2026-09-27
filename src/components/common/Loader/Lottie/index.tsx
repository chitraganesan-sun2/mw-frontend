"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LearnerLoadingAnimation from "@/assets/json/animations/Learner.json";
import VolunteerLoadingAnimation from "@/assets/json/animations/Volunteer.json";
import { getCookie } from "@/utils/auth";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });
import { createPortal } from "react-dom";

type Props = {
    isLoading: boolean;
    customClassName?: string;
    children?: React.ReactNode;
    zIndex?: string | number;
    fullscreen?: boolean;
};

const LottieLoader: React.FC<Props> = ({
    isLoading,
    customClassName,
    zIndex,
    fullscreen = false,
}) => {
    const role = getCookie("role");
    // The fullscreen variant portals into document.body, which doesn't exist during
    // SSR. Gating the whole component on `typeof window` used to make the server
    // render null while the client's first render (isLoading=true) showed the
    // loader immediately, causing a hydration mismatch on every page with a loader.
    // Deferring to an effect keeps the first client render identical to the server's.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isLoading) return null;

    const loaderContent = (
        <div
            className={`pointer-events-auto w-[6rem] md:w-[8rem] lg:w-[9rem] h-[6rem] md:h-[8rem] lg:h-[9rem] flex-center ${customClassName}`}
        >
            <Lottie
                loop
                play
                animationData={
                    role === "learner" ? LearnerLoadingAnimation : VolunteerLoadingAnimation
                }
                rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
                style={{ width: "100%", borderRadius: "10px" }}
            />
        </div>
    );

    if (!fullscreen) {
        return (
            <div className="flex h-full w-full min-h-0 items-center justify-center">
                {loaderContent}
            </div>
        );
    }

    if (!mounted) return null;

    return createPortal(
        <div
            style={{ zIndex: zIndex || 2000 }}
            className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none"
            aria-busy="true"
            role="status"
        >
            {loaderContent}
        </div>,
        document.body
    );
};

export default LottieLoader;
