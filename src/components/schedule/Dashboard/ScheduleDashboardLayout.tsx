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
import { SCHEDULE_LABELS, type ScheduleRole } from "./scheduleCategories";

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
            {/* Centred under the switch. Book for Later is the main action, in the role colour. */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={onScheduleAvailability}
                    title={HELP.scheduleAvailability}
                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium leading-tight text-black hover:bg-gray-50 cursor-pointer"
                >
                    {SCHEDULE_LABELS.scheduleAvailability}
                </button>
                <button
                    type="button"
                    onClick={onBookForLater}
                    title={HELP.bookForLater}
                    className="btn-primary-fill inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium leading-tight hover:opacity-90 cursor-pointer"
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
