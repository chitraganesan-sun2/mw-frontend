"use client";
import type { ReactNode } from "react";
import LottieLoader from "@/components/common/Loader/Lottie";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { CALENDAR_SECTION_ID } from "@/components/schedule/Header";
import AvailabilitySection from "./AvailabilitySection";
import CalendarLegend from "./CalendarLegend";
import MyScheduleSection from "./MyScheduleSection";
import type { ScheduleRole } from "./scheduleCategories";
import { shortTimeZone } from "@/utils/sessionDisplay";

interface ScheduleDashboardLayoutProps {
    role: ScheduleRole;
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
 * The Schedule dashboard (the signed-in landing page): Availability and My Schedule side by
 * side on wide screens, stacked on small ones, with the calendar below. The header's
 * "View my calendar" scrolls/focuses the calendar section by its id.
 */
const ScheduleDashboardLayout: React.FC<ScheduleDashboardLayoutProps> = ({
    role,
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
    return (
    <div className="w-full animate-fadeIn p-3 lg:p-5 flex flex-col gap-4">
        <div className="grid gap-4 xl:grid-cols-5">
            <div className="xl:col-span-2 min-w-0">
                <AvailabilitySection
                    role={role}
                    timeZoneLabel={tz}
                    onScheduleAvailability={onScheduleAvailability}
                    onAddDateSlot={onAddDateSlot}
                    onOpenProfile={onOpenProfile}
                />
            </div>
            <div className="xl:col-span-3 min-w-0">
                <MyScheduleSection role={role} timeZoneLabel={tz} onOpenProfile={onOpenProfile} />
            </div>
        </div>

        <section
            id={CALENDAR_SECTION_ID}
            tabIndex={-1}
            aria-labelledby="my-calendar-heading"
            className="bg-white rounded-xl scroll-mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
                <h2 id="my-calendar-heading" className="text-base font-semibold">
                    My Calendar
                </h2>
                <CalendarLegend role={role} />
            </div>
            {/* isLoading (first load / uncached month) - not isFetching, which is also true on
                every 30s background poll and would unmount the calendar each time. */}
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
        </section>
    </div>
    );
};

export default ScheduleDashboardLayout;
