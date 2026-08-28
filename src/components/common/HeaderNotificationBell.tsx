"use client";

import NotificationIcon from "@/assets/icons/NotificationIcon";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import ApprovalModal from "@/components/schedule/Modals/ApprovalModal";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { useState, useEffect, useRef } from "react";

const HeaderNotificationBell = () => {
    const role = getCookie("role");
    const volunteerId = getCookie("volunteer_id");
    const learnerId = getCookie("learner_id");
    const [isOpen, setIsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const prevCount = useRef<number>(0);
    const hasInitialized = useRef(false);

    const isLearner = role === "learner";
    const currentUserId = isLearner ? learnerId : volunteerId;

    const { data } = useQuery({
        queryKey: ["unread-count", role],
        queryFn: async () => {
            const res: any = await GET_API(
                endpoints.session.getUnreadCount(isLearner ? "learner" : "volunteer")
            );
            return res?.data;
        },
        enabled: ["volunteer", "learner"].includes(role || "") && Boolean(currentUserId),
        refetchInterval: 30000, // poll every 30s
    });

    const unreadCount = Number(data?.unread_count || 0);

    // Toast on any genuine increase - but not on the first load, and not repeatedly while
    // the count merely stays elevated (the old `!== 0` guard also swallowed the first
    // increase after the badge had been cleared to 0).
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            prevCount.current = unreadCount;
            return;
        }
        const increased = unreadCount > prevCount.current;
        prevCount.current = unreadCount;
        if (increased) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount]);

    // Show the bell for all authenticated users (volunteer + learner)
    if (!role || !["volunteer", "learner"].includes(role)) return null;

    return (
        <>
            <button
                type="button"
                aria-label="Notifications"
                onClick={() => setIsOpen(true)}
                className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white p-0 text-black transition-colors hover:bg-gray-50"
            >
                <NotificationIcon width={18} height={18} />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification toast popup */}
            {showToast && (
                <div
                    className="fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-lg px-4 py-3 animate-slide-in-right"
                    style={{ minWidth: 260, maxWidth: 340 }}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <NotificationIcon width={16} height={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">New Notification</p>
                        <p className="text-xs text-gray-500 truncate">You have a new session request waiting.</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Dismiss"
                        onClick={() => setShowToast(false)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            <ApprovalModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                role={isLearner ? "learner" : "volunteer"}
            />
        </>
    );
};

export default HeaderNotificationBell;
