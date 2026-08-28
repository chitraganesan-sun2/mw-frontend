"use client";
import Image from "next/image";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import Button from "@/components/common/Button";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { PUT_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useSendData } from "@/hooks/useReactQuery";
import { useState } from "react";
import { cn } from "@/utils/merge-class";
import { showToast } from "@/components/common/Toast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface NotificationCardProps {
    data: {
        learner_first_name: string;
        learner_last_name: string;
        learner_picture: {
            image_url: string;
        };
        volunteer_full_name?: string;
        volunteer_picture?: {
            image_url: string;
        };
        session_date: string;
        session_start_time: string;
        session_end_time: string;
        session_title: string;
        session_id: string;
        overlapped_slot: boolean;
        volunteer_start_time: string;
        volunteer_end_time: string;
        volunteer_start_date: string;
        learner_start_time: string;
        learner_end_time: string;
        learner_start_date: string;
        is_read?: boolean;
        academic_skills?: string[];
        non_academic_skills?: string[];
    };
    /** Whose approval queue this card is shown in - determines which party's name/picture
     * and local time to display. Defaults to "volunteer" (the original, learner-initiated
     * request case). */
    viewerRole?: "learner" | "volunteer";
}

const NotificationCard: React.FC<NotificationCardProps> = ({ data, viewerRole = "volunteer" }) => {
    const isLearnerViewer = viewerRole === "learner";
    const otherPartyName = isLearnerViewer
        ? data?.volunteer_full_name
        : `${data?.learner_first_name} ${data?.learner_last_name}`;
    const otherPartyPicture = isLearnerViewer
        ? data?.volunteer_picture?.image_url
        : data?.learner_picture?.image_url;
    const displayDate = isLearnerViewer ? data?.learner_start_date : data?.volunteer_start_date;
    const displayStartTime = isLearnerViewer ? data?.learner_start_time : data?.volunteer_start_time;
    const displayEndTime = isLearnerViewer ? data?.learner_end_time : data?.volunteer_end_time;
    const queryClient = useQueryClient();
    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingDecline, setLoadingDecline] = useState(false);

    const formatTimeRange = (timeRange: string) => {
        const [start, end] = timeRange.split(" - ");
        const startDayjs = dayjs(start, "h:mm A");
        const endDayjs = dayjs(end, "h:mm A");

        if (startDayjs.format("A") === endDayjs.format("A")) {
            return `${startDayjs.format("h:mm")} - ${endDayjs.format("h:mm A")}`;
        }
        return `${startDayjs.format("h:mm A")} - ${endDayjs.format("h:mm A")}`;
    };

    const formatTime = (start: string, end: string) => {
        if (!start || !end) return "Time not set";

        const formatToAMPM = (time: string) => {
            const [hours, minutes] = time.split(":");
            const hoursNum = parseInt(hours);
            const ampm = hoursNum >= 12 ? "PM" : "AM";
            const formattedHours = hoursNum % 12 || 12;
            return `${formattedHours}:${minutes} ${ampm}`;
        };

        return `${formatToAMPM(start)} - ${formatToAMPM(end)}`;
    };

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
            queryClient.invalidateQueries({
                queryKey: [isLearnerViewer ? "learner-events" : "volunteer-events"],
            });
        });
    };

    const { mutate: onSave, isPending } = useSendData({
        // @ts-ignore
        fn: (status: string) => handleNotificationStatus(status, data?.session_id),
        invalidateKey: ["events"],
        success: () => {
            queryClient.invalidateQueries({
                queryKey: [isLearnerViewer ? "learner-approval-notifications" : "approval-notifications"],
            });
            queryClient.invalidateQueries({ queryKey: ["events"] });
            setLoadingAccept(false);
            setLoadingDecline(false);
        },
        error: (err) => {
            setLoadingAccept(false);
            setLoadingDecline(false);
        },
    });

    return (
        <div className="flex flex-col gap-4 border rounded-xl p-4 border-[#E0E0E0] h-fit min-w-[250px] md:w-[360px]">
            <div className="flex items-center gap-2">
                <div>
                    <Image src={otherPartyPicture || DummyProfileImg} alt="notification" width={40} height={40} className="h-[40px] w-[40px] object-cover rounded-full" />
                </div>
                <p className="font-normal">
                    <span className="font-semibold">{otherPartyName}</span>{" "}
                    requested for a meeting
                </p>
            </div>
            <div className="flex gap-2 items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-[0.75rem] font-medium text-gray-light">Subject</p>
                    <p className="text-sm font-medium">{data?.session_title}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[0.75rem] font-medium text-gray-light">Date</p>
                    <p className="text-sm font-medium">{dayjs(displayDate).format("D-MMM-YYYY")}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[0.75rem] font-medium text-gray-light">Time</p>
                    <p className="text-sm font-medium">
                        {formatTime(displayStartTime, displayEndTime)}
                    </p>
                </div>
            </div>
            {((data?.academic_skills?.length ?? 0) > 0 ||
                (data?.non_academic_skills?.length ?? 0) > 0) && (
                <div className="flex flex-col gap-1">
                    <p className="text-[0.75rem] font-medium text-gray-light">Focus areas</p>
                    <div className="flex flex-wrap gap-1">
                        {[...(data?.academic_skills || []), ...(data?.non_academic_skills || [])].map(
                            (skill) => (
                                <span
                                    key={skill}
                                    className="text-xs bg-[#F1F1F1] text-black rounded-full px-2 py-0.5"
                                >
                                    {skill}
                                </span>
                            )
                        )}
                    </div>
                </div>
            )}
            { data?.overlapped_slot &&
                <div className="bg-[#FEFCE8] p-3 rounded-xl">
                    <p className="text-xs text-[#CA8A04]">
                        <span className="mr-2 font-semibold text-[#A16207]">Conflict Alert:</span>
                        Accepting one meeting request for this date and time will decline all others. Please choose carefully.
                    </p>
                </div>
             }
            <div className="flex items-center gap-2 w-full">
                <Button
                    disabled={loadingAccept || loadingDecline}
                    loading={loadingDecline}
                    onClick={() => onSave("rejected")}
                    btnVariant="error"
                    icon={<MdClose className="text-[1.1rem]" />}
                    className={cn(
                        "w-full text-sm  h-9 !bg-error-light !border-error-light rounded-xl py-2 hover:!text-error",
                        loadingDecline && "!bg-error-light !border-error-light !cursor-not-allowed"
                    )}
                >
                    Decline
                </Button>
                <Button
                    disabled={loadingAccept || loadingDecline}
                    loading={loadingAccept}
                    onClick={() => onSave("accepted")}
                    btnVariant="success"
                    icon={<IoMdCheckmark className="text-[1.1rem]" />}
                    className={cn(
                        "w-full text-sm h-9 !bg-success-light !border-success-light rounded-xl py-2 hover:!text-success",
                        loadingAccept &&
                            "!bg-success-light !border-success-light !cursor-not-allowed"
                    )}
                >
                    Accept
                </Button>
            </div>
        </div>
    );
};

export const NotificationCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 border rounded-xl p-4 border-[#E0E0E0] h-fit min-w-[250px] md:w-[360px] animate-pulse">
            <div className="flex items-center gap-2">
                <div className="h-[40px] w-[40px] rounded-full bg-gray-300"></div>
                <div className="h-[16px] w-3/4 rounded-full bg-gray-300"></div>
            </div>
            <div className="flex gap-2 items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="h-3 w-10 rounded-full bg-gray-300"></div>
                    <div className="h-2 w-20 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="h-3 w-10 rounded-full bg-gray-300"></div>
                    <div className="h-2 w-20 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="h-3 w-10 rounded-full bg-gray-300"></div>
                    <div className="h-2 w-20 rounded-full bg-gray-300"></div>
                </div>
            </div>
            <div className="flex justify-between items-center gap-3">
                <div className="h-6 w-1/2 rounded-full bg-gray-300"></div>
                <div className="h-6 w-1/2 rounded-full bg-gray-300"></div>
            </div>
        </div>
    );
};

export default NotificationCard;
