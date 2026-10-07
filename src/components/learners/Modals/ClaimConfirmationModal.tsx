"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "antd";
import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import ConfirmationSuccessfulModal from "./ConfirmationSuccessfulModal";
import { GET_API, DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDuration, formatSessionTime, getDurationMinutes, shortTimeZone } from "@/utils/sessionDisplay";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import useInnerWidth from "@/hooks/useInnerWidth";
import { cn } from "@/utils/merge-class";

interface ClaimConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<boolean | void>;
    onUnclaim?: () => void;
    isClaiming?: boolean;
    /** Called with true/false to control the full-screen loader */
    onClaimLoadingChange?: (loading: boolean) => void;
    session: {
        id: string;
        title: string;
        status: "available" | "claimed";
        tags: string[];
        description: string;
        startTime: string;
        endTime: string;
        timezone: string;
        duration: string;
        instructor: {
            name: string;
            profilePicture?: string;
        };
        meetingLink?: string;
        guests?: string[];
    };
}

const ClaimConfirmationModal: React.FC<ClaimConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onUnclaim,
    session,
    isClaiming = false,
    onClaimLoadingChange,
}) => {
    const queryClient = useQueryClient();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successSession, setSuccessSession] = useState<any>(session);
    const [showConfirmation, setShowConfirmation] = useState(true);

    // Reset confirmation state when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowConfirmation(true);
            setIsSuccessModalOpen(false);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        // Close confirmation modal immediately before showing loader
        setShowConfirmation(false);
        
        try {
            const success = await onConfirm?.();
            if (success === true) {
                try {
                    // Keep loader showing while fetching session details
                    // Fetch the latest session details
                    const response = await GET_API(endpoints.session.getLearnerInstantSessionDetail(session.id));
                    const apiData = response.data;

                    if (apiData) {
                        const formattedSession = {
                            id: apiData.volunteer_slot_id,
                            title: apiData.title,
                            // App-standard "6:00 PM", "45 min", DST-correct zone abbreviation.
                            startTime: formatSessionTime(apiData.start_time),
                            endTime: formatSessionTime(apiData.end_time),
                            timezone: apiData.volunteer_timezone
                                ? shortTimeZone(apiData.volunteer_timezone, apiData.date)
                                : session.timezone,
                            duration: formatDuration(
                                typeof apiData.duration === "number"
                                    ? apiData.duration
                                    : getDurationMinutes(apiData.start_time, apiData.end_time)
                            ),
                            instructor: {
                                name: apiData.volunteer_name,
                                profilePicture: apiData.volunteer_image?.image_url || "/dummy-profile.webp",
                            },
                            meetingLink: apiData.meet_link,
                            // The backend deliberately stops returning volunteer_email/
                            // learner_email here (privacy fix) - apiData.volunteer_name is
                            // the only participant name this endpoint actually provides, so
                            // that's the only "guest" (the host) we can show.
                            guests: [apiData.volunteer_name],
                        };
                        setSuccessSession(formattedSession);
                    }
                } catch (error) {
                    console.error("Failed to fetch session details:", error);
                    // Fallback to original session if fetch fails
                    setSuccessSession(session);
                } finally {
                    // Hide loader after session details are fetched (or failed)
                    onClaimLoadingChange?.(false);
                }
                setIsSuccessModalOpen(true);
            } else {
                // Hide loader if claim failed
                onClaimLoadingChange?.(false);
            }
        } catch {
            // Hide loader on error
            onClaimLoadingChange?.(false);
            // Parent shows toast on error
        }
    };

    const handleCloseSuccess = () => {
        setIsSuccessModalOpen(false);
        onClose();
    };

    const handleCancelSession = async () => {
        if (!successSession?.id) return;

        // Show loader
        onClaimLoadingChange?.(true);

        try {
            const res = await DELETE_API(endpoints.session.unclaimInstantSession(successSession.id));
            if (res.status === 200 || res.status === 201) {
                showToast({ message: "Session unclaimed successfully", type: "success" });
                
                // Invalidate every view of this session (instant lists, dashboard, calendar).
                invalidateScheduleViews(queryClient, "learner");

                // Wait for the instant lists (today and tomorrow) to refetch before hiding the loader.
                await Promise.all([
                    queryClient.refetchQueries({ queryKey: ["learner-instant-sessions"] }),
                    queryClient.refetchQueries({ queryKey: ["learner-accepted-instant-sessions"] }),
                ]);
                
                onUnclaim?.();
                // Modal already closed by ConfirmationSuccessfulModal, just ensure state is updated
                setIsSuccessModalOpen(false);
            } else {
                showToast({ message: "Failed to unclaim session", type: "error" });
            }
        } catch (error) {
            console.error("Error unclaiming session:", error);
            showToast({ message: "Failed to unclaim session", type: "error" });
        } finally {
            // Hide loader after all API calls complete
            onClaimLoadingChange?.(false);
        }
    };

    const innerWidth = useInnerWidth();
    const isMobile = innerWidth > 0 && innerWidth < 768;

    const showModal = !isSuccessModalOpen && showConfirmation;
    const headerContent = (
        <h2 className="text-[20px] font-medium text-[#121212]">Confirmation</h2>
    );
    const footerContent = (
        <div className="w-full flex gap-3 pb-2">
            <Button
                title="Cancel"
                btnVariant="tertiary"
                customClassName="!bg-white !text-black !border !border-gray-300 flex-1"
                onClick={onClose}
            />
            <Button
                title={isClaiming ? "Claiming..." : "Yes Confirm"}
                btnVariant="secondary"
                customClassName="flex-1"
                onClick={handleConfirm}
                disabled={isClaiming}
            />
        </div>
    );
    const modalBodyContent = (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-[#4F4F4F] leading-relaxed">
                Please confirm if you want to claim the &ldquo;<span className="text-[#121212]">{session.title}</span>&rdquo; session hosted by <span className="text-[#121212]">{session.instructor.name}</span>, scheduled from <span className="text-[#121212]">{session.startTime} to {session.endTime}</span>.
            </p>
            <div className="bg-[#E0F2FE] rounded-lg p-4">
                <p className="text-sm text-[#4F4F4F] leading-relaxed">
                    <span className="font-medium text-[#121212]">Note:</span> The appointment, including the session link, will be added to your calendar once it&apos;s confirmed.
                </p>
            </div>
        </div>
    );

    return (
        <>
            {showModal &&
                (isMobile ? (
                    <Drawer
                        open={isOpen}
                        onClose={onClose}
                        placement="bottom"
                        height={370}
                        closable={false}
                        className={cn(
                            "claim-confirmation-drawer",
                            "[&_.ant-drawer-content-wrapper]:!rounded-t-2xl [&_.ant-drawer-content-wrapper]:!overflow-hidden",
                            "[&_.ant-drawer-content]:!rounded-t-2xl [&_.ant-drawer-content]:!overflow-hidden",
                            "[&_.ant-drawer-body]:!rounded-t-2xl"
                        )}
                        styles={{
                            wrapper: { borderRadius: "16px 16px 0 0", overflow: "hidden" },
                            content: { borderRadius: "16px 16px 0 0", overflow: "hidden" },
                            body: {
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                overflow: "hidden",
                                borderRadius: "16px 16px 0 0",
                            },
                        }}
                    >
                        <div className="flex flex-col h-full overflow-hidden rounded-t-2xl">
                            <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-stroke">
                                {headerContent}
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                                {modalBodyContent}
                            </div>
                            <div className="flex-shrink-0 px-6 py-4 border-t border-stroke bg-white">
                                {footerContent}
                            </div>
                        </div>
                    </Drawer>
                ) : (
                    <CenterModal
                        isOpen={isOpen}
                        onClose={onClose}
                        width={520}
                        hideCloseIcon={true}
                        headerComponent={headerContent}
                        headerClassName="!px-6 !py-5 !border-0 !justify-start"
                        bodyClassName="!px-6 !py-3"
                        footerComponent={footerContent}
                        footerClassName="!px-6 !py-4 !border-0"
                    >
                        {modalBodyContent}
                    </CenterModal>
                ))}

            {/* Success Modal - Always render, controlled by isOpen prop */}
            <ConfirmationSuccessfulModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccess}
                session={successSession}
                onCancelMeeting={handleCancelSession}
            />
        </>
    );
};

export default ClaimConfirmationModal;
