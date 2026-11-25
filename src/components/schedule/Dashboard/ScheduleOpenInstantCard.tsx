"use client";
import React from "react";
import Link from "next/link";
import WhenLine from "@/components/common/WhenLine";
import { formatSessionWhen, getStatusLabel, getStatusPillClass } from "@/utils/sessionDisplay";
import type { OpenInstantRow } from "@/hooks/schedule/useScheduleAgenda";
import type { ScheduleRole } from "./scheduleCategories";

interface ScheduleOpenInstantCardProps {
    row: OpenInstantRow;
    role: ScheduleRole;
    timeZoneLabel?: string;
    typeTag?: React.ReactNode;
}

/** An instant session nobody has taken yet: a learner's request waiting for a volunteer, or a
 * volunteer's posting waiting for a learner. Once someone accepts / claims it, it becomes a
 * regular session card. Cancelling / withdrawing stays on the Instant Sessions page. */
const ScheduleOpenInstantCard: React.FC<ScheduleOpenInstantCardProps> = ({ row, role, timeZoneLabel, typeTag }) => {
    const when = formatSessionWhen({ date: row.date, start: row.start, end: row.end, timeZoneLabel });
    return (
        <article aria-label={row.title} className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    {typeTag}
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{row.title}</h3>
                    <p className="text-sm italic text-gray-500">{row.waitingNote}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass(row.status)}`}>
                    {getStatusLabel(row.status)}
                </span>
            </div>
            <WhenLine text={when || "Date not set"} />
            {row.subjects && <p className="text-xs text-gray-600 break-words">{row.subjects}</p>}
            <div className="flex justify-end pt-0.5">
                <Link
                    href={`/${role}/instant-sessions`}
                    aria-label={`Manage ${row.title} on the Instant Sessions page`}
                    className="text-xs font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
                >
                    Manage
                </Link>
            </div>
        </article>
    );
};

export default ScheduleOpenInstantCard;
