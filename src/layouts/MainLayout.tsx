"use client";

import Sidebar from "@/components/common/Sidebar";
import NewMessageAlert from "@/components/common/NewMessageAlert";
import { FC, PropsWithChildren } from "react";
import { renderHeader } from "./helper";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/utils/merge-class";
import InnerWidth from "@/utils/innerWidth";
import useVerifiedSession from "@/hooks/useVerifiedSession";
import SessionCheck from "@/components/guards/SessionCheck";
import { ThankyouCardBase } from "@/components/landingpage/ThankyouCard";
import { LearnerThankyouCardConstants } from "@/constants/learner";
import { VolunteerRejectedMessage, VolunteerThankyouCardConstants } from "@/constants/volunteer";
import PolicyUpdateGate from "@/components/common/PolicyUpdateGate";
import RecordingConsentGate from "@/components/common/RecordingConsentGate";

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const width = InnerWidth();
    // The onboarded_status / role cookies are writable by the user, so they are only a routing
    // hint. Ask the server who this member really is and render nothing of the private shell
    // (sidebar, name, page) until it has answered; the status it returns - not the cookie -
    // decides whether the "pending / rejected" card replaces the page.
    const session = useVerifiedSession();
    const onboardedStatus = session.onboardedStatus;
    const role = session.role;
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

    if (session.phase !== "verified") {
        return <SessionCheck error={session.phase === "error"} onRetry={session.retry} />;
    }

    return (
        <div className='h-[100dvh] w-screen overflow-hidden flex'>
            {!isApprovalPending && <NewMessageAlert />}
            <PolicyUpdateGate />
            <RecordingConsentGate />
            {/* Sidebar: 1/6 of the screen, but never narrower than the logo + menu need (a fixed
                1/6 was ~180px on smaller laptops, which wrapped "MelodyWings") nor wider than on
                a 1920px screen, so large desktops look as before. */}
            {!isProfile && (
                <div className='max-lg:hidden shrink-0 w-[clamp(224px,16.667vw,320px)]'>
                    <Sidebar />
                </div>
            )}

            <div
                className={cn(
                    "flex flex-col w-full min-w-0 bg-white",
                    isProfile ? "w-full" : "lg:flex-1 lg:w-auto"
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