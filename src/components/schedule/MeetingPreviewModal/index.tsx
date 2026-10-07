"use client";
import { endpoints } from "@/api/constants";
import { PUT_API, POST_API } from "@/api/request";
import FeedModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { useAppStore } from "@/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";
import "./styles.css";
import { getCookie } from "@/utils/auth";
import { showToast } from "@/components/common/Toast";
import { useSendData } from "@/hooks/useReactQuery";
import { getApiErrorMessage } from "@/utils/apiError";
import { safeHref } from "@/utils/safeHref";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { canCompleteSession, canJoinSession, formatSessionWhen, getSessionInstantBounds } from "@/utils/sessionDisplay";

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
    // Two-step inline confirm: deleting a slot used to fire on a single click. A separate
    // modal isn't workable here - this popup is a z-9999 portal that closes on mouse-leave.
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deletingSlot, setDeletingSlot] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { currentMonth, learnerTimeZone, volunteerTimeZone } = useAppStore();
    const role = getCookie("role");
    const scheduleRole = role === "learner" ? "learner" : "volunteer";
    const timeZoneLabel = scheduleRole === "learner" ? learnerTimeZone : volunteerTimeZone;

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

    // This popover has no other way to dismiss via keyboard - it's a custom portal, not the
    // shared Modal/Drawer wrappers that get AntD's Escape handling for free.
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if ((!isAnimating && !isOpen) || !event) return null;

    const eventData = event._def;
    const { title, extendedProps } = eventData;
    // App-standard "October 15, 2026 · 6:00 PM – 6:45 PM EDT · 45 min", in the profile timezone.
    const whenLabel = formatSessionWhen({
        date: extendedProps.localDate ?? dayjs(event.start).format("YYYY-MM-DD"),
        start: extendedProps.localStartTime ?? dayjs(event.start).format("HH:mm"),
        end: extendedProps.localEndTime ?? (event.end ? dayjs(event.end).format("HH:mm") : null),
        timeZoneLabel,
    });
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
    // Join / Complete decisions use the absolute session instants (UTC fields), not the
    // profile-local wall-clock parsed in the browser's timezone.
    const bounds = getSessionInstantBounds(extendedProps, {
        date: extendedProps.localDate,
        start: extendedProps.localStartTime,
        end: extendedProps.localEndTime,
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
            // Previously no catch: any rejection (e.g. the backend's "can't complete before
            // the session ends" gate) left the button spinning forever with no message.
            .catch((err) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't mark the session as completed.") });
            })
            .finally(() => setLoadingCompleted(false));
    };

    const handleLinkCopy = () => {
        navigator.clipboard.writeText(meetLink);
        showToast({ type: "success", message: "Link copied to clipboard" });
    };

    const handleDeleteSlot = async (volunteer_slot_id: string) => {
        setDeletingSlot(true);
        const payload = [
            {
                date: dayjs(event.start).format("YYYY-MM-DD"),
                volunteer_slot_id: volunteer_slot_id,
            },
        ];
        await POST_API(endpoints.volunteer_slot.deleteParticularSlot, payload)
            .then(() => {
                showToast({ type: "success", message: "Slot deleted" });
                onClose();
                invalidateScheduleViews(queryClient, "volunteer");
            })
            .catch((err) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't delete the slot. Please try again.") });
            })
            .finally(() => {
                setDeletingSlot(false);
                setConfirmingDelete(false);
            });
    };

    const renderFeedbackForVolunter = () => {
        if (!feedBackCollectedFromVolunteer) {
            return (
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-sm text-gray-light">Session Completed</p>
                        <button
                            type="button"
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline cursor-pointer font-medium bg-transparent border-0 p-0"
                        >
                            Complete Feedback
                        </button>
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
                        <p className="font-medium text-sm text-gray-light">Session Completed</p>
                        <button
                            type="button"
                            onClick={handleFeedBack}
                            className="text-primary text-sm underline cursor-pointer font-medium bg-transparent border-0 p-0"
                        >
                            Complete Feedback
                        </button>
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
                role="dialog"
                aria-modal="true"
                aria-label="Availability slot"
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
                            <p className="text-gray-light font-medium text-sm">{whenLabel}</p>
                        </div>
                        <Button aria-label="Close"
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
                        {confirmingDelete ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-black">Delete this slot?</span>
                                <Button
                                    onClick={() => setConfirmingDelete(false)}
                                    disabled={deletingSlot}
                                    customClassName="w-fit bg-white !text-black border border-stroke hover:bg-white text-sm rounded-full !py-1.5 !px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleDeleteSlot(extendedProps.volunteer_slot_id)}
                                    loading={deletingSlot}
                                    customClassName="w-fit !bg-[#DC2626] !text-white border border-[#DC2626] hover:!bg-[#B91C1C] text-sm rounded-full !py-1.5 !px-4"
                                >
                                    Yes, delete
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setConfirmingDelete(true)}
                                customClassName="w-fit bg-white !text-[#DC2626] border border-[#DC2626] hover:bg-white hover:!text-[#DC2626] hover:border hover:border-[#DC2626] text-base rounded-full !py-2 !px-8"
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    if (typeof window === "undefined") return null; // SSR safety check

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Meeting preview"
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
                        <p className="text-gray-light font-medium text-sm">{whenLabel}</p>
                    </div>
                    <Button aria-label="Close"
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon />
                    </Button>
                </div>
                <Divider />
                {/* Join only while the session can still be joined (accepted, has a valid Meet
                    link, not yet ended) - it used to open an empty window / an ended meeting. */}
                {showJoin && (
                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => window.open(joinHref, "_blank", "noopener,noreferrer")}
                                    title="Join with Google Meet"
                                    customClassName="w-fit !bg-background-secondary rounded-xl !outline-none !border-none !text-black"
                                />
                                <p className="font-medium text-[12px] ml-1">{joinHref}</p>
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
                            : learner
                                ? `${learner.firstName}, ${volunteer_full_name}`
                                : volunteer_full_name}
                    </p>
                </div>
                <Divider />
                {status === "completed" && renderFeedback()}
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
                                {learner ? `${learner.firstName} completed the meeting` : "Meeting completed"}
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
