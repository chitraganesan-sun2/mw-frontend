"use client";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { DELETE_API, GET_API } from "@/api/request";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";

type BlockedMember = { user_id: string; role?: string | null; name: string; blocked_on?: string | null };

/** Settings card listing the people you've blocked, with Unblock. */
const BlockedMembersSection = () => {
    const [items, setItems] = useState<BlockedMember[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const load = useCallback(() => {
        setFailed(false);
        GET_API(endpoints.blocks.list)
            .then((res: any) => setItems(Array.isArray(res?.data?.items) ? res.data.items : []))
            .catch(() => setFailed(true));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const unblock = async (member: BlockedMember) => {
        if (busyId) return;
        setBusyId(member.user_id);
        try {
            await DELETE_API(endpoints.blocks.remove(member.user_id));
            setItems((prev) => (prev ? prev.filter((m) => m.user_id !== member.user_id) : prev));
            queryClient.invalidateQueries();
            showToast({ type: "success", message: `${member.name || "Member"} unblocked` });
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't unblock. Please try again.") });
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section aria-labelledby="blocked-heading" className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <h2 id="blocked-heading" className="md:text-2xl text-[16px] font-medium">
                    Blocked people
                </h2>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                    People you block can&apos;t message you or send new requests, and you won&apos;t see each other in lists.
                    They aren&apos;t told. Sessions you already have aren&apos;t affected.
                </p>
            </div>
            {failed ? (
                <QueryErrorNotice message="Couldn't load your blocked list." onRetry={load} />
            ) : items === null ? (
                <p className="text-sm text-gray-600">Loading...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-600">You haven&apos;t blocked anyone.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-gray-100">
                    {items.map((m) => (
                        <li key={m.user_id} className="flex items-center justify-between gap-3 py-2">
                            <span className="text-sm font-medium">
                                {m.name || "Member"}
                                {m.role && <span className="ml-2 text-xs font-normal capitalize text-gray-600">{m.role}</span>}
                            </span>
                            <button
                                type="button"
                                onClick={() => unblock(m)}
                                disabled={busyId === m.user_id}
                                aria-label={`Unblock ${m.name || "this member"}`}
                                className="text-sm underline bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
                            >
                                {busyId === m.user_id ? "Unblocking..." : "Unblock"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default BlockedMembersSection;
