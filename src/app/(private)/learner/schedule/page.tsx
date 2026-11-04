"use client";

import dynamic from "next/dynamic";
import { buildFeedbackPayload } from "@/utils/feedbackForm";
import AddNewMeetingModal from "@/components/schedule/Modals/AddNewMeetingModal";
import FeedbackModal from "@/components/schedule/Modals/FeedbackModal";
import LearnerScheduleModal from "@/components/schedule/Modals/LearnerScheduleModal";
import ScheduleDashboardLayout from "@/components/schedule/Dashboard/ScheduleDashboardLayout";
import { CALENDAR_VIEW } from "@/components/schedule/Header";
import VolunteerViewModal from "@/components/learners/VolunteerViewModal";

const Calendar = dynamic(() => import("@/components/schedule/Calender"), { ssr: false });
import { useAppStore } from "@/store/useAppStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { getCalendarEvents } from "@/utils/calender";
import { useQueryClient } from "@tanstack/react-query";
import { useSendData } from "@/hooks/useReactQuery";
import { useQueryState } from "nuqs";
import InnerWidth from "@/utils/innerWidth";
import MobileCalender from "@/components/schedule/MobileCalender";
import { profileToday } from "@/utils/sessionDisplay";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function LearnerSchedulePage() {
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);
    const [isOpenAvailability, setIsOpenAvailability] = useState(false);

    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;

    const { eventDetails, currentMonth, setLearnerUtcOffset, setLearnerTimeZone, learnerTimeZone } = useAppStore();
    const queryClient = useQueryClient();

    const [modal, setModal] = useQueryState("modal");
    const [view] = useQueryState("view");
    // The same page backs My Schedule (sessions) and Book for Later (availability + calendar,
    // /learner/book-for-later re-exports it); the path says which.
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isPlanner = pathname.includes("/book-for-later");
    const basePath = isPlanner ? "/learner/book-for-later" : "/learner/schedule";
    const isCalendarView = isPlanner && view === CALENDAR_VIEW;
    // Older links (?view=calendar on My Schedule) land on the calendar's new home.
    useEffect(() => {
        if (!isPlanner && view === CALENDAR_VIEW) router.replace(`/learner/book-for-later?${searchParams.toString()}`);
    }, [isPlanner, view, router, searchParams]);
    const [presetDate] = useQueryState("date");
    const [volunteerId, setVolunteerId] = useQueryState("volunteerId");
    const learnerId = getCookie("learner_id");

    const getEvents = () => getCalendarEvents(learnerId as string, "learner", currentMonth);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["learner-events", currentMonth],
        queryFn: getEvents,
        // Wait for the header to put the URL's month in the store - fetching before that
        // loaded the current month first, then the requested one.
        // Only the calendar view shows these events.
        enabled: Boolean(currentMonth) && isCalendarView,
        // Keep showing the previous month while the next one loads, so the calendar stays
        // mounted (and keeps its Week/Day view) when navigation crosses a month boundary.
        placeholderData: keepPreviousData,
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

    useQuery<any>({
        queryKey: ["learner-details", learnerId],
        queryFn: getLearnerDetails,
    });

    const handleNavigate = () => {
        // Return to the view the modal was opened from.
        router.push(`${basePath}?${isCalendarView ? `view=${CALENDAR_VIEW}&` : ""}current_month=${currentMonth}`);
    };

    // Clicking a day on the calendar opens Book for Later for that date - the learner
    // counterpart of the volunteer's click-a-day-to-add-availability.
    const handleDateSelect = (date: string) => {
        // "Today" in the learner's PROFILE timezone, not the browser's.
        if (!date || date.slice(0, 10) < profileToday(learnerTimeZone)) return;
        router.push(`/learner/book-for-later?view=${CALENDAR_VIEW}&modal=add_new_meeting&date=${encodeURIComponent(date)}`);
    };

    const handleSubmitFeedback = async (formData: any) => {
        const payload = buildFeedbackPayload("learner", formData, eventDetails);
        return await POST_API(endpoints.learnerFeedback.create, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: (formData: any) => handleSubmitFeedback(formData),
        success: () => {
            handleNavigate();
            invalidateScheduleViews(queryClient, "learner");
        },
        // Was silent: a rejected submission left the modal open with no explanation.
        error: (err) => showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't submit your feedback. Please try again.") }),
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "add_new_meeting");
        setIsOpenFeedback(modal === "feedback");
        setIsOpenAvailability(modal === "my_availability");
    }, [modal]);

    return (
        <>
            <ScheduleDashboardLayout
                role="learner"
                isPlanner={isPlanner}
                isCalendarView={isCalendarView}
                timeZoneLabel={learnerTimeZone}
                onScheduleAvailability={() => setModal("my_availability")}
                onOpenProfile={(id) => setVolunteerId(id)}
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
            {/* Volunteer profile from a session card. Hidden while Book for Later is open -
                the profile's own "book a session" action routes through that modal. */}
            <VolunteerViewModal
                isOpen={!!volunteerId && modal !== "add_new_meeting"}
                onClose={() => {
                    setVolunteerId(null);
                    setModal(null);
                }}
            />
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
        </>
    );
}
