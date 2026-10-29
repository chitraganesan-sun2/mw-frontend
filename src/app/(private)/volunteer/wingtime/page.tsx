"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { showToast } from "@/components/common/Toast";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import PageIntro from "@/components/common/PageIntro";
import LottieLoader from "@/components/common/Loader/Lottie";
import ProposeWingTimeModal from "@/components/wingtime/ProposeWingTimeModal";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import { useConfirm } from "@/hooks/useConfirm";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { useNow, useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import type { WingTime, WingTimePage } from "@/utils/wingtime";

export default function VolunteerWingTimePage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const tzLabel = useProfileTimeZone("volunteer");
    const now = useNow(60 * 1000);
    const { confirm, confirmModal } = useConfirm();
    const [proposeOpen, setProposeOpen] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        setHeaderOptions({ title: "WingTime", titleIcon: getHeaderIcon(pathname), hideSearch: true, showButton: false });
    }, [setHeaderOptions, pathname]);

    const hosted = useQuery({
        queryKey: ["wingtime", "hosted"],
        queryFn: async (): Promise<WingTimePage> => {
            const res: any = await GET_API(`${endpoints.wingtime.hosted}?page=1&size=50`);
            return res?.data ?? { items: [], total: 0, page: 1, size: 50 };
        },
        enabled: WINGTIME_ENABLED,
    });

    if (!WINGTIME_ENABLED) {
        return <p className="p-6 text-sm text-gray-600">WingTime isn&apos;t available yet.</p>;
    }

    const cancel = async (item: WingTime) => {
        const warning =
            item.registered_count > 0
                ? `${item.registered_count} learner${item.registered_count === 1 ? "" : "s"} signed up and will be told it was cancelled. `
                : "";
        if (!(await confirm({ title: "Cancel this WingTime?", description: `${warning}This can't be undone.`, confirmText: "Cancel WingTime", danger: true }))) return;
        setBusyId(item.wingtime_id);
        try {
            await POST_API(endpoints.wingtime.cancel(item.wingtime_id));
            showToast({ message: "Your WingTime was cancelled.", type: "success" });
            await queryClient.invalidateQueries({ queryKey: ["wingtime"] });
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't cancel the WingTime. Please try again."), type: "error" });
        } finally {
            setBusyId(null);
        }
    };

    const items = hosted.data?.items ?? [];
    const cancellable = (i: WingTime) =>
        (i.status === "pending_approval" || i.status === "approved") && dayjs(i.start_utc).isAfter(now);

    return (
        <div className="flex flex-col gap-5 p-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">WingTime</h1>
                    <PageIntro>
                        Lead a fun 30-minute group session - music, cooking, dance or anything you enjoy. An admin reviews each one before learners can see it.
                    </PageIntro>
                </div>
                <button
                    type="button"
                    onClick={() => setProposeOpen(true)}
                    className="btn-primary-fill rounded-2xl px-5 py-3 text-sm font-medium"
                >
                    + Propose a WingTime
                </button>
            </div>

            <section aria-labelledby="my-wingtimes" className="flex flex-col gap-3">
                <h2 id="my-wingtimes" className="text-lg font-semibold text-gray-900">
                    My WingTimes
                </h2>
                {hosted.isLoading ? (
                    <LottieLoader isLoading={true} />
                ) : hosted.isError ? (
                    <QueryErrorNotice message="Couldn't load your WingTimes. Check your connection and try again." onRetry={() => hosted.refetch()} />
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-600">You haven&apos;t proposed a WingTime yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {items.map((item) => (
                            <WingTimeCard key={item.wingtime_id} item={item} tzLabel={tzLabel} showStatus>
                                {cancellable(item) && (
                                    <button
                                        type="button"
                                        onClick={() => cancel(item)}
                                        disabled={busyId === item.wingtime_id}
                                        aria-label={`Cancel ${item.topic}`}
                                        className="btn-secondary-outline rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </WingTimeCard>
                        ))}
                    </div>
                )}
            </section>

            <ProposeWingTimeModal
                isOpen={proposeOpen}
                onClose={() => setProposeOpen(false)}
                onProposed={() => queryClient.invalidateQueries({ queryKey: ["wingtime"] })}
                tzLabel={tzLabel}
            />
            {confirmModal}
        </div>
    );
}
