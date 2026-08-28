"use client";

import Button from "@/components/common/Button";
import MonthYearSlider from "./MonthYearSlider";
import { CalendarDayOne, CalendarIcon, NotificationIcon, SideMenuIcon } from "@/assets/icons";
import { IoIosSearch } from "react-icons/io";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/auth";
import InnerWidth from "@/utils/innerWidth";
import MonthYearPicker from "./MonthYearPicker";
import SideModal from "@/components/common/Modals/MobileSideModal";
import Sidebar from "@/components/common/Sidebar";
import { useState } from "react";
import { VIEW_DEMO_LINK, VIEW_DEMO_LINK_FOR_VOLUNTEER } from "@/definitions";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import HeaderNotificationBell from "@/components/common/HeaderNotificationBell";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";

type Props = {};

const Header = (props: Props) => {
    const role = getCookie("role");
    const router = useRouter();
    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);

    // Check if any schedule-related events are fetching
    const fetchingLearnerEvents = useIsFetching({ queryKey: ["learner-events"] });
    const fetchingVolunteerEvents = useIsFetching({ queryKey: ["volunteer-events"] });
    const isScheduleLoading = fetchingLearnerEvents > 0 || fetchingVolunteerEvents > 0;

    const innerWidth = InnerWidth();
    const isMobileOrTabScreen = innerWidth < 1024;

    const handleAddMeeting = () => {
        router.push("/learner/schedule?modal=add_new_meeting");
    };

    const handleMyAvailability = () => {
        router.push("/learner/schedule?modal=my_availability");
    };

    const handleAddEvent = () => {
        router.push("/volunteer/schedule?modal=new_event");
    };

    const handleMySchedule = () => {
        router.push("/volunteer/schedule?modal=my_schedule");
    };

    // "View Demo" now opens the admin-managed Tutorial Link (category learner_demo /
    // volunteer_demo - the same entry the approval emails use). The NEXT_PUBLIC_VIEW_DEMO_LINK*
    // env var stays as a fallback for when the admin hasn't configured one yet.
    const demoCategory = role === "volunteer" ? "volunteer_demo" : "learner_demo";
    const envDemoFallback = role === "volunteer" ? VIEW_DEMO_LINK_FOR_VOLUNTEER : VIEW_DEMO_LINK;

    const { data: adminDemoLink } = useQuery({
        queryKey: ["tutorial-demo-link", demoCategory],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.tutorialLinks.getByCategory(demoCategory));
            const list = (Array.isArray(res?.data) ? res.data : [])
                .slice()
                .sort((a: any, b: any) => (b?.created_at || "").localeCompare(a?.created_at || ""));
            return (list[0]?.url as string) || null;
        },
        enabled: role === "learner" || role === "volunteer",
        staleTime: 5 * 60 * 1000,
    });

    const openDemo = () => {
        const url = adminDemoLink || envDemoFallback;
        if (url && typeof window !== "undefined") {
            window.open(url, "_blank");
        }
    };

    const handleViewDemo = openDemo;
    const handleViewDemoforvolunteer = openDemo;

    return (
        <div className={`w-full h-full p-2 px-3 lg:min-h-[10vh] ${isScheduleLoading ? "opacity-50 pointer-events-none grayscale" : ""}`}>
            <div className="w-full h-full flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-0 animate-fadeIn">
                {/* Row 1 (mobile): menu + title + View Demo + Bell. Desktop: same row, no View Demo here */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className="lg:hidden cursor-pointer"
                            onClick={() => setIsSideNavBarOpen(true)}
                        >
                            <SideMenuIcon height="22px" width="22px" />
                        </div>
                        <Button
                            onClick={() => { }}
                            title={isMobileOrTabScreen ? "Schedule" : "My Schedule"}
                            icon={isMobileOrTabScreen ? undefined : <CalendarIcon />}
                            rootClassName="bg-transparent text-xl border-none font-medium shadow-none max-lg:!px-2"
                        />
                    </div>
                    {/* Mobile: View Demo + Bell (volunteer) in top row */}
                    <div className="flex items-center gap-2 max-lg:flex lg:hidden">
                        {role === "learner" && (
                            <>
                                <Button
                                    onClick={handleViewDemo}
                                    title="View Demo"
                                    customClassName="!bg-transparent !text-sm !font-medium !text-[#33D0FD] md:!text-orange-500 md:hover:!text-orange-600 !border-none !shadow-none underline"
                                />
                                <HeaderNotificationBell />
                            </>
                        )}
                        {role === "volunteer" && (
                            <>
                                <Button
                                    onClick={handleViewDemoforvolunteer}
                                    title="View Demo"
                                    customClassName="!bg-transparent !text-sm !font-medium !text-orange-500 hover:!text-orange-600 !border-none !shadow-none underline"
                                />
                                <HeaderNotificationBell />
                            </>
                        )}
                    </div>
                </div>
                {/* Desktop: MonthYearSlider */}
                <div className="max-lg:hidden flex items-center gap-4">
                    <MonthYearSlider
                        onChange={(date) => {
                            console.log(date, "date from month year slider");
                        }}
                    />
                </div>
                {/* Row 2 (mobile): date picker + search. Row 3 (mobile): action buttons. Desktop: single row */}
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2 lg:mt-0">
                    {isMobileOrTabScreen && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <MonthYearPicker />
                            </div>
                            <Button
                                onClick={() => { }}
                                icon={<IoIosSearch size={22} className="text-black" />}
                                customClassName="!bg-white !rounded-full !border !border-gray-200 !p-2.5 !min-w-0"
                            />
                        </div>
                    )}
                    {role === "learner" ? (
                        <div className="flex items-center gap-2">
                            {!isMobileOrTabScreen && <HeaderNotificationBell />}
                            <Button
                                onClick={handleViewDemo}
                                title="View Demo"
                                customClassName="max-lg:hidden !bg-white max-lg:!text-sm !font-medium !text-black rounded-full p-1 lg:!p-3"
                            />
                            <Button
                                onClick={handleMyAvailability}
                                title="Schedule my Availability"
                                customClassName="!bg-white !border !border-gray-200 !text-[14px] lg:!text-[16px] !font-medium !text-black rounded-full !py-2 lg:!py-3 lg:!px-3 max-lg:flex-1"
                            />
                            <Button
                                onClick={handleAddMeeting}
                                title="Add New Meeting"
                                customClassName="!bg-black max-lg:!text-sm !font-medium !text-white rounded-full p-1 lg:!p-3 max-lg:flex-1 lg:flex-initial"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {!isMobileOrTabScreen && (
                                <div className="relative gap-2 flex items-center">
                                    <Button
                                        onClick={handleViewDemoforvolunteer}
                                        title="View Demo"
                                        customClassName="!bg-white max-lg:!text-sm !font-medium !text-black rounded-full lg:!p-3  !py-3 !px-3"
                                    />
                                    <HeaderNotificationBell />
                                </div>
                            )}
                            {isMobileOrTabScreen && (
                                <Button
                                    onClick={handleAddEvent}
                                    title="Add New Instant Session"
                                    customClassName="!bg-[#FFAC71] hover:!bg-[#FFAC71] focus:!bg-[#FFAC71] !text-[14px] lg:!text-sm !font-medium !text-black rounded-full !py-2 max-lg:flex-1 !border !border-[#FE5B11]"
                                />
                            )}
                            <Button
                                onClick={handleMySchedule}
                                title={"My Schedule"}
                                customClassName="!bg-white !border !border-gray-200 !text-[14px] lg:!text-[16px] !font-medium !text-black rounded-full !py-2 lg:!py-3 lg:!px-3 max-lg:flex-1"
                            />
                            {!isMobileOrTabScreen && (
                                <Button
                                    onClick={handleAddEvent}
                                    title="Add New Instant Session"
                                    customClassName="!bg-[#FFAC71] hover:!bg-[#FFAC71] focus:!bg-[#FFAC71] max-lg:!text-sm !font-medium !text-black rounded-full lg:!p-3 !py-3 !px-3 !border !border-[#FE5B11]"
                                />
                            )}
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
