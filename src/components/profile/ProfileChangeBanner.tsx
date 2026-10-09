"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { getProfileChangeState, withdrawProfileChange } from "@/api/profileChanges";
import ProfileChangeReviewModal from "./ProfileChangeReviewModal";

export const PROFILE_CHANGE_QUERY_KEY = ["profile-change-state"];

const SMALL_BTN = "!py-2 !px-4 !h-auto !text-sm";

const dismissKey = (requestId: string) => `profile-change-dismissed-${requestId}`;

/** Status strip on the profile page: a pending request (with its diff and a Withdraw
 * action), or the reason the last one was declined. Renders nothing otherwise. */
const ProfileChangeBanner = () => {
    const queryClient = useQueryClient();
    const [showDiff, setShowDiff] = useState(false);
    const [dismissedId, setDismissedId] = useState<string | null>(null);

    // The global default is a 5-minute staleTime with no focus refetch, which left this banner
    // (and the profile behind it) showing "waiting for review" long after an admin decided.
    const { data } = useQuery({
        queryKey: PROFILE_CHANGE_QUERY_KEY,
        queryFn: getProfileChangeState,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchInterval: (query) => (query.state.data?.pending ? 60_000 : false),
    });

    // When a request we were showing as pending is no longer pending, an admin approved it,
    // rejected it or it was withdrawn - reload the profile so approved details appear.
    const seenPendingRef = useRef<string | null>(null);
    const pendingId = data?.pending?.request_id ?? null;
    useEffect(() => {
        if (!data) return;
        if (seenPendingRef.current && seenPendingRef.current !== pendingId) {
            queryClient.invalidateQueries({ queryKey: ["learner"] });
            queryClient.invalidateQueries({ queryKey: ["volunteer"] });
        }
        seenPendingRef.current = pendingId;
    }, [data, pendingId, queryClient]);

    const rejected = data?.last_decision?.status === "rejected" ? data.last_decision : null;
    const rejectedId = rejected?.request_id;

    useEffect(() => {
        if (!rejectedId) return;
        try {
            if (window.localStorage.getItem(dismissKey(rejectedId))) setDismissedId(rejectedId);
        } catch {
            // storage unavailable - the banner just stays visible
        }
    }, [rejectedId]);

    const withdraw = useMutation({
        mutationFn: (requestId: string) => withdrawProfileChange(requestId),
        onSuccess: () => showToast({ message: "Request withdrawn" }),
        onError: (err: any) =>
            showToast({
                type: "error",
                message:
                    err?.status === 404 || err?.status === 409
                        ? "This request was already reviewed."
                        : getApiErrorMessage(err, "Couldn't withdraw the request. Please try again."),
            }),
        // Refresh either way: on an error the request was most likely decided meanwhile.
        onSettled: () => queryClient.invalidateQueries({ queryKey: PROFILE_CHANGE_QUERY_KEY }),
    });

    const dismiss = (requestId: string) => {
        setDismissedId(requestId);
        try {
            window.localStorage.setItem(dismissKey(requestId), "1");
        } catch {
            // best effort
        }
    };

    const pending = data?.pending;
    if (pending) {
        return (
            <>
                <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2D98A] bg-[#FFF8E1] px-4 py-3">
                    <p className="text-sm text-[#5C4A00]">
                        Your profile changes ({pending.change_count}) are waiting for admin review. Your profile keeps showing the current details until they&apos;re approved.
                    </p>
                    <div className="flex gap-2">
                        <Button title="View changes" btnVariant="outline" customClassName={SMALL_BTN} onClick={() => setShowDiff(true)} />
                        <Button
                            title="Withdraw"
                            btnVariant="outline"
                            customClassName={SMALL_BTN}
                            onClick={() => withdraw.mutate(pending.request_id)}
                            loading={withdraw.isPending}
                            disabled={withdraw.isPending}
                        />
                    </div>
                </div>
                <ProfileChangeReviewModal isOpen={showDiff} diff={pending.diff ?? []} readOnly onCancel={() => setShowDiff(false)} />
            </>
        );
    }

    if (rejected && dismissedId !== rejected.request_id) {
        return (
            <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F5C2C0] bg-[#FDECEA] px-4 py-3">
                <p className="text-sm text-[#7A1F1A]">
                    Your last profile changes weren&apos;t approved
                    {rejected.rejection_reason ? `: ${rejected.rejection_reason}` : "."} Your profile was left as it was.
                </p>
                <Button title="Dismiss" btnVariant="outline" customClassName={SMALL_BTN} onClick={() => dismiss(rejected.request_id)} />
            </div>
        );
    }

    return null;
};

export default ProfileChangeBanner;
