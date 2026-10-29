"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API, DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { showToast } from "@/components/common/Toast";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import PageIntro from "@/components/common/PageIntro";
import LottieLoader from "@/components/common/Loader/Lottie";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import { useConfirm } from "@/hooks/useConfirm";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import type { WingTime, WingTimePage } from "@/utils/wingtime";

type Tab = "browse" | "mine";

const fetchPage = async (url: string): Promise<WingTimePage> => {
    const res: any = await GET_API(`${url}${url.includes("?") ? "&" : "?"}page=1&size=50`);
    return res?.data ?? { items: [], total: 0, page: 1, size: 50 };
};

export default function LearnerWingTimePage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const tzLabel = useProfileTimeZone("learner");
    const { confirm, confirmModal } = useConfirm();
    const [tab, setTab] = useState<Tab>("browse");
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        setHeaderOptions({ title: "WingTime", titleIcon: getHeaderIcon(pathname), hideSearch: true, showButton: false });
    }, [setHeaderOptions, pathname]);

    const browse = useQuery({
        queryKey: ["wingtime", "browse"],
        queryFn: () => fetchPage(endpoints.wingtime.base),
        enabled: WINGTIME_ENABLED,
    });
    const mine = useQuery({
        queryKey: ["wingtime", "mine"],
        queryFn: () => fetchPage(endpoints.wingtime.myRegistrations),
        enabled: WINGTIME_ENABLED,
    });

    if (!WINGTIME_ENABLED) {
        return <p className="p-6 text-sm text-gray-600">WingTime isn&apos;t available yet.</p>;
    }

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["wingtime"] });

    const register = async (item: WingTime) => {
        setBusyId(item.wingtime_id);
        try {
            await POST_API(endpoints.wingtime.register(item.wingtime_id));
            showToast({ message: `You're signed up for "${item.topic}".`, type: "success" });
            await refresh();
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't sign you up. Please try again."), type: "error" });
            await refresh(); // the session may have filled up or changed - show the truth
        } finally {
            setBusyId(null);
        }
    };

    const leave = async (item: WingTime) => {
        if (!(await confirm({ description: `Leave "${item.topic}"? You can sign up again if there's still room.`, confirmText: "Leave" }))) return;
        setBusyId(item.wingtime_id);
        try {
            await DELETE_API(endpoints.wingtime.register(item.wingtime_id));
            showToast({ message: "You've left this WingTime.", type: "success" });
            await refresh();
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't update your sign-up. Please try again."), type: "error" });
        } finally {
            setBusyId(null);
        }
    };

    const active = tab === "browse" ? browse : mine;
    const items = active.data?.items ?? [];

    return (
        <div className="flex flex-col gap-5 p-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">WingTime</h1>
                <PageIntro>
                    Fun 30-minute group sessions led by volunteers - music, cooking, dance and more. Sign up for any you like.
                </PageIntro>
            </div>

            <div role="tablist" aria-label="WingTime views" className="flex gap-2">
                {(
                    [
                        ["browse", "Browse"],
                        ["mine", "My WingTimes"],
                    ] as const
                ).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`wingtime-tab-${id}`}
                        aria-selected={tab === id}
                        aria-controls="wingtime-panel"
                        onClick={() => setTab(id)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium cursor-pointer ${
                            tab === id ? "btn-primary-fill border-transparent" : "border-gray-300 bg-white text-gray-800"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div id="wingtime-panel" role="tabpanel" aria-labelledby={`wingtime-tab-${tab}`} className="flex flex-col gap-3">
                {active.isLoading ? (
                    <LottieLoader isLoading={true} />
                ) : active.isError ? (
                    <QueryErrorNotice message="Couldn't load WingTimes. Check your connection and try again." onRetry={() => active.refetch()} />
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-600">
                        {tab === "browse"
                            ? "No WingTimes are open right now. Check back soon."
                            : "You haven't signed up for a WingTime yet. Browse to find one."}
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {items.map((item) => (
                            <WingTimeCard key={item.wingtime_id} item={item} tzLabel={tzLabel}>
                                {item.status === "cancelled" ? (
                                    <span className="text-xs font-semibold text-rose-800">Cancelled by the host</span>
                                ) : item.is_registered ? (
                                    <button
                                        type="button"
                                        onClick={() => leave(item)}
                                        disabled={busyId === item.wingtime_id}
                                        aria-label={`Leave ${item.topic}`}
                                        className="btn-secondary-outline rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-60"
                                    >
                                        Leave
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => register(item)}
                                        disabled={busyId === item.wingtime_id || item.spots_left <= 0}
                                        aria-label={`Sign up for ${item.topic}`}
                                        className="btn-primary-fill rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {item.spots_left <= 0 ? "Full" : "Sign up"}
                                    </button>
                                )}
                            </WingTimeCard>
                        ))}
                    </div>
                )}
            </div>
            {confirmModal}
        </div>
    );
}
