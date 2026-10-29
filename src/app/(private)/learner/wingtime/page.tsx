"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API, DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { showToast } from "@/components/common/Toast";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import LottieLoader from "@/components/common/Loader/Lottie";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import WingTimeDetailModal, { type WingTimeAction } from "@/components/wingtime/WingTimeDetailModal";
import { useConfirm } from "@/hooks/useConfirm";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import type { WingTime, WingTimePage } from "@/utils/wingtime";

const PAGE_SIZE = 12;

const fetchPage = async (url: string, page: number): Promise<WingTimePage> => {
    const res: any = await GET_API(`${url}${url.includes("?") ? "&" : "?"}page=${page}&size=${PAGE_SIZE}`);
    return res?.data ?? { items: [], total: 0, page, size: PAGE_SIZE };
};

/** Previous / Next - same control as the Instant Sessions lists. */
function Pager({ page, hasMore, onChange }: { page: number; hasMore: boolean; onChange: (page: number) => void }) {
    if (page <= 1 && !hasMore) return null;
    return (
        <div className="flex justify-center gap-4 mt-4">
            <button className="text-sm font-medium disabled:opacity-40" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                Previous
            </button>
            <button className="text-sm font-medium disabled:opacity-40" disabled={!hasMore} onClick={() => onChange(page + 1)}>
                Next
            </button>
        </div>
    );
}

export default function LearnerWingTimePage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const tzLabel = useProfileTimeZone("learner");
    const { confirm, confirmModal } = useConfirm();
    const [minePage, setMinePage] = useState(1);
    const [browsePage, setBrowsePage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setHeaderOptions({ title: "WingTime", titleIcon: getHeaderIcon(pathname), hideSearch: true, showButton: false });
    }, [setHeaderOptions, pathname]);

    const mine = useQuery({
        queryKey: ["wingtime", "mine", minePage],
        queryFn: () => fetchPage(endpoints.wingtime.myRegistrations, minePage),
        enabled: WINGTIME_ENABLED,
    });
    const browse = useQuery({
        queryKey: ["wingtime", "browse", browsePage],
        queryFn: () => fetchPage(endpoints.wingtime.base, browsePage),
        enabled: WINGTIME_ENABLED,
    });

    if (!WINGTIME_ENABLED) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-lg">WingTime isn&apos;t available yet.</p>
            </div>
        );
    }

    const myItems = mine.data?.items ?? [];
    const openItems = browse.data?.items ?? [];
    // Looked up by id so the modal always shows the freshest copy after an action.
    const selected = selectedId ? [...myItems, ...openItems].find((w) => w.wingtime_id === selectedId) ?? null : null;

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["wingtime"] });

    const signUp = async (item: WingTime) => {
        setBusy(true);
        try {
            await POST_API(endpoints.wingtime.register(item.wingtime_id));
            showToast({ message: `You're signed up for "${item.topic}".`, type: "success" });
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't sign you up. Please try again."), type: "error" });
        } finally {
            setBusy(false);
            await refresh(); // a session may have filled up or changed - always show the truth
        }
    };

    const leave = async (item: WingTime) => {
        if (!(await confirm({ title: "Leave this WingTime?", description: `You can sign up again for "${item.topic}" if there's still room.`, confirmText: "Leave" }))) return;
        setBusy(true);
        try {
            await DELETE_API(endpoints.wingtime.register(item.wingtime_id));
            showToast({ message: "You've left this WingTime.", type: "success" });
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't update your sign-up. Please try again."), type: "error" });
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    const actionFor = (item: WingTime): WingTimeAction | null => {
        if (item.status === "cancelled") return null;
        if (item.is_registered) return { label: "Leave", danger: true, loading: busy, onClick: () => leave(item) };
        if (item.spots_left <= 0) return { label: "Full", disabled: true, onClick: () => undefined };
        return { label: "Sign Up", loading: busy, onClick: () => signUp(item) };
    };

    const emptyCard = (title: string, text: string) => (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{text}</p>
        </div>
    );

    return (
        <div className="h-full animate-fadeIn p-4 lg:p-6 overflow-y-auto relative">
            {confirmModal}
            <WingTimeDetailModal item={selected} tzLabel={tzLabel} action={selected ? actionFor(selected) : null} onClose={() => setSelectedId(null)} />

            <div className="flex flex-col items-center text-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">WingTime</h1>
                <p className="text-sm text-gray-500 max-w-2xl">
                    WingTime sessions are fun <strong>30-minute group sessions</strong> led by volunteers - music, cooking, dance and more.
                    Sign up for any you like.
                </p>
            </div>

            {/* My WingTimes - shown first, like My Requested Instant Sessions */}
            <div className="mb-10">
                <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212] mb-4">My WingTimes</h2>
                {mine.isLoading ? (
                    <div className="flex justify-center py-6">
                        <LottieLoader isLoading={true} />
                    </div>
                ) : mine.isError && !mine.data ? (
                    <QueryErrorNotice message="Couldn't load your WingTimes." onRetry={() => mine.refetch()} />
                ) : myItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {myItems.map((item) => (
                                <WingTimeCard key={item.wingtime_id} item={item} tzLabel={tzLabel} onClick={() => setSelectedId(item.wingtime_id)} />
                            ))}
                        </div>
                        <Pager page={minePage} hasMore={minePage * PAGE_SIZE < (mine.data?.total ?? 0)} onChange={setMinePage} />
                    </>
                ) : (
                    emptyCard("No WingTimes Yet", "WingTimes you sign up for will show up here")
                )}
            </div>

            {/* Upcoming WingTimes - browse and sign up */}
            <div>
                <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212] mb-4">Upcoming WingTimes</h2>
                {browse.isLoading ? (
                    <div className="flex justify-center py-6">
                        <LottieLoader isLoading={true} />
                    </div>
                ) : browse.isError && !browse.data ? (
                    <QueryErrorNotice message="Couldn't load WingTimes." onRetry={() => browse.refetch()} />
                ) : openItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {openItems.map((item) => (
                                <WingTimeCard key={item.wingtime_id} item={item} tzLabel={tzLabel} onClick={() => setSelectedId(item.wingtime_id)} />
                            ))}
                        </div>
                        <Pager page={browsePage} hasMore={browsePage * PAGE_SIZE < (browse.data?.total ?? 0)} onChange={setBrowsePage} />
                    </>
                ) : (
                    emptyCard("No WingTimes Available", "New WingTimes will show up here")
                )}
            </div>
        </div>
    );
}
