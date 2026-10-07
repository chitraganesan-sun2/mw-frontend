"use client";

import Sidebar from "@/components/common/Sidebar";
import NewMessageAlert from "@/components/common/NewMessageAlert";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { renderHeader } from "./helper";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/utils/merge-class";
import InnerWidth from "@/utils/innerWidth";
import { getCookie } from "@/utils/auth";
import { ThankyouCardBase } from "@/components/landingpage/ThankyouCard";
import { LearnerThankyouCardConstants } from "@/constants/learner";
import { VolunteerRejectedMessage, VolunteerThankyouCardConstants } from "@/constants/volunteer";

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const width = InnerWidth();
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server (status/role unknown, always renders the real
    // page) differ from the client's first render (real cookie -> may render the
    // ThankYou card instead), a hydration mismatch on every page load for any
    // pending/rejected user, since this layout wraps every private page. Deferring to
    // an effect keeps the first client render identical to the server's.
    const [onboardedStatus, setOnboardedStatus] = useState<string | undefined>(undefined);
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setOnboardedStatus(getCookie("onboarded_status"));
        setRole(getCookie("role"));
    }, []);
    const isProfile = pathname.includes("profile");
    const isMessagesChatPage =
        (pathname?.includes("/volunteer/messages") || pathname?.includes("/learner/messages")) &&
        searchParams?.get("chatId");
    const isMobile = width > 0 && width < 768;
    const hideHeaderInLayout = isMessagesChatPage && isMobile;
    const isApprovalPending = ["verification_pending", "verification_rejected"].includes(
        onboardedStatus || ""
    );
    const pendingContent =
        role === "learner"
            ? LearnerThankyouCardConstants
            : onboardedStatus === "verification_pending"
              ? VolunteerThankyouCardConstants
              : VolunteerRejectedMessage;

    const header = renderHeader(pathname);

    return (
        <div className='h-[100dvh] w-screen overflow-hidden flex'>
            {!isApprovalPending && <NewMessageAlert />}
            {!isProfile && (
                <div className='max-lg:hidden w-1/6'>
                    <Sidebar />
                </div>
            )}

            <div
                className={cn(
                    "flex flex-col w-full bg-white",
                    isProfile ? "w-full" : "lg:w-5/6"
                )}
            >
                {!hideHeaderInLayout && (
                    <div className='w-full lg:min-h-[10vh]'>{header}</div>
                )}
                <div
                    className={cn(
                        "flex-grow overflow-y-auto bg-background-input",
                        isProfile ? "" : "lg:rounded-tl-[50px]"
                    )}
                >
                    {isApprovalPending ? (
                        <div className="flex min-h-[60dvh] bg-background-input items-center justify-center flex-col gap-5 md:px-10 py-8">
                            <ThankyouCardBase
                                title={pendingContent.title}
                                description={pendingContent.description}
                                iconBgColor={role === "learner" ? "#DFF5FF" : "#FFF0E6"}
                                iconAccentColor={role === "learner" ? "#09BAEE" : "#E35D0B"}
                            />
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;