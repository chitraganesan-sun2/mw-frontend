"use client";
import { endpoints } from "@/api/constants";
import { PUT_API, POST_API } from "@/api/request";
import FeedModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { useAppStore } from "@/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";
import "./styles.css";
import { getCookie } from "@/utils/auth";
import { showToast } from "@/components/common/Toast";
import { useSendData } from "@/hooks/useReactQuery";

interface MeetingPreviewModalProps {
    data: any;
    isOpen: boolean;
    onClose: () => void;
    event: any;
    style?: React.CSSProperties;
    onMouseLeave?: () => void;
}

const MeetingPreviewModal: React.FC<MeetingPreviewModalProps> = ({
    isOpen,
    onClose,
    event,
    style,
    onMouseLeave,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingDecline, setLoadingDecline] = useState(false);
    const [loadingCompleted, setLoadingCompleted] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentMonth } = useAppStore();
    const role = getCookie("role");

    const markNotificationAsRead = async (sessionIds: (string | undefined)[]) => {
        const validSessionIds = sessionIds.filter((id): id is string => Boolean(id));
        if (!validSessionIds.length) return;
        try {
            await POST_API(endpoints.session.updateReadsNotifications, {
                session_ids: validSessionIds,
            });
            queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        } catch (error) {
            console.error("Error marking notifications as read: ", error);
        }
    };

    const handleNotificationStatus = async (status: string, sessionId: string) => {
        if (status === "accepted") {
            setLoadingAccept(true);
        } else {
            setLoadingDecline(true);
        }
        return await PUT_API(endpoints.session.updateNotificationStatus(sessionId), {
            status: status,
        }).then(async () => {
            if (status === "accepted") {
                await markNotificationAsRead([sessionId]);
            }
            if (status === "accepted") {
                showToast({ type: "success", message: "Invitation Accepted" });
            } else {
                showToast({ type: "error", message: "Invitation Declined" });
            }
        });
    };

    const { mutate: onSave, isPending } = useSendData({
        // @ts-ignore
        fn: (status: string) => handleNotificationStatus(status, sessionId),
        invalidateKey: ["events "],
        success: () => {
            queryClient.invalidateQueries({
                queryKey: [role === "learner" ? "learner-approval-notifications" : "approval-notifications"],
            });
            if (role === "volunteer") {
                queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["learner-events"] });
            }
            setLoadingAccept(false);
            setLoadingDecline(false);
            onClose();
        },
        error: (err) => {
            console.log("Error: ", err);
            setLoadingAccept(false);
            setLoadingDecline(false);
        },
    });

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if ((!isAnimating && !isOpen) || !event) return null;

    const eventData = event._def;
    const startTime = dayjs(event.start).local().format("dddd, MMMM D, h:mm A");
    const endTime = dayjs(event.end).local().format("h:mm A");
    const { title, extendedProps } = eventData;
    const {
        meetLink,
        learner,
        status,
        sessionId,
        volunteer_full_name,
        feedBackCollectedFromLearner,
        feedBackCollectedFromVolunteer,
        initiatedBy,
    } = extendedProps;
    // Only the recipient of a pending request can accept/decline it - not whoever initiated
    // it (legacy sessions have no initiatedBy stored, and were always learner-initiated).
    const canRespondToPending = (initiatedBy || "learner") !== role;

    const handleFeedBack = () => {
        onClose();
        router.push(`/${role}/schedule?current_month=${currentMonth}&modal=feedback`);
    };

    const handleMarkAsCompleted = () => {
        setLoadingCompleted(true);
        PUT_API(endpoints.session.markAsCompleted(sessionId), {}).then(() => {
            if (role === "volunteer") {
                queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["learner-events"] });
            }
            onClose();
            setLoadingCompleted(false);
        });
    };

    const handleLinkCopy = () => {
        navigator.clipboard.writeText(meetLink);
        showToast({ type: "success", message: "Link copied to clipboard" });
    };

    const handleDeleteSlot = async (volunteer_slot_id: string) => {
        const payload = [
            {
                date: dayjs(event.start).format("YYYY-MM-DD"),
                volunteer_slot_id: volunteer_slot_id,
            },
        ];
        console.log(payload, "payload");
        await POST_API(endpoints.volunteer_slot.deleteParticularSlot, payload)
            .then(() => {
                showToast({ type: "success", message: "Slot deleted" });
                onClose();
                // Optionally, refresh the calendar data
                queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
            })
            .catch((err) => {
                console.log(err, "error in deleting slot");
            });
    };

    const renderFeedbackForVolunter = () => {
        if (!feedBackCollectedFromVolunteer) {
            return (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm text-gray-light">Meeting Completed</p>
                        <p
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline cursor-pointer font-medium"
                        >
                            Complete Feedback
                        </p>
                    </div>
                </div>
            );
        } else if (feedBackCollectedFromVolunteer) {
            return (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm text-success">Feedback Completed</p>
                        {/* <p
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline font-medium"
                        >
                            See Feedback
                        </p> */}
                    </div>
                </div>
            );
        }
    };

    const renderFeedbackForLearner = () => {
        if (!feedBackCollectedFromLearner) {
            return (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm text-gray-light">Meeting Completed</p>
                        <p
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline cursor-pointer font-medium"
                        >
                            Complete Feedback
                        </p>
                    </div>
                </div>
            );
        } else if (feedBackCollectedFromLearner) {
            return (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm text-success">Feedback Completed</p>
                        {/* <p
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline font-medium"
                        >
                            See Feedback
                        </p> */}
                    </div>
                </div>
            );
        }
    };

    const renderFeedback = () => {
        if (role === "volunteer") {
            return renderFeedbackForVolunter();
        } else if (role === "learner") {
            return renderFeedbackForLearner();
        }
    };

    if (extendedProps.isAvailableSlot) {
        if (typeof window === "undefined") return null; // SSR safety check

        return createPortal(
            <div
                className={`meeting-preview-modal border border-stroke bg-white rounded-lg shadow-lg ${isVisible ? "modal-visible" : "modal-hidden"
                    }`}
                style={{
                    ...style,
                    position: "fixed",
                    zIndex: 9999,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseLeave={onMouseLeave}
            >
                <div className="flex flex-col gap-6 p-5">
                    <div className="flex justify-between gap-3">
                        <div className="flex flex-col gap-1">
                            <p className="font-semibold text-xl text-black">{title}</p>
                            <p className="text-gray-light font-medium text-sm">
                                {`${startTime} - ${endTime}`}
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                        >
                            <FeedModalCloseIcon />
                        </Button>
                    </div>
                    <Divider />
                    <div className="flex flex-row items-center justify-between">
                        <span className="text-gray-light font-medium text-base">
                            Availability Status
                        </span>
                        <Button
                            onClick={() => handleDeleteSlot(extendedProps.volunteer_slot_id)}
                            customClassName="w-fit bg-white !text-[#DC2626] border border-[#DC2626] hover:bg-white hover:!text-[#DC2626] hover:border hover:border-[#DC2626] text-base rounded-full !py-2 !px-8"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    if (typeof window === "undefined") return null; // SSR safety check

    return createPortal(
        <div
            className={`meeting-preview-modal border border-stroke bg-white rounded-lg shadow-lg ${isVisible ? "modal-visible" : "modal-hidden"
                }`}
            style={{
                ...style,
                position: "fixed",
                zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex flex-col gap-6 p-5">
                <div className="flex justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-xl text-black">{title}</p>
                        <p className="text-gray-light font-medium text-sm">
                            {`${startTime} - ${endTime}`}
                        </p>
                    </div>
                    <Button
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon />
                    </Button>
                </div>
                <Divider />
                {status === "accepted" && (
                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => window.open(meetLink, "_blank")}
                                    title="Join with Google Meet"
                                    customClassName="w-fit !bg-background-secondary rounded-xl !outline-none !border-none !text-black"
                                />
                                <p className="font-medium text-[12px] ml-1">{meetLink}</p>
                            </div>
                            <Button
                                title="Copy Link"
                                customClassName="w-fit !bg-white hover:!bg-white !text-black text-sm rounded-full !py-0 !px-5"
                                onClick={handleLinkCopy}
                            />
                        </div>
                        <Divider />
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-sm text-gray-light">
                        {role === "learner" ? "Volunteer" : "Guest"}
                    </p>
                    <p className="text-black font-medium">
                        {role === "learner"
                            ? volunteer_full_name
                            : `${learner.firstName}, ${volunteer_full_name}`}
                    </p>
                </div>
                <Divider />
                {status === "completed" && renderFeedback()}
                {status === "accepted" && (
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-gray-light font-medium text-sm">Availability Status</p>
                        {status === "accepted" ? (
                            <Button
                                loading={loadingCompleted}
                                disabled={loadingCompleted}
                                onClick={() => handleMarkAsCompleted()}
                                title="Mark as completed"
                                customClassName="w-fit bg-white !text-[#DC2626] border border-[#DC2626] hover:bg-white hover:!text-[#DC2626] hover:border hover:border-[#DC2626] text-sm rounded-full !py-0 !px-5"
                            />
                        ) : (
                            <p className="text-[#DC2626] font-medium text-xs">
                                {`${learner.firstName} completed the meeting`}
                            </p>
                        )}
                    </div>
                )}
                {status === "pending" && canRespondToPending && (
                    <div className="flex items-center gap-2 w-full">
                        <Button
                            disabled={loadingAccept || loadingDecline}
                            loading={loadingDecline}
                            onClick={() => onSave("rejected")}
                            btnVariant="error"
                            icon={<MdClose className="text-[1.1rem]" />}
                            className="w-full text-sm  h-9 !bg-error-light !border-error-light rounded-xl py-2 hover:!text-error"
                        >
                            Decline
                        </Button>
                        <Button
                            disabled={loadingAccept || loadingDecline}
                            loading={loadingAccept}
                            onClick={() => onSave("accepted")}
                            btnVariant="success"
                            icon={<IoMdCheckmark className="text-[1.1rem]" />}
                            className="w-full text-sm h-9 !bg-success-light !border-success-light rounded-xl py-2 hover:!text-success "
                        >
                            Accept
                        </Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default MeetingPreviewModal;
