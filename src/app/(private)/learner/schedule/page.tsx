"use client";

import dynamic from "next/dynamic";
import AddNewMeetingModal from "@/components/schedule/Modals/AddNewMeetingModal";
import FeedbackModal from "@/components/schedule/Modals/FeedbackModal";
import LearnerScheduleModal from "@/components/schedule/Modals/LearnerScheduleModal";
import AcceptedSessionsList from "@/components/schedule/AcceptedSessionsList";

const Calendar = dynamic(() => import("@/components/schedule/Calender"), { ssr: false });
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { getCalendarEvents } from "@/utils/calender";
import { useQueryClient } from "@tanstack/react-query";
import { useSendData } from "@/hooks/useReactQuery";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useQueryState } from "nuqs";
import InnerWidth from "@/utils/innerWidth";
import MobileCalender from "@/components/schedule/MobileCalender";
import dayjs from "dayjs";

export default function LearnerSchedulePage() {
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isOpenAvailability, setIsOpenAvailability] = useState(false);

    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;

    const { eventDetails, currentMonth, setLearnerUtcOffset, setLearnerTimeZone } = useAppStore();
    const queryClient = useQueryClient();

    const [modal] = useQueryState("modal");
    const [presetDate] = useQueryState("date");
    const learnerId = getCookie("learner_id");

    const getEvents = () => getCalendarEvents(learnerId as string, "learner", currentMonth);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["learner-events", currentMonth],
        queryFn: getEvents,
        // A volunteer accepting/declining happens in their own separate browser session -
        // query invalidation in the volunteer's client can't reach this learner's cache, so
        // this needs to self-refresh. Matches the header bell's existing 30s poll cadence.
        refetchInterval: 30000,
    });

    const getLearnerDetails = async () => {
        const res = await GET_API(endpoints.learner.getIndividualLearner(learnerId as string));
        if (res?.status === 200) {
            setLearnerUtcOffset(res?.data?.learner_personal_info?.learner_contact_details?.utc_offset);
            setLearnerTimeZone(res?.data?.learner_personal_info?.learner_contact_details?.timezone);
            return res?.data;
        }
        return null;
    };

    const { data: learnerDetails } = useQuery<any>({
        queryKey: ["learner-details", learnerId],
        queryFn: getLearnerDetails,
    });

    const handleNavigate = () => {
        router.push(`/learner/schedule?current_month=${currentMonth}`);
    };

    // Clicking a day on the calendar opens Add New Session for that date - the learner
    // counterpart of the volunteer's click-a-day-to-add-availability.
    const handleDateSelect = (date: string) => {
        if (!date || dayjs(date).isBefore(dayjs(), "day")) return;
        router.push(`/learner/schedule?modal=add_new_meeting&date=${encodeURIComponent(date)}`);
    };

    const handleSubmitFeedback = async (formData: any) => {
        const payload = {
            comment: formData?.notes,
            volunteer_commitment_level: formData?.rating || 0,
            ...eventDetails,
        };
        return await POST_API(endpoints.learnerFeedback.create, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: (formData: any) => handleSubmitFeedback(formData),
        invalidateKey: ["learner-events"],
        success: () => {
            handleNavigate();
            queryClient.invalidateQueries({ queryKey: ["learner-events", currentMonth] });
        },
        error: (err) => {
        },
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "add_new_meeting");
        setIsOpenFeedback(modal === "feedback");
        setIsOpenAvailability(modal === "my_availability");
    }, [modal]);

    return (
        <>
            <div className="w-full h-full animate-fadeIn">
                <AcceptedSessionsList role="learner" />
                {/* isLoading (first load / uncached month) - not isFetching, which is also true on
                    every 30s background poll and was unmounting the whole calendar each time. */}
                {isLoading ? (
                    <LottieLoader isLoading={true} fullscreen={false} />
                ) : isError ? (
                    <div className="flex-center h-full w-full">Something went wrong loading your schedule.</div>
                ) : isMobileOrTabScreen ? (
                    <MobileCalender events={data || []} onDateSelect={handleDateSelect} />
                ) : (
                    <Calendar events={data || []} onDateSelect={handleDateSelect} />
                )}
                <AddNewMeetingModal
                    isOpen={isOpenSchedule}
                    onClose={handleNavigate}
                    initialDate={presetDate}
                />
                <LearnerScheduleModal isOpen={isOpenAvailability} onClose={handleNavigate} />
                <FeedbackModal
                    mode="create"
                    isOpen={isOpenFeedback}
                    onClose={handleNavigate}
                    onSubmit={onSave}
                    data={eventDetails}
                    Loading={isPending}
                />
            </div>
        </>
    );
}
