"use client";
import { endpoints } from "@/api/constants";
import { PUT_API } from "@/api/request";
import FeedModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { useAppStore } from "@/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";

import { getCookie } from "@/utils/auth";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { useSendData } from "@/hooks/useReactQuery";
import MobileSideModal from "@/components/common/Modals/MobileSideModal";
import { safeHref } from "@/utils/safeHref";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import {
    canCompleteSession,
    canJoinSession,
    formatSessionWhen,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
} from "@/utils/sessionDisplay";

interface MobileMeetingPreviewModalProps {
    data: any;
    isOpen: boolean;
    onClose: () => void;
    event: any;
    style?: React.CSSProperties;
    onMouseLeave?: () => void;
}

const MobileMeetingPreviewModal: React.FC<MobileMeetingPreviewModalProps> = ({
    isOpen,
    onClose,
    event,
    style,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { currentMonth, learnerTimeZone, volunteerTimeZone } = useAppStore();
    const role = getCookie("role");
    const scheduleRole = role === "learner" ? "learner" : "volunteer";
    const timeZoneLabel = scheduleRole === "learner" ? learnerTimeZone : volunteerTimeZone;

    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingDecline, setLoadingDecline] = useState(false);
    const [loadingCompleted, setLoadingCompleted] = useState(false);

    const handleNotificationStatus = async (status: string, sessionId: string) => {
        if (status === "accepted") {
            setLoadingAccept(true);
        } else {
            setLoadingDecline(true);
        }
        return await PUT_API(endpoints.session.updateNotificationStatus(sessionId), {
            status: status,
        }).then(() => {
            if (status === "accepted") {
                showToast({ type: "success", message: "Invitation Accepted" });
            } else {
                showToast({ type: "info", message: "Invitation declined" });
            }
        });
    };

    const { mutate: onSave, isPending } = useSendData({
        // @ts-ignore
        fn: (status: string) => handleNotificationStatus(status, sessionId),
        success: () => {
            invalidateScheduleViews(queryClient, scheduleRole);
            setLoadingAccept(false);
            setLoadingDecline(false);
            onClose();
        },
        error: (err) => {
            setLoadingAccept(false);
            setLoadingDecline(false);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't update the invitation. Please try again.") });
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

    const eventData = event;
    const { title, extendedProps } = eventData;
    // App-standard "October 15, 2026 · 6:00 PM – 6:45 PM EDT · 45 min", in the profile timezone.
    const whenLabel = formatSessionWhen({
        date: extendedProps?.localDate ?? dayjs(event.start).format("YYYY-MM-DD"),
        start: extendedProps?.localStartTime ?? dayjs(event.start).format("HH:mm"),
        end: extendedProps?.localEndTime ?? (event.end ? dayjs(event.end).format("HH:mm") : null),
        timeZoneLabel,
    });
    const {
        meetLink,
        learner,
        sessionId,
        volunteer_full_name,
        feedBackCollectedFromLearner,
        feedBackCollectedFromVolunteer,
        initiatedBy,
    } = extendedProps;
    const status = event?.status || extendedProps?.status;
    // Only the recipient of a pending request can accept/decline it - not whoever initiated
    // it (legacy sessions have no initiatedBy stored, and were always learner-initiated).
    const canRespondToPending = (initiatedBy || "learner") !== role;
    // Absolute instants (UTC fields) for Join / Complete - see getSessionInstantBounds.
    const bounds = getSessionInstantBounds(extendedProps, {
        date: extendedProps?.localDate,
        start: extendedProps?.localStartTime,
        end: extendedProps?.localEndTime,
        timeZoneLabel,
    });
    const joinHref = safeHref(meetLink);
    const showJoin = Boolean(joinHref) && canJoinSession({ status, meet_link: joinHref }, bounds?.end);
    // Completion is only allowed once the scheduled end has passed (backend-enforced).
    const showComplete = canCompleteSession({ status }, bounds);

    const handleFeedBack = () => {
        onClose();
        // Keep the view the user is on (the calendar is ?view=calendar).
        const view = searchParams.get("view");
        router.push(`/${role}/schedule?${view ? `view=${encodeURIComponent(view)}&` : ""}current_month=${currentMonth}&modal=feedback`);
    };

    const handleMarkAsCompleted = () => {
        setLoadingCompleted(true);
        PUT_API(endpoints.session.markAsCompleted(sessionId), {})
            .then(() => {
                invalidateScheduleViews(queryClient, scheduleRole);
                onClose();
            })
            // No catch before: any rejection (e.g. "hasn't started yet") left the button
            // spinning forever with no message - same fix as the desktop MeetingPreviewModal.
            .catch((err) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't mark the session as completed.") });
            })
            .finally(() => setLoadingCompleted(false));
    };

    const handleLinkCopy = () => {
        navigator.clipboard.writeText(meetLink);
        showToast({ type: "success", message: "Link copied to clipboard" });
    };

    const renderFooter = () => {
        const isFeedBackCompleted = (role === "volunteer" && feedBackCollectedFromVolunteer) || (role === "learner" && feedBackCollectedFromLearner)

        const feedBackStatus = {
            label: isFeedBackCompleted ? "Feedback Submitted" : "Session Completed",
            value: isFeedBackCompleted ? <p className="text-green-700 text-sm font-semibold">Session Completed</p> : <button type="button" onClick={handleFeedBack} className="text-sm underline text-primary bg-transparent border-0 p-0 cursor-pointer">Complete Feedback</button>
        }
        const statusMap = {
            // Same labels/colours as everywhere else (utils/sessionDisplay); "rejected" used
            // to read "Unavailable" here only.
            pending: { label: "Status", value: <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass("pending")}`}>{getStatusLabel("pending")}</span> },
            rejected: { label: "Status", value: <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass("rejected")}`}>{getStatusLabel("rejected")}</span> },
            accepted: { label: "Status", value: <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass("accepted")}`}>{getStatusLabel("accepted")}</span> },
            completed: feedBackStatus,
        };

        const { label = "", value = "" } = statusMap[status as keyof typeof statusMap] || {};

        return (
            <div className="flex justify-between !text-sm">
                <p className="!text-sm">{label}</p>
                {value}
            </div>
        );
    };

    return (
        <MobileSideModal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col justify-between h-full">
                <div className="p-5 h-full">
                    <Button aria-label="Close"
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon width="30" height="30" />
                    </Button>
                    <div className="flex flex-col gap-6 mt-10">
                        <div className="flex justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-xl text-black">{title}</p>
                                <p className="text-gray-light font-medium text-sm">{whenLabel}</p>
                            </div>
                        </div>
                        <Divider />
                        {showJoin && (
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-col gap-2 mb-5">
                                        <Button
                                            onClick={() => window.open(joinHref, "_blank", "noopener,noreferrer")}
                                            title="Join with Google Meet"
                                            customClassName="w-fit !bg-background-secondary !text-sm rounded-xl !outline-none !border-none !text-black"
                                        />
                                        <p className="font-medium text-xs">{joinHref?.replace("https://", "")}</p>
                                    </div>
                                    <Button
                                        title="Copy Link"
                                        customClassName="w-fit !bg-white hover:!bg-white !text-black text-sm rounded-full !py-0 !px-2"
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
                                    : learner
                                        ? `${learner.firstName ?? ""} ${learner.lastName ?? ""}`.trim() || "—"
                                        : "—"}
                            </p>
                        </div>
                        <Divider />
                        {showComplete && (
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-gray-light font-medium text-sm">Availability Status</p>
                                {showComplete ? (
                                    <Button
                                        loading={loadingCompleted}
                                        disabled={loadingCompleted}
                                        onClick={() => handleMarkAsCompleted()}
                                        title="Mark as completed"
                                        customClassName="w-fit bg-white !text-[#DC2626] border border-[#DC2626] hover:bg-white hover:!text-[#DC2626] hover:border hover:border-[#DC2626] text-sm rounded-full !py-0 !px-5"
                                    />
                                ) : (
                                    <p className="text-[#DC2626] font-medium text-xs">
                                        {learner
                                            ? `${[learner.firstName, learner.lastName].filter(Boolean).join(" ") || "Guest"} completed the meeting`
                                            : "Meeting completed"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <Divider />
                <div className="p-4">
                    {status === "pending" && canRespondToPending ? (
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
                    ) : renderFooter()}
                </div>
            </div>
        </MobileSideModal>
    );
};

export default MobileMeetingPreviewModal;