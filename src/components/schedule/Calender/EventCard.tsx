import { cn } from "@/utils/merge-class";
import dayjs from "dayjs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { KeyboardEvent } from "react";

const EventCard = ({
    title,
    time,
    onEventClick,
    className,
    status,
    style,
    start,
    end,
}: EventCardProps) => {
    const isMobile = useMediaQuery("(max-width: 767px)");
    const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px)");
    const isDesktop = useMediaQuery("(min-width: 1400px)");
    
    // Show dot and title on mobile and desktop, hide on tablet
    const showDotAndTitle = isMobile || isDesktop;
    
    const statusStyles = {
        accepted: {
            bg: "bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]",
            dot: "bg-[#15803D]",
        },
        pending: {
            bg: "bg-[#F4F7FB] border-[#E0E0E0] text-[#4F4F4F]",
            dot: "bg-[#4F4F4F]",
        },
        rejected: {
            bg: "bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]",
            dot: "bg-[#B91C1C]",
        },
        completed: {
            bg: "bg-blue-200 border !border-blue-600 text-blue",
            dot: "bg-blue-600",
        },
    };

    const currentStyle = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
    const startTime = dayjs(start).local().format("h:mm A");
    const endTime = dayjs(end).local().format("h:mm A");

    // AllEventsModal's onEventClick reads e?.currentTarget off whatever event this fires
    // with (see src/components/schedule/Modals/AllEventsModal.tsx), so the keyboard path
    // forwards the KeyboardEvent itself rather than calling a plain () => void - it needs
    // the same DOM element a click would have given it, e.g. for popover positioning.
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEventClick?.(e);
        }
    };

    // Some callers (MobileCalender) render this purely for display, with their own
    // separate wrapping element owning the actual click - don't make this focusable
    // with nothing for it to do.
    const interactiveProps = onEventClick
        ? { role: "button" as const, tabIndex: 0, onKeyDown: handleKeyDown }
        : {};

    return (
        <div
            onClick={onEventClick}
            {...interactiveProps}
            className={cn(
                "flex items-center w-full text-sm px-2 py-1 border cursor-pointer overflow-hidden event-card-container",
                showDotAndTitle ? "justify-between" : "justify-center",
                className,
                currentStyle.bg
            )}
        >
            {showDotAndTitle ? (
                <>
                    <div className="flex items-center gap-2 truncate overflow-hidden min-w-0 flex-1 event-title-section">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 event-dot ${currentStyle.dot}`} />
                        <span className="font-normal capitalize !text-sm truncate">{title}</span>
                    </div>
                    <span className="text-xs whitespace-nowrap flex-shrink-0 event-time-section">{time || `${startTime} - ${endTime}`}</span>
                </>
            ) : (
                <span className="text-xs whitespace-nowrap flex-shrink-0 event-time-section">{time || `${startTime} - ${endTime}`}</span>
            )}
        </div>
    );
};

export default EventCard;
