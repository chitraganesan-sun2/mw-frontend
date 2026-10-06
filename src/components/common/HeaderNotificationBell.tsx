"use client";

import { HiOutlineBell } from "react-icons/hi2";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import ApprovalModal from "@/components/schedule/Modals/ApprovalModal";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { useState, useEffect, useRef } from "react";

const HeaderNotificationBell = () => {
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server (role undefined -> renders null) differ from
    // the client's first render, triggering a hydration mismatch on every page.
    const [role, setRole] = useState<string | undefined>(undefined);
    const [volunteerId, setVolunteerId] = useState<string | undefined>(undefined);
    const [learnerId, setLearnerId] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
        setVolunteerId(getCookie("volunteer_id"));
        setLearnerId(getCookie("learner_id"));
    }, []);
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
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                onClick={() => setIsOpen(true)}
                className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white p-0 text-black transition-colors hover:bg-gray-50"
            >
                <HiOutlineBell size={20} aria-hidden="true" />
                {unreadCount > 0 && (
                    <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification toast popup */}
            {showToast && (
                <div
                    role="status"
                    className="fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-lg px-4 py-3 animate-slide-in-right"
                    style={{ minWidth: 260, maxWidth: 340 }}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <HiOutlineBell size={16} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">New Notification</p>
                        <p className="text-xs text-gray-500 truncate">You have a new session update.</p>
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
