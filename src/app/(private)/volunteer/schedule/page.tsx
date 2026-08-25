"use client";

import dynamic from "next/dynamic";
import MyScheduleModal from "@/components/schedule/Modals/MyScheduleModal";
import ScheduleAvailabilitySection from "@/components/schedule/ScheduleAvailabilitySection";
import AcceptedSessionsList from "@/components/schedule/AcceptedSessionsList";

const Calendar = dynamic(() => import("@/components/schedule/Calender"), { ssr: false });
// NewEventModal pulls in @mui/x-date-pickers - defer it to its own chunk.
const NewEventModal = dynamic(() => import("@/components/schedule/Modals/NewEventModal"), { ssr: false });
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApprovalModal from "@/components/schedule/Modals/ApprovalModal";
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
    const [isOpenApproval, setIsOpenApproval] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isOpenNewEvent, setIsOpenNewEvent] = useState(false);
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

    const { data, isFetching } = useQuery({
        queryKey: ["volunteer-events", currentMonth],
        queryFn: getEvents,
    });

    const getVolunteerDetails = async () => {
        const res = await GET_API(
            endpoints.volunteer.getIndividualVolunteer(volunteerId as string)
        );
        if (res?.status === 200) {
            console.log("res?.data?.utc_offset", res?.data?.volunteer_contact_details?.utc_offset);
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

    const handleNewEventSubmit = () => {
        queryClient.invalidateQueries({ queryKey: ["volunteer-events", currentMonth] });
        handleNavigate();
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
            console.log("Error: ", err);
        },
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "my_schedule");
        setIsOpenApproval(modal === "approval_notification");
        setIsOpenFeedback(modal === "feedback");
        setIsOpenNewEvent(modal === "new_event");
    }, [modal]);

    return (
        <div className="w-full h-full animate-fadeIn">
            <ScheduleAvailabilitySection role="volunteer" />
            <AcceptedSessionsList role="volunteer" />
            {isFetching ? (
                <LottieLoader isLoading={true} fullscreen={false} />
            ) : isMobileOrTabScreen ? (
                <MobileCalender events={data || []} onDateSelect={handleDateSelect} />
            ) : (
                <Calendar events={data || []} onDateSelect={handleDateSelect} />
            )}
            <MyScheduleModal isOpen={isOpenSchedule} onClose={handleNavigate} />
            <ApprovalModal isOpen={isOpenApproval} onClose={handleNavigate} />
            <NewEventModal
                isOpen={isOpenNewEvent}
                onClose={handleNavigate}
                onSubmit={handleNewEventSubmit}
            />
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
