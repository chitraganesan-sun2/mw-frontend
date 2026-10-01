"use client";

import dynamic from "next/dynamic";
import MyScheduleModal from "@/components/schedule/Modals/MyScheduleModal";
import AddNewMeetingModalVolunteer from "@/components/schedule/Modals/AddNewMeetingModalVolunteer";
import AcceptedSessionsList from "@/components/schedule/AcceptedSessionsList";

const Calendar = dynamic(() => import("@/components/schedule/Calender"), { ssr: false });
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FeedbackModal from "@/components/schedule/Modals/FeedbackModal";
import { useAppStore } from "@/store/useAppStore";
import { getCookie } from "@/utils/auth";
import { getCalendarEvents } from "@/utils/calender";
import { useSendData } from "@/hooks/useReactQuery";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useQueryState } from "nuqs";
import MobileCalender from "@/components/schedule/MobileCalender";
import InnerWidth from "@/utils/innerWidth";
import OnetImeScheduleModal from "@/components/schedule/Modals/OnetImeScheduleModal";
import { GET_API } from "@/api/request";

export default function SchedulePage() {
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isOpenAddSession, setIsOpenAddSession] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;
    const { eventDetails, currentMonth, setVolunteerUtcOffset, setVolunteerTimeZone } =
        useAppStore();
    const [modal] = useQueryState("modal");
    const volunteerId = getCookie("volunteer_id");
    const [isOpenOnetImeSchedule, setIsOpenOnetImeSchedule] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const getEvents = () => getCalendarEvents(volunteerId as string, "volunteer", currentMonth);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["volunteer-events", currentMonth],
        queryFn: getEvents,
        // A learner booking/cancelling happens in their own separate browser session - query
        // invalidation in the learner's client can't reach this volunteer's cache, so this
        // needs to self-refresh. Matches the header bell's existing 30s poll cadence.
        refetchInterval: 30000,
    });

    const getVolunteerDetails = async () => {
        const res = await GET_API(
            endpoints.volunteer.getIndividualVolunteer(volunteerId as string)
        );
        if (res?.status === 200) {
            setVolunteerUtcOffset(res?.data?.volunteer_contact_details?.utc_offset);
            setVolunteerTimeZone(res?.data?.volunteer_contact_details?.timezone);
            return res?.data;
        }
        return null;
    };

    const { data: volunteerDetails } = useQuery<any>({
        queryKey: ["volunteer-details", volunteerId],
        queryFn: getVolunteerDetails,
    });

    const handleNavigate = () => {
        router.push(`/volunteer/schedule?current_month=${currentMonth}`);
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setIsOpenOnetImeSchedule(true);
    };

    const handleOpenOnetImeSchedule = () => {
        setIsOpenOnetImeSchedule(!isOpenOnetImeSchedule);
    };

    const handleSubmitFeedback = async (formData: any) => {
        const payload = {
            comment: formData?.notes,
            learner_interest_level: formData?.rating || 0,
            ...eventDetails,
        };
        return await POST_API(endpoints.volunterFeedback.create, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: (formData: any) => handleSubmitFeedback(formData),
        invalidateKey: ["volunteer-events"],
        success: () => {
            handleNavigate();
            queryClient.invalidateQueries({ queryKey: ["volunteer-events", currentMonth] });
        },
        error: (err) => {
        },
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "my_schedule");
        setIsOpenFeedback(modal === "feedback");
        setIsOpenAddSession(modal === "add_new_session");
    }, [modal]);

    return (
        <div className="w-full h-full animate-fadeIn">
            <AcceptedSessionsList role="volunteer" />
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
            <MyScheduleModal isOpen={isOpenSchedule} onClose={handleNavigate} />
            <AddNewMeetingModalVolunteer isOpen={isOpenAddSession} onClose={handleNavigate} />
            <FeedbackModal
                mode="create"
                isOpen={isOpenFeedback}
                onClose={handleNavigate}
                onSubmit={onSave}
                data={eventDetails}
                Loading={isPending}
            />
            <OnetImeScheduleModal
                isOpen={isOpenOnetImeSchedule}
                onClose={handleOpenOnetImeSchedule}
                isMobileScreen={isMobileOrTabScreen}
                currentDate={selectedDate}
            />
        </div>
    );
}
