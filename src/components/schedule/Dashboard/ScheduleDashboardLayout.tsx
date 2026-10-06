"use client";
import type { ReactNode } from "react";
import LottieLoader from "@/components/common/Loader/Lottie";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import AvailabilitySection from "./AvailabilitySection";
import CalendarLegend from "./CalendarLegend";
import MyScheduleSection from "./MyScheduleSection";
import type { ScheduleRole } from "./scheduleCategories";
import { shortTimeZone } from "@/utils/sessionDisplay";

interface ScheduleDashboardLayoutProps {
    role: ScheduleRole;
    /** "calendar" (?view=calendar, header's "View my calendar") or the schedule view. */
    isCalendarView: boolean;
    timeZoneLabel?: string;
    onScheduleAvailability: () => void;
    onAddDateSlot?: (date: string) => void;
    onOpenProfile: (userId: string) => void;
    events?: unknown[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    calendar: ReactNode;
}

/**
 * The Schedule dashboard (the signed-in landing page). Two views, switched from the header:
 * - schedule: Availability and My Schedule (side by side on wide screens, stacked on small);
 * - calendar: the calendar on its own, full width.
 * The calendar used to sit below everything else, which made the page long and "View my
 * calendar" only scrolled to it.
 */
const ScheduleDashboardLayout: React.FC<ScheduleDashboardLayoutProps> = ({
    role,
    isCalendarView,
    timeZoneLabel,
    onScheduleAvailability,
    onAddDateSlot,
    onOpenProfile,
    events,
    isLoading,
    isError,
    onRetry,
    calendar,
}) => {
    const tz = shortTimeZone(timeZoneLabel);

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

    return (
        <div className="w-full animate-fadeIn p-3 lg:p-5 grid gap-4 xl:grid-cols-5 items-start">
            <div className="xl:col-span-3 min-w-0">
                <MyScheduleSection role={role} timeZoneLabel={tz} onOpenProfile={onOpenProfile} />
            </div>
            <div className="xl:col-span-2 min-w-0">
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
