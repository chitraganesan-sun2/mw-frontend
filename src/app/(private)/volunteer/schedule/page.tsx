"use client";

import dynamic from "next/dynamic";
import MyScheduleModal from "@/components/schedule/Modals/MyScheduleModal";
import AddNewMeetingModalVolunteer from "@/components/schedule/Modals/AddNewMeetingModalVolunteer";
import ScheduleDashboardLayout from "@/components/schedule/Dashboard/ScheduleDashboardLayout";
import { CALENDAR_VIEW } from "@/components/schedule/Header";
import LearnerViewModal from "@/components/volunteers/Modals/LearnerViewModal";

const Calendar = dynamic(() => import("@/components/schedule/Calender"), { ssr: false });
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import FeedbackModal from "@/components/schedule/Modals/FeedbackModal";
import { useAppStore } from "@/store/useAppStore";
import { getCookie } from "@/utils/auth";
import { getCalendarEvents } from "@/utils/calender";
import { useSendData } from "@/hooks/useReactQuery";
import { useQueryState } from "nuqs";
import MobileCalender from "@/components/schedule/MobileCalender";
import InnerWidth from "@/utils/innerWidth";
import OnetImeScheduleModal from "@/components/schedule/Modals/OnetImeScheduleModal";
import { GET_API } from "@/api/request";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function SchedulePage() {
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isOpenAddSession, setIsOpenAddSession] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;
    const { eventDetails, currentMonth, setVolunteerUtcOffset, setVolunteerTimeZone, volunteerTimeZone } =
        useAppStore();
    const [modal, setModal] = useQueryState("modal");
    const [view] = useQueryState("view");
    const isCalendarView = view === CALENDAR_VIEW;
    const [learnerId, setLearnerId] = useQueryState("learnerId");
    const volunteerId = getCookie("volunteer_id");
    const [isOpenOnetImeSchedule, setIsOpenOnetImeSchedule] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const getEvents = () => getCalendarEvents(volunteerId as string, "volunteer", currentMonth);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["volunteer-events", currentMonth],
        queryFn: getEvents,
        // Wait for the header to put the URL's month in the store - fetching before that
        // loaded the current month first, then the requested one.
        // Only the calendar view shows these events.
        enabled: Boolean(currentMonth) && isCalendarView,
        // Keep showing the previous month while the next one loads, so the calendar stays
        // mounted (and keeps its Week/Day view) when navigation crosses a month boundary.
        placeholderData: keepPreviousData,
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

    useQuery<any>({
        queryKey: ["volunteer-details", volunteerId],
        queryFn: getVolunteerDetails,
    });

    const handleNavigate = () => {
        // Return to the view the modal was opened from.
        router.push(`/volunteer/schedule?${isCalendarView ? `view=${CALENDAR_VIEW}&` : ""}current_month=${currentMonth}`);
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
        success: () => {
            handleNavigate();
            invalidateScheduleViews(queryClient, "volunteer");
        },
        // Was silent: a rejected submission left the modal open with no explanation.
        error: (err) => showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't submit your feedback. Please try again.") }),
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "my_schedule");
        setIsOpenFeedback(modal === "feedback");
        setIsOpenAddSession(modal === "add_new_session");
    }, [modal]);

    return (
        <>
            <ScheduleDashboardLayout
                role="volunteer"
                isCalendarView={isCalendarView}
                timeZoneLabel={volunteerTimeZone}
                onScheduleAvailability={() => setModal("my_schedule")}
                onAddDateSlot={handleDateSelect}
                onOpenProfile={(id) => setLearnerId(id)}
                events={data}
                isLoading={isLoading || !currentMonth}
                isError={isError}
                onRetry={() => refetch()}
                calendar={
                    isMobileOrTabScreen ? (
                        <MobileCalender events={data || []} onDateSelect={handleDateSelect} />
                    ) : (
                        <Calendar events={data || []} onDateSelect={handleDateSelect} />
                    )
                }
            />
            <LearnerViewModal
                isOpen={!!learnerId && modal !== "add_new_meeting"}
                onClose={() => {
                    setLearnerId(null);
                    setModal(null);
                }}
            />
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
        </>
    );
}
