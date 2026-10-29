"use client";

import React from "react";
import JoinButton from "@/components/common/JoinButton";
import JoinOpensNote from "@/components/common/JoinOpensNote";
import TagComponent from "@/components/common/Tag";
import WhenLine from "@/components/common/WhenLine";
import { useNow } from "@/hooks/schedule/useProfileTimeZone";
import { safeHref } from "@/utils/safeHref";
import {
    WINGTIME_STATUS_LABEL,
    WINGTIME_STATUS_PILL,
    spotsText,
    wingtimeBounds,
    wingtimeJoinState,
    wingtimeWhen,
    type WingTime,
} from "@/utils/wingtime";

interface WingTimeCardProps {
    item: WingTime;
    /** The viewer's profile time zone label - times are shown in it. */
    tzLabel?: string | null;
    /** The host's own list shows the status; learners only ever see approved sessions. */
    showStatus?: boolean;
    /** Action buttons (register, leave, cancel...). */
    children?: React.ReactNode;
}

export default function WingTimeCard({ item, tzLabel, showStatus = false, children }: WingTimeCardProps) {
    const now = useNow();
    const joinState = wingtimeJoinState(item, now);
    const href = safeHref(item.meeting_link);
    const noMaterials = !item.materials || item.materials.trim().toLowerCase() === "none";

    return (
        <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4" aria-label={item.topic}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 break-words">{item.topic}</h3>
                {showStatus && (
                    <TagComponent
                        text={WINGTIME_STATUS_LABEL[item.status] ?? item.status}
                        className={WINGTIME_STATUS_PILL[item.status] ?? ""}
                    />
                )}
            </div>

            {!item.is_host && item.host_name && <p className="text-xs text-gray-600">Hosted by {item.host_name}</p>}
            <WhenLine text={wingtimeWhen(item, tzLabel)} />

            <p className="text-sm text-gray-700 whitespace-pre-line break-words">{item.description}</p>
            <p className="text-xs text-gray-700">
                <span className="font-semibold text-gray-900">Materials: </span>
                {noMaterials ? "No materials needed" : item.materials}
            </p>

            {item.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
                    {item.tags.map((tag) => (
                        <li key={tag}>
                            <TagComponent text={tag} />
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-xs text-gray-600">
                {item.is_host ? `${item.registered_count} of ${item.capacity} joined` : spotsText(item)}
            </p>

            {item.status === "rejected" && item.reject_reason && (
                <p role="note" className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    <span className="font-semibold">Why it wasn&apos;t approved: </span>
                    {item.reject_reason}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <JoinButton state={joinState} href={href} contextLabel={item.topic} />
                {item.meeting_link && (
                    <JoinOpensNote
                        status={item.status === "approved" ? "accepted" : item.status}
                        meetLink={item.meeting_link}
                        bounds={wingtimeBounds(item)}
                        now={now}
                    />
                )}
                {children}
            </div>
        </article>
    );
}
