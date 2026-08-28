import SideModal from "@/components/common/Modals/SideModal";
import React, { useState, useEffect } from "react";
import NotificationCard from "@/components/schedule/NotificationCard";
import { NotificationCardSkeleton } from "@/components/schedule/NotificationCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import dayjs from "dayjs";
import InnerWidth from "@/utils/innerWidth";
import { ApprovalModalProps } from "./index.type.d";

type SessionsData = {
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
};

interface NotificationData {
    date: string;
    sessions: SessionsData[];
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, role = "volunteer" }) => {
    const [notificationsData, setNotificationsData] = useState<NotificationData[]>([]);
    const isLearner = role === "learner";
    const volunteerId = getCookie("volunteer_id");
    const learnerId = getCookie("learner_id");
    const queryClient = useQueryClient();

    const getNotifications = async () => {
        const response: any = await GET_API(
            isLearner
                ? endpoints.session.getPendingInvitesForLearner(learnerId as string)
                : endpoints.session.getApprovalNotifications(volunteerId as string)
        );
        return response?.data;
    };

    const { data, isFetching, isError } = useQuery({
        queryKey: [isLearner ? "learner-approval-notifications" : "approval-notifications", isOpen],
        queryFn: () => getNotifications(),
        enabled: isOpen,
    });

    const handleUpdateReadsNotifications = async () => {
        // Opening the bell = "seen". Clear every unread session notification for this user,
        // not just the pending invites listed here - otherwise session_accepted /
        // session_rejected / session_cancelled notices never get marked read and the badge
        // count stays > 0 with nothing left to act on.
        try {
            await POST_API(endpoints.session.markAllNotificationsRead, {});
            queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        } catch (error) {
            console.error("Error updating unread sessions:", error);
        }
    };

    useEffect(() => {
        if (data) {
            const transformedData = data?.items || [];
            setNotificationsData(transformedData);

            // Debug: Log all sessions and their is_read status
            data?.items?.forEach((item: any, index: number) => {
                console.log(`Item ${index} (${item.date}):`, item.sessions?.map((session: any) => ({
                    session_id: session.session_id,
                    is_read: session.is_read
                })));
            });

            handleUpdateReadsNotifications();
        }
    }, [data]);

    const isMobileScreen = InnerWidth() < 768;

    return (
        <SideModal
            title="Approval Notifications"
            onClose={onClose}
            isOpen={isOpen}
            isNeedButton={false}
            modalWidth={isMobileScreen ? "100%" : 400}
        >
            <div className="flex flex-col gap-4 px-5 mt-5">
                {isFetching ? (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <NotificationCardSkeleton key={index} />
                        ))}
                    </div>
                ) : isError ? (
                    <p>Error loading notifications</p>
                ) : notificationsData.length > 0 ? (
                    notificationsData.map((notification) => (
                        <div>
                            <div className="relative inline-flex items-center justify-center w-full">
                                <hr className="w-full h-px my-6 bg-gray-light border-0" />
                                <span className="absolute -translate-x-1/2 left-1/2 px-3 font-semibold !text-sm !text-gray-light !bg-white">
                                    {dayjs(notification?.date).format("D MMM YYYY")}
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {notification?.sessions?.map((session) => (
                                    <NotificationCard
                                        key={session?.session_id}
                                        data={session}
                                        viewerRole={role}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col gap-4 border rounded-xl p-4 border-[#E0E0E0] h-fit lg:w-[360px] items-center justify-center">
                        <p className="text-gray-light text-sm font-medium">
                            No Notifications Available
                        </p>
                    </div>
                )}
            </div>
        </SideModal>
    );
};

export default ApprovalModal;
