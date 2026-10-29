"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { showToast } from "@/components/common/Toast";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import LottieLoader from "@/components/common/Loader/Lottie";
import ProposeWingTimeModal from "@/components/wingtime/ProposeWingTimeModal";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import WingTimeDetailModal, { type WingTimeAction } from "@/components/wingtime/WingTimeDetailModal";
import { useConfirm } from "@/hooks/useConfirm";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { useNow, useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { TERMS } from "@/constants/copy";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { canHostCancel, type WingTime, type WingTimePage } from "@/utils/wingtime";

const PAGE_SIZE = 12;

export default function VolunteerWingTimePage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const tzLabel = useProfileTimeZone("volunteer");
    const now = useNow(60 * 1000);
    const { confirm, confirmModal } = useConfirm();
    const [page, setPage] = useState(1);
    const [proposeOpen, setProposeOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setHeaderOptions({ title: "WingTime", titleIcon: getHeaderIcon(pathname), hideSearch: true, showButton: false });
    }, [setHeaderOptions, pathname]);

    const hosted = useQuery({
        queryKey: ["wingtime", "hosted", page],
        queryFn: async (): Promise<WingTimePage> => {
            const res: any = await GET_API(`${endpoints.wingtime.hosted}?page=${page}&size=${PAGE_SIZE}`);
            return res?.data ?? { items: [], total: 0, page, size: PAGE_SIZE };
        },
        enabled: WINGTIME_ENABLED,
    });

    if (!WINGTIME_ENABLED) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-lg">WingTime isn&apos;t available yet.</p>
            </div>
        );
    }

    const items = hosted.data?.items ?? [];
    const selected = selectedId ? items.find((w) => w.wingtime_id === selectedId) ?? null : null;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["wingtime"] });

    const cancel = async (item: WingTime) => {
        const warning =
            item.registered_count > 0
                ? `${item.registered_count} learner${item.registered_count === 1 ? "" : "s"} signed up and will be told it was cancelled. `
                : "";
        if (!(await confirm({ title: "Cancel this WingTime?", description: `${warning}This can't be undone.`, confirmText: "Cancel WingTime", danger: true }))) return;
        setBusy(true);
        try {
            await POST_API(endpoints.wingtime.cancel(item.wingtime_id));
            showToast({ message: "Your WingTime was cancelled.", type: "success" });
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't cancel the WingTime. Please try again."), type: "error" });
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    const actionFor = (item: WingTime): WingTimeAction | null =>
        canHostCancel(item, now) ? { label: "Cancel WingTime", danger: true, loading: busy, onClick: () => cancel(item) } : null;

    return (
        <div className="h-full animate-fadeIn p-4 lg:p-6 overflow-y-auto relative">
            {confirmModal}
            <WingTimeDetailModal item={selected} tzLabel={tzLabel} action={selected ? actionFor(selected) : null} onClose={() => setSelectedId(null)} />
            <ProposeWingTimeModal
                isOpen={proposeOpen}
                onClose={() => setProposeOpen(false)}
                onProposed={() => {
                    setPage(1);
                    refresh();
                }}
                tzLabel={tzLabel}
            />

            <div className="flex flex-col items-center text-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">WingTime</h1>
                <p className="text-sm text-gray-500 max-w-2xl">
                    WingTime sessions are fun <strong>30-minute group sessions</strong> you lead - music, cooking, dance or anything you
                    enjoy. An admin reviews each one before learners can see it.
                </p>
            </div>

            <div>
                {/* Same header row as the Instant Sessions pages: title left, action right, wraps on phones. */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212]">My WingTimes</h2>
                    <button
                        onClick={() => setProposeOpen(true)}
                        className="btn-primary-fill h-10 inline-flex items-center px-5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity ml-auto shrink-0 whitespace-nowrap"
                    >
                        + {TERMS.proposeWingTime}
                    </button>
                </div>

                {hosted.isLoading ? (
                    <div className="flex justify-center py-6">
                        <LottieLoader isLoading={true} />
                    </div>
                ) : hosted.isError && !hosted.data ? (
                    <QueryErrorNotice message="Couldn't load your WingTimes." onRetry={() => hosted.refetch()} />
                ) : items.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {items.map((item) => (
                                <WingTimeCard key={item.wingtime_id} item={item} tzLabel={tzLabel} onClick={() => setSelectedId(item.wingtime_id)} />
                            ))}
                        </div>
                        {(page > 1 || page * PAGE_SIZE < (hosted.data?.total ?? 0)) && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button className="text-sm font-medium disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                    Previous
                                </button>
                                <button
                                    className="text-sm font-medium disabled:opacity-40"
                                    disabled={page * PAGE_SIZE >= (hosted.data?.total ?? 0)}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">🎵</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No WingTimes Yet</h3>
                        <p className="text-sm text-gray-500">WingTimes you propose will show up here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
