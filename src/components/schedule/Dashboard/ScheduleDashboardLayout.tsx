"use client";
import type { ReactNode } from "react";
import LottieLoader from "@/components/common/Loader/Lottie";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { HiOutlinePlus } from "react-icons/hi2";
import BookSessionTabs from "@/components/booking/BookSessionTabs";
import { HELP, TERMS } from "@/constants/copy";
import AvailabilitySection from "./AvailabilitySection";
import CalendarLegend from "./CalendarLegend";
import MyScheduleSection from "./MyScheduleSection";
import ProfileNudge from "./ProfileNudge";
import type { ScheduleRole } from "./scheduleCategories";

interface ScheduleDashboardLayoutProps {
    role: ScheduleRole;
    /** true on the Book for Later page (availability + calendar), false on My Schedule (sessions only). */
    isPlanner: boolean;
    /** The calendar view of My Schedule (?view=calendar), or the list. */
    isCalendarView: boolean;
    timeZoneLabel?: string;
    onScheduleAvailability: () => void;
    /** Opens the booking form (learner books a volunteer's time / volunteer proposes a session). */
    onBookForLater: () => void;
    onAddDateSlot?: (date: string) => void;
    onOpenProfile: (userId: string) => void;
    events?: unknown[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    calendar: ReactNode;
}

/**
 * The Schedule dashboard (the signed-in landing page), split over two pages:
 * - My Schedule: the activity list, or (?view=calendar) the same activity as a calendar;
 * - Scheduled Sessions / Book for Later (one of the two Book a Session options): the booking actions and Availability.
 */
const ScheduleDashboardLayout: React.FC<ScheduleDashboardLayoutProps> = ({
    role,
    isPlanner,
    isCalendarView,
    timeZoneLabel,
    onScheduleAvailability,
    onBookForLater,
    onAddDateSlot,
    onOpenProfile,
    events,
    isLoading,
    isError,
    onRetry,
    calendar,
}) => {
    // Raw profile label; each row resolves the in-effect abbreviation for its own date.
    const tz = timeZoneLabel;

    if (isCalendarView) {
        return (
            <section aria-label="My Calendar" className="w-full animate-fadeIn p-3 lg:p-5">
                <div className="bg-white rounded-xl">
                    <div className="px-4 pt-4">
                        <CalendarLegend role={role} />
                    </div>
                    {/* isLoading (first load / uncached month) - not isFetching, which is also true
                        on every 30s background poll and would unmount the calendar each time. */}
                    {isLoading ? (
                        <LottieLoader isLoading={true} fullscreen={false} />
                    ) : isError ? (
                        <div className="p-4">
                            <QueryErrorNotice message="Couldn't load your calendar." onRetry={onRetry} />
                        </div>
                    ) : (
                        <>
                            {(events?.length ?? 0) === 0 && (
                                <p className="px-4 pt-2 text-sm text-gray-600">No sessions or availability scheduled this month.</p>
                            )}
                            {calendar}
                        </>
                    )}
                </div>
            </section>
        );
    }

    // My Schedule: just the sessions.
    if (!isPlanner) {
        return (
            <div className="w-full animate-fadeIn p-3 lg:p-5 grid gap-4 grid-cols-1 items-start">
                <ProfileNudge role={role} />
                <div className="min-w-0">
                    <MyScheduleSection role={role} timeZoneLabel={tz} onOpenProfile={onOpenProfile} />
                </div>
            </div>
        );
    }

    // Scheduled Sessions (Book for Later): the booking actions and availability, under the
    // Book a Session switch so the other option (Instant Sessions) is one tap away.
    return (
        <div className="w-full animate-fadeIn p-3 lg:p-5 grid gap-4 grid-cols-1 items-start">
            <BookSessionTabs />
            {/* Explained and centred like the Instant Sessions page: what this is, and its one action. */}
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-medium text-gray-900">{TERMS.scheduledSessions}</h2>
                <p className="max-w-2xl text-sm text-gray-500">
                    {role === "learner" ? HELP.bookForLaterLearner : HELP.bookForLaterVolunteer}
                </p>
                <button
                    type="button"
                    onClick={onBookForLater}
                    title={HELP.bookForLater}
                    className="btn-primary-fill mt-2 inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl px-5 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    <HiOutlinePlus size={16} aria-hidden="true" />
                    {TERMS.bookForLater}
                </button>
            </div>
            <div className="min-w-0">
                <AvailabilitySection
                    role={role}
                    timeZoneLabel={tz}
                    onScheduleAvailability={onScheduleAvailability}
                    onAddDateSlot={onAddDateSlot}
                    onOpenProfile={onOpenProfile}
                />
            </div>
        </div>
    );
};

export default ScheduleDashboardLayout;
