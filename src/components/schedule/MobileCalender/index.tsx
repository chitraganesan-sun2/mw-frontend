"use client";

import { useAppStore } from "@/store/useAppStore";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertModal } from "../Modals";
import EventCard from "../Calender/EventCard";
import MobileMeetingPreviewModal from "./MeetingPreview";
import { onEnterOrSpace } from "@/utils/a11y";

interface CalendarProps {
    events: any;
    onDateSelect?: (date: string) => void;
}

const MobileCalender: React.FC<CalendarProps> = ({ events = [], onDateSelect }) => {
    const calendarRef = useRef<any>(null);
    const searchParams = useSearchParams();
    const currentDate = searchParams.get("current_month");
    const modalParam = searchParams.get("modal");
    const { setEventDetails } = useAppStore();

    const groupedEvents = useMemo(() => {
        let list = events ?? [];
        return Object.values(
            list.reduce((acc: Record<string, any[]>, item: any) => {
                (acc[item.date] ||= []).push(item);
                return acc;
            }, {})
        ).sort(
            (a: any, b: any) => new Date(a[0].date).getTime() - new Date(b[0].date).getTime()
        );
    }, [events]);

    const [showModal, setShowModal] = useState<ModalType>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const renderEventContent = (eventInfo: any) => {
        const startTime = dayjs(eventInfo?.start).format("h:mm A");
        const endTime = dayjs(eventInfo?.end).format("h:mm A");
        return (
            <EventCard
                title={eventInfo?.title}
                time={`${startTime} - ${endTime}`}
                status={eventInfo?.status}
            />
        );
    };

    const handleEventClick = (event: any) => {
        setSelectedEvent(event);
        setEventDetails(event);
        setShowPreview(true);
    };

    useEffect(() => {
        if (modalParam === "feedback") {
            setShowPreview(false);
        }
    }, [modalParam]);

    const handleCloseModal = () => {
        setShowModal(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("modal");
        window.history.replaceState({}, "", url);
    };

    useEffect(() => {
        if (currentDate && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(dayjs(currentDate).format("YYYY-MM-DD"));
        }
    }, [currentDate]);

    const handleDateClick = (date: string) => {
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    return (
        <>
            <MobileMeetingPreviewModal
                isOpen={showPreview}
                data={events}
                onClose={() => {
                    setShowPreview(false);
                    setShowModal(null);
                }}
                event={selectedEvent}
            />
            <AlertModal
                isOpen={showModal === "alert"}
                onCancel={handleCloseModal}
                onProceed={() => setShowModal(null)}
                value={""}
                onChange={() => { }}
                onClose={handleCloseModal}
            />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedEvents.map((eventsByDate: any, index: number) => (
                    <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onKeyDown={onEnterOrSpace(() => handleDateClick(eventsByDate[0]?.date))}
                        className="h-full w-full p-4 rounded-xl bg-white cursor-pointer hover:bg-gray-50"
                        onClick={() => handleDateClick(eventsByDate[0]?.date)}
                    >
                        <p className="font-medium text-sm mb-4">
                            {eventsByDate[0]?.date &&
                                dayjs(eventsByDate[0]?.date).format("DD-MMM-YYYY")}
                        </p>
                        <div className="space-y-2">
                            {eventsByDate.map((event: any, i: number) => (
                                <button
                                    type="button"
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventClick(event);
                                    }}
                                    className="w-full text-left appearance-none border-0 bg-transparent p-0"
                                >
                                    {renderEventContent(event)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {groupedEvents?.length === 0 && (
                    <div className="col-span-2 min-h-[70vh] h-full flex-center">
                        <p className="text-base">No Events Found</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default MobileCalender;
