"use client";

import React from "react";
import JoinButton from "@/components/common/JoinButton";
import WhenLine from "@/components/common/WhenLine";
import { useNow } from "@/hooks/schedule/useProfileTimeZone";
import { onEnterOrSpace } from "@/utils/a11y";
import { safeHref } from "@/utils/safeHref";
import { spotsText, wingtimeJoinState, wingtimePill, wingtimeWhen, type WingTime } from "@/utils/wingtime";

interface WingTimeCardProps {
    item: WingTime;
    /** The viewer's profile time zone label - times are shown in it. */
    tzLabel?: string | null;
    /** Opens the detail modal, where the actions live (same pattern as the Instant Session cards). */
    onClick: () => void;
}

/** Compact card - same markup and spacing as the Instant Session card (SessionCard). */
export default function WingTimeCard({ item, tzLabel, onClick }: WingTimeCardProps) {
    // Ticks so Join appears 3 minutes before the start without a reload.
    const now = useNow();
    const pill = wingtimePill(item);
    const joinHref = safeHref(item.meeting_link);
    const joinStatus = joinHref ? wingtimeJoinState(item, now) : "none";

    return (
        <article
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={item.topic}
            onKeyDown={onEnterOrSpace(onClick)}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5 cursor-pointer hover:shadow-sm transition-shadow"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{item.topic}</h3>
                    {!item.is_host && item.host_name && (
                        <p className="text-sm text-gray-700 break-words">
                            <span className="text-gray-500">Volunteer: </span>
                            <span className="font-semibold">{item.host_name}</span>
                        </p>
                    )}
                </div>
                <span className={`${pill.className} shrink-0 rounded-full px-2 py-0.5 text-xs font-medium`}>{pill.label}</span>
            </div>
            <WhenLine text={wingtimeWhen(item, tzLabel)} />
            {item.tags.length > 0 && <p className="text-xs text-gray-600 break-words">{item.tags.join(", ")}</p>}
            <p className="text-xs text-gray-600 line-clamp-2 break-words">{item.description}</p>
            <p className="text-xs text-gray-600">
                {item.is_host ? `${item.registered_count} of ${item.capacity} signed up` : spotsText(item)}
            </p>
            {joinStatus !== "none" && (
                <div className="flex justify-end pt-0.5">
                    <JoinButton state={joinStatus} href={joinHref} stopPropagation contextLabel={item.topic} />
                </div>
            )}
        </article>
    );
}
