"use client";

import MonthYearSlider from "./MonthYearSlider";
import { CalendarIcon, SideMenuIcon } from "@/assets/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "@/utils/auth";
import InnerWidth from "@/utils/innerWidth";
import MonthYearPicker from "./MonthYearPicker";
import SideModal from "@/components/common/Modals/MobileSideModal";
import Sidebar from "@/components/common/Sidebar";
import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { HiOutlineArrowLeft, HiOutlineCalendarDays, HiOutlinePlus, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import HeaderNotificationBell from "@/components/common/HeaderNotificationBell";
import { SCHEDULE_LABELS } from "@/components/schedule/Dashboard/scheduleCategories";

/** ?view=calendar shows the calendar on its own; no param = the schedule (availability +
 * sessions). A URL param, not local state, so the view survives a refresh / can be linked. */
export const CALENDAR_VIEW = "calendar";

const Header = () => {
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server's button set (learner vs volunteer) differ
    // from the client's, triggering a hydration mismatch on every schedule page load.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);

    // Check if any schedule-related events are fetching
    const fetchingLearnerEvents = useIsFetching({ queryKey: ["learner-events"] });
    const fetchingVolunteerEvents = useIsFetching({ queryKey: ["volunteer-events"] });
    const isScheduleLoading = fetchingLearnerEvents > 0 || fetchingVolunteerEvents > 0;

    const isMobileOrTabScreen = InnerWidth() < 1024;
    const isVolunteer = role === "volunteer";
    const basePath = isVolunteer ? "/volunteer/schedule" : "/learner/schedule";
    const isCalendarView = searchParams.get("view") === CALENDAR_VIEW;

    // Keep the current view and month when opening a modal, so closing it returns here.
    const pushWith = (changes: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(changes).forEach(([key, value]) => (value === null ? params.delete(key) : params.set(key, value)));
        const query = params.toString();
        router.push(query ? `${basePath}?${query}` : basePath);
    };

    const openAvailability = () => pushWith({ modal: isVolunteer ? "my_schedule" : "my_availability" });
    const openAddSession = () => pushWith({ modal: isVolunteer ? "add_new_session" : "add_new_meeting" });
    const toggleCalendar = () => pushWith({ view: isCalendarView ? null : CALENDAR_VIEW, modal: null });
    // Help lives in Resources (tutorials, guides, the demo) - no separate help content.
    const openHelp = () => router.push(`/${isVolunteer ? "volunteer" : "learner"}/resources`);

    const actionBtn =
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] lg:text-sm font-medium leading-tight text-black hover:bg-gray-50 text-center";

    return (
        <div className={`w-full p-2 px-3 lg:py-3 ${isScheduleLoading ? "opacity-80" : ""}`}>
            <div className="w-full flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center">
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            className="lg:hidden cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none"
                            onClick={() => setIsSideNavBarOpen(true)}
                        >
                            <SideMenuIcon height="22px" width="22px" />
                        </button>
                        <h1 className="flex items-center gap-2 text-xl font-medium px-2">
                            {!isMobileOrTabScreen && <CalendarIcon aria-hidden="true" />}
                            {isCalendarView ? "My Calendar" : "My Schedule"}
                        </h1>
                        {/* The month only drives the calendar, so it only shows there. */}
                        {isCalendarView && (
                            <div className="max-lg:hidden ml-2">
                                <MonthYearSlider />
                            </div>
                        )}
                    </div>
                    {role && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={openHelp}
                                aria-label="Help: tutorials, guides and demo"
                                className="inline-flex h-9 items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 text-sm font-medium hover:bg-gray-50"
                            >
                                <HiOutlineQuestionMarkCircle size={18} aria-hidden="true" />
                                <span className="max-lg:hidden">Help</span>
                            </button>
                            <HeaderNotificationBell />
                        </div>
                    )}
                </div>
                {role && (
                    // Phones: two rows (calendar + availability side by side, Add below)
                    // instead of three full-width rows.
                    <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
                        {isCalendarView && isMobileOrTabScreen && (
                            <div className="col-span-2">
                                <MonthYearPicker />
                            </div>
                        )}
                        <button type="button" onClick={toggleCalendar} className={actionBtn}>
                            {isCalendarView ? (
                                <>
                                    <HiOutlineArrowLeft size={16} aria-hidden="true" />
                                    Back to my schedule
                                </>
                            ) : (
                                <>
                                    <HiOutlineCalendarDays size={16} aria-hidden="true" />
                                    {SCHEDULE_LABELS.viewCalendar}
                                </>
                            )}
                        </button>
                        <button type="button" onClick={openAvailability} className={actionBtn}>
                            {SCHEDULE_LABELS.scheduleAvailability}
                        </button>
                        <button
                            type="button"
                            onClick={openAddSession}
                            className={`${actionBtn} col-span-2 !border-action !bg-action !text-white hover:!bg-action-hover`}
                        >
                            <HiOutlinePlus size={16} aria-hidden="true" />
                            Add New Session
                        </button>
                    </div>
                )}
            </div>
            {isMobileOrTabScreen && (
                <SideModal isOpen={isSideNavBarOpen}>
                    <Sidebar onClose={() => setIsSideNavBarOpen(!isSideNavBarOpen)} />
                </SideModal>
            )}
        </div>
    );
};

export default Header;
