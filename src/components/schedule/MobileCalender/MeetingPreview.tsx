"use client";
import { endpoints } from "@/api/constants";
import { PUT_API } from "@/api/request";
import FeedModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { useAppStore } from "@/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";

import { getCookie } from "@/utils/auth";
import { showToast } from "@/components/common/Toast";
import { useSendData } from "@/hooks/useReactQuery";
import MobileSideModal from "@/components/common/Modals/MobileSideModal";

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
    const queryClient = useQueryClient();
    const { currentMonth } = useAppStore();
    const role = getCookie("role");

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

    const eventData = event;
    const startTime = dayjs(event.start).local().format("dddd, MMMM D, h:mm A");
    const endTime = dayjs(event.end).local().format("h:mm A");
    const { title, extendedProps } = eventData;
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

    const handleFeedBack = () => {
        onClose()
        router.push(`/${role}/schedule?current_month=${currentMonth}&modal=feedback`);
    };

    const handleMarkAsCompleted = () => {
        setLoadingCompleted(true)
        PUT_API(endpoints.session.markAsCompleted(sessionId), {}).then(() => {
            if (role === "volunteer") {
                queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["learner-events"] });
            }
            onClose();
            setLoadingCompleted(false)
        });
    };

    const handleLinkCopy = () => {
        navigator.clipboard.writeText(meetLink);
        showToast({ type: "success", message: "Link copied to clipboard" });
    };

    const renderFooter = () => {
        const isFeedBackCompleted = (role === "volunteer" && feedBackCollectedFromVolunteer) || (role === "learner" && feedBackCollectedFromLearner)

        const feedBackStatus = {
            label: isFeedBackCompleted ? "Feedback Submited" : "Meeting Completed",
            value: isFeedBackCompleted ? <p className="text-green-700 text-sm font-semibold">Meeting Completed</p> : <p onClick={handleFeedBack} className="text-sm underline text-primary">Complete Feedback</p>
        }
        const statusMap = {
            pending: { label: "Status", value: <p className="text-orange-700 text-sm">Pending</p> },
            rejected: { label: "Status", value: <p className="text-red-700 text-sm">Unavailable</p> },
            accepted: { label: "Status", value: <p className="text-green-700 text-sm">Accepted</p> },
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
                    <Button
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon width="30" height="30" />
                    </Button>
                    <div className="flex flex-col gap-6 mt-10">
                        <div className="flex justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-xl text-black">{title}</p>
                                <p className="text-gray-light font-medium text-sm">
                                    {`${startTime} - ${endTime}`}
                                </p>
                            </div>
                        </div>
                        <Divider />
                        {status === "accepted" && (
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-col gap-2 mb-5">
                                        <Button
                                            onClick={() => window.open(meetLink, "_blank")}
                                            title="Join with Google Meet"
                                            customClassName="w-fit !bg-background-secondary !text-sm rounded-xl !outline-none !border-none !text-black"
                                        />
                                        <p className="font-medium text-xs">{meetLink?.replace("https://", "")}</p>
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