"use client";
import { useAppStore } from "@/store/useAppStore";
import { EventApi, EventClickArg, formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import MeetingPreviewModal from "../MeetingPreviewModal";
import { AlertModal, AllEventsModal } from "../Modals";
import DayCellContent from "./DayCellContent";
import EventCard from "./EventCard";
import "./styles.css";

interface CalendarProps {
    events: any;
    onDateSelect?: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateSelect }) => {
    const [showModal, setShowModal] = useState<ModalType>(null);
    const [currentEventData, setCurrentEventData] = useState<{
        events: EventApi[];
        date: string;
        w?: any;
    }>({
        events: [],
        date: "",
    });

    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
    const [showPreview, setShowPreview] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
    const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<EventApi | null>(null);
    const calendarRef = useRef<any>(null);
    /** Below 1280px: always show 1 event + "+N more". Wider screens: auto-fit events in the cell. */
    const [dayMaxEvents, setDayMaxEvents] = useState<number | boolean>(1);
    const searchParams = useSearchParams();
    const currentDate = searchParams.get("current_month");
    const modalParam = searchParams.get("modal");
    const { setEventDetails } = useAppStore();

    useEffect(() => {
        if (modalParam === "feedback") {
            setShowPreview(false);
        }
    }, [modalParam]);

    useLayoutEffect(() => {
        const LAPTOP_MAX_WIDTH_PX = 1280; // Tailwind xl — typical laptop with sidebar
        const updateDayMax = () => {
            setDayMaxEvents(window.innerWidth < LAPTOP_MAX_WIDTH_PX ? 1 : true);
        };
        updateDayMax();
        window.addEventListener("resize", updateDayMax);
        return () => window.removeEventListener("resize", updateDayMax);
    }, []);

    const handleEventClick = (clickInfo: EventClickArg) => {
        const rect = clickInfo?.el?.getBoundingClientRect();

        // Calculate position relative to viewport
        let xPosition = rect.left;
        let yPosition = rect.bottom + 10;

        // Adjust for viewport edges
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // const modalWidth = 450;
        // const modalHeight = 400;
        const modalWidth = 405;
        const modalHeight = 315;
        if (xPosition + modalWidth > viewportWidth) {
            xPosition = viewportWidth - modalWidth - 10;
        }

        if (yPosition + modalHeight > viewportHeight) {
            yPosition = rect.top - modalHeight - 10;
        }

        setPreviewPosition({ x: xPosition, y: yPosition });
        setSelectedEvent(clickInfo.event);
        setSelectedEventForFeedback(clickInfo.event);
        setShowPreview(true);

        clickInfo.jsEvent.preventDefault();
        clickInfo.jsEvent.stopPropagation();
    };

    const handleModalEventClick = (buttonElement: HTMLButtonElement, data: any) => {
        const rect = buttonElement.getBoundingClientRect();

        // Calculate position relative to viewport
        let xPosition = rect.left;
        let yPosition = rect.bottom + 10;

        // Adjust for viewport edges
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = 405;
        const modalHeight = 315;

        if (xPosition + modalWidth > viewportWidth) {
            xPosition = viewportWidth - modalWidth - 10;
        }

        if (yPosition + modalHeight > viewportHeight) {
            yPosition = rect.top - modalHeight - 10;
        }

        setPreviewPosition({ x: xPosition, y: yPosition });
        setSelectedEvent(data);
        setSelectedEventForFeedback(data);
        setShowPreview(true);
    };

    const handleCloseModal = () => {
        setShowModal(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("modal");
        window.history.replaceState({}, "", url);
    };

    const renderEventContent = (eventInfo: any) => {
        const startDayjs = dayjs(eventInfo.event.start);
        const endDayjs = dayjs(eventInfo.event.end);
        let startTime, endTime;

        if (startDayjs.isValid() && endDayjs.isValid()) {
            startTime = startDayjs.format("h:mm A");
            endTime = endDayjs.format("h:mm A");
        } else {
            // Fallback for invalid dates
            startTime = "Invalid";
            endTime = "Time";
        }
        return (
            <EventCard
                title={eventInfo.event.title}
                time={`${startTime} - ${endTime}`}
                status={eventInfo.event._def.extendedProps.status}
            />
        );
    };

    const customDayHeaderContent = (args: any) => {
        const dayIcons: { [key: string]: string } = {
            Mon: "⛷️",
            Tue: "☕",
            Wed: "🐪",
            Thu: "🧠",
            Fri: "🍸",
            Sat: "🎉",
            Sun: "💆🏻‍♀️",
        };
        return <DayCellContent day={args.text} icon="" />;
    };

    const dayCellClassNames = "min-h-[100px] bg-white hover:bg-gray-50";

    const handleMoreLinkClick = (arg: any) => {
        arg.jsEvent.preventDefault();

        const dateEvents = arg.allSegs.map((seg: any) => seg?.event);

        // FullCalendar's moreLinkClick arg.date might be in UTC or have timezone issues
        // The most reliable way is to get the date from the events themselves or use dateStr
        let dateStr: string;

        // First, try to get dateStr if available (most reliable)
        if (arg.dateStr) {
            dateStr = arg.dateStr;
        } else if (dateEvents.length > 0 && dateEvents[0].start) {
            // Use the first event's start date to determine the correct date
            // Events should have the correct date that matches the calendar cell
            // Format the event's start date to get just the date part (YYYY-MM-DD)
            const eventDate = dayjs(dateEvents[0].start);
            dateStr = eventDate.format("YYYY-MM-DD");
        } else {
            // Fallback: The arg.date might be in UTC or have timezone offset
            // Since arg.date shows the wrong day, we need to get the calendar day
            // Try using the view's date system or calculate from the date
            // If arg.date is "Wed Mar 25 2026 17:00:00" but calendar shows 26,
            // we might need to add a day or use a different extraction method
            // For now, use dayjs to parse and format, which should handle timezone
            const parsedDate = dayjs(arg.date);
            dateStr = parsedDate.format("YYYY-MM-DD");

            // If this still gives wrong date, we might need to check the calendar cell's date
            // But since we have events, the first condition should catch it
        }

        // Format for display using the correct date string
        const formattedDate = dayjs(dateStr).format("MMM DD, YYYY");

        setCurrentEventData({
            events: dateEvents,
            date: formattedDate,
        });
        setShowModal("events");
    };

    // Add a click handler to close the preview when clicking outside
    useEffect(() => {
        if (typeof window === "undefined") return; // SSR safety check

        const handleClickOutside = (event: MouseEvent) => {
            if (showPreview) {
                const modal = document.querySelector(".meeting-preview-modal");
                if (modal && !modal.contains(event.target as Node)) {
                    setShowPreview(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPreview]);

    useEffect(() => {
        if (currentDate && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(dayjs(currentDate).format("YYYY-MM-DD"));
        }
    }, [currentDate]);

    useEffect(() => {
        setEventDetails(selectedEventForFeedback);
    }, [selectedEventForFeedback]);

    const handleEventMouseEnter = (mouseEnterInfo: any) => {
        const rect = mouseEnterInfo.el.getBoundingClientRect();

        // Calculate position relative to viewport
        let xPosition = rect.left;
        let yPosition = rect.bottom + 10;

        // Adjust for viewport edges
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = 405;
        const modalHeight = 315;

        if (xPosition + modalWidth > viewportWidth) {
            xPosition = viewportWidth - modalWidth - 10;
        }

        if (yPosition + modalHeight > viewportHeight) {
            yPosition = rect.top - modalHeight - 10;
        }

        setPreviewPosition({ x: xPosition, y: yPosition });
        setSelectedEvent(mouseEnterInfo.event);
        setSelectedEventForFeedback(mouseEnterInfo.event);
        setShowPreview(true);
    };

    const handleEventMouseLeave = () => {
        setShowPreview(false);
    };

    const handleDateClick = (arg: any) => {
        const clickedDate = dayjs(arg.dateStr);
        const currentDate = dayjs().startOf("day");

        if (clickedDate.isSame(currentDate) || clickedDate.isAfter(currentDate)) {
            if (onDateSelect) {
                onDateSelect(arg.dateStr);
            }
        }
    };

    // Preprocess events: fix midnight-crossing (end before start on same day).
    // Memoized so hover/click state changes (showPreview, selectedEvent, etc.) don't
    // produce a new array identity on every render, which defeated FullCalendar's
    // internal event-diffing and forced a full re-render of the calendar each time.
    const processedEvents = useMemo(
        () =>
            events?.map((event: any) => {
                if (event.start && event.end) {
                    const startDayjs = dayjs(event.start);
                    const endDayjs = dayjs(event.end);
                    if (
                        startDayjs.isValid() &&
                        endDayjs.isValid() &&
                        endDayjs.isBefore(startDayjs)
                    ) {
                        return {
                            ...event,
                            end: endDayjs.add(1, "day").toISOString(),
                        };
                    }
                }
                return event;
            }) || [],
        [events]
    );

    return (
        <>
            <MeetingPreviewModal
                isOpen={showPreview}
                data={events}
                onClose={() => {
                    setShowPreview(false);
                    setShowModal(null);
                }}
                event={selectedEvent}
                style={{
                    position: "fixed",
                    left: `${previewPosition.x}px`,
                    top: `${previewPosition.y}px`,
                    zIndex: 1000,
                }}
                onMouseLeave={handleEventMouseLeave}
            />
            <AlertModal
                isOpen={showModal === "alert"}
                onCancel={handleCloseModal}
                onProceed={() => setShowModal(null)}
                value={""}
                onChange={() => {}}
                onClose={handleCloseModal}
            />

            <AllEventsModal
                isOpen={showModal === "events"}
                onClose={handleCloseModal}
                onSave={() => setShowModal(null)}
                data={currentEventData}
                onEventClick={(element: HTMLButtonElement, data: any) => {
                    handleModalEventClick(element, data);
                }}
            />
            <div className="p-4 calendar-container">
                <FullCalendar
                    key={typeof dayMaxEvents === "number" ? `n-${dayMaxEvents}` : "auto"}
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    editable={false}
                    selectable={true}
                    selectMirror={false}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    expandRows={true}
                    dayMaxEvents={dayMaxEvents}
                    weekends={true}
                    headerToolbar={false}
                    dayHeaderContent={customDayHeaderContent}
                    eventContent={(eventInfo) => renderEventContent(eventInfo)}
                    dayCellClassNames={dayCellClassNames}
                    events={processedEvents}
                    moreLinkClassNames={["!text-primary", "hover:!bg-transparent"]}
                    moreLinkClick={handleMoreLinkClick}
                />
            </div>
        </>
    );
};

export default Calendar;
