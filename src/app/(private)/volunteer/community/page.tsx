"use client";

import ActionPanel from "@/components/community/ActionPanel";
import FeedCard from "@/components/community/FeedCard";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Code-split: these modals pull in react-slick/@mui/material/react-hook-form/zod,
// which otherwise ship on every Community page visit even for users who never open one.
const FeedViewModal = dynamic(() => import("@/components/community/FeedViewModal"), { ssr: false });
const CommunityReportModal = dynamic(() => import("@/components/community/ReportsModal"), { ssr: false });
const NotificationSection = dynamic(() => import("@/components/community/NotificationSection"), { ssr: false });
const CommunityPostModal = dynamic(() => import("@/components/community/CommunityPostModal"), { ssr: false });

export default function CommunityPage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const [mode, setMode] = useQueryState("mode");
    const [_, setId] = useQueryState("id");
    const [activeTab] = useQueryState("tab");

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportModalPostId, setReportModalPostId] = useState("");

    const handleAddNewPost = () => {
        setMode("add");
    };

    useEffect(() => {
        setHeaderOptions({
            searchPlaceholder: "Search",
            actionButtonTitle: "Add new post",
            actionButtonOnClick: handleAddNewPost,
            actionButtonClassName:
                "!h-full !w-[101px] md:!w-auto !bg-background-secondary !text-black !rounded-xl hover:!bg-background-secondary hover:!text-black !text-xs !py-3 px-4",
            actionButtonPlacement: "right",
            showButton: true,
            title: "Community",
            titleIcon: getHeaderIcon(pathname),
        });
    }, [pathname, setHeaderOptions]);

    const handleCloseModal = () => {
        setMode(null);
        setId(null);
    };

    const handleFeedCardClick = (id: string) => {
        setId(id);
        setMode("view");
    };

    const handleReportClick = (post_id: string) => {
        setReportModalOpen(true);
        setReportModalPostId(post_id);
    };

    const handleCloseReportModal = () => {
        setReportModalOpen(false);
        setReportModalPostId("");
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab]);

    return (
        <div className="grid grid-cols-12 max-lg:h-full lg:h-[90dvh] overflow-hidden animate-fadeIn">
            <CommunityReportModal
                postId={reportModalPostId}
                isOpen={reportModalOpen}
                onClose={handleCloseReportModal}
            />

            <CommunityPostModal isOpen={mode === "add" || mode === "edit"} onClose={handleCloseModal} />

            <FeedViewModal
                isOpen={mode === "view"}
                onClose={handleCloseModal}
                isManagePost={activeTab === "manage_your_posts"}
                handleReportClick={handleReportClick}
            />

            <div className="col-span-12 flex flex-col min-h-0 h-full flex-grow">
                <div className="xl:hidden w-full border-b sticky top-0 z-10 px-2 md:px-3 py-4 lg:px-4 md:py-5 bg-[#F4F7FB]">
                    <div className="w-full overflow-x-auto no-scrollbar">
                        <ActionPanel />
                    </div>
                </div>

                <div className="flex max-md:h-full sm:flex-row justify-between gap-4 sm:p-6 sm:pb-0 flex-1 min-h-0 overflow-auto">
                    {/* Main Content Area */}
                    <div className="flex-1 md:w-8/12 p-0 sm:p-0 overflow-auto no-scrollbar sm:rounded-3xl flex flex-col">
                        <div ref={messagesEndRef} />
                        <div className="flex-1 bg-white sm:rounded-3xl sm:p-6 pb-2 sm:mb-6">
                            {activeTab === "your_notifications" ? (
                                <NotificationSection />
                            ) : (
                                <div className="flex flex-col min-h-0 flex-grow h-full">
                                    <FeedCard
                                        onClick={handleFeedCardClick}
                                        handleReportClick={handleReportClick}
                                        isManagePost={activeTab === "manage_your_posts"}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Action Panel */}
                    <div className="hidden xl:block min-h-0">
                        <div className="bg-white rounded-2xl p-4 w-[380px] min-h-[390px]">
                            <div className="h-full w-[353px] overflow-auto no-scrollbar">
                                <ActionPanel />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
