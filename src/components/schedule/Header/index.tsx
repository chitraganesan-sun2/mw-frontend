"use client";

import Button from "@/components/common/Button";
import MonthYearSlider from "./MonthYearSlider";
import { CalendarIcon, SideMenuIcon } from "@/assets/icons";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/auth";
import InnerWidth from "@/utils/innerWidth";
import MonthYearPicker from "./MonthYearPicker";
import SideModal from "@/components/common/Modals/MobileSideModal";
import Sidebar from "@/components/common/Sidebar";
import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import HeaderNotificationBell from "@/components/common/HeaderNotificationBell";
import { SCHEDULE_LABELS } from "@/components/schedule/Dashboard/scheduleCategories";

export const CALENDAR_SECTION_ID = "my-calendar";

/** Scroll the dashboard's calendar into view and move focus to it (keyboard/screen-reader
 * users land on the calendar, not just see it scroll by). */
export function focusCalendarSection() {
    const el = document.getElementById(CALENDAR_SECTION_ID);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.focus({ preventScroll: true });
}

const Header = () => {
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server's button set (learner vs volunteer) differ
    // from the client's, triggering a hydration mismatch on every schedule page load.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    const router = useRouter();
    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);

    // Check if any schedule-related events are fetching
    const fetchingLearnerEvents = useIsFetching({ queryKey: ["learner-events"] });
    const fetchingVolunteerEvents = useIsFetching({ queryKey: ["volunteer-events"] });
    const isScheduleLoading = fetchingLearnerEvents > 0 || fetchingVolunteerEvents > 0;

    const isMobileOrTabScreen = InnerWidth() < 1024;
    const isVolunteer = role === "volunteer";

    const openAvailability = () =>
        router.push(isVolunteer ? "/volunteer/schedule?modal=my_schedule" : "/learner/schedule?modal=my_availability");
    const openAddSession = () =>
        router.push(isVolunteer ? "/volunteer/schedule?modal=add_new_session" : "/learner/schedule?modal=add_new_meeting");
    // Help lives in Resources (tutorials, guides, the demo) - no separate help content.
    const openHelp = () => router.push(`/${isVolunteer ? "volunteer" : "learner"}/resources`);

    const secondaryBtn =
        "!bg-white !border !border-gray-200 !text-[14px] !font-medium !text-black rounded-full !py-2 !px-3 max-lg:flex-1";

    return (
        <div className={`w-full h-full p-2 px-3 lg:min-h-[10vh] ${isScheduleLoading ? "opacity-80" : ""}`}>
            <div className="w-full h-full flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-0 animate-fadeIn">
                <div className="flex items-center justify-between">
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
                            Schedule
                        </h1>
                    </div>
                    {/* Mobile: Help + bell in the top row */}
                    {role && (
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                type="button"
                                onClick={openHelp}
                                aria-label="Help: tutorials, guides and demo"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
                            >
                                <HiOutlineQuestionMarkCircle size={20} aria-hidden="true" />
                            </button>
                            <HeaderNotificationBell />
                        </div>
                    )}
                </div>
                <div className="max-lg:hidden flex items-center gap-4">
                    <MonthYearSlider />
                </div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
                    {isMobileOrTabScreen && <MonthYearPicker />}
                    {role && (
                        <div className="flex flex-wrap items-center gap-2">
                            {/* CSS, not the JS width (0 on the first render), decides which copy
                                of Help + bell shows - otherwise both appear on small screens. */}
                            <div className="max-lg:hidden flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={openHelp}
                                    className="inline-flex h-10 items-center gap-1 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    <HiOutlineQuestionMarkCircle size={18} aria-hidden="true" />
                                    Help
                                </button>
                                <HeaderNotificationBell />
                            </div>
                            <Button onClick={openAvailability} title={SCHEDULE_LABELS.scheduleAvailability} customClassName={secondaryBtn} />
                            <Button onClick={focusCalendarSection} title={SCHEDULE_LABELS.viewCalendar} customClassName={secondaryBtn} />
                            <Button
                                onClick={openAddSession}
                                title="Add New Session"
                                customClassName="!bg-black !text-[14px] !font-medium !text-white rounded-full !py-2 !px-3 max-lg:flex-1 lg:flex-initial"
                            />
                        </div>
                    )}
                </div>
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
