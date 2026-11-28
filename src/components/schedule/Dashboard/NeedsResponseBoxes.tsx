"use client";
import { joinNames } from "@/utils/joinNames";
import { formatSessionDate, formatSessionTime, formatDuration, getDurationMinutes, shortTimeZone } from "@/utils/sessionDisplay";
import type { ScheduleSession } from "@/hooks/schedule/useScheduleSessions";
import { localTimes } from "./NextSessionBanner";
import type { ScheduleRole } from "./scheduleCategories";

interface NeedsResponseBoxesProps {
    sessions: ScheduleSession[];
    role: ScheduleRole;
    timeZoneLabel?: string;
    /** Opens the Approval drawer, where the request is accepted or declined. */
    onRespond: () => void;
    className?: string;
}

/**
 * Requests from the other person that wait for the viewer's answer, as one box each, so none is
 * missed. The heading is red and the boxes stay yellow (the "needs action" colours); everything
 * else on My Schedule uses the role colour. Shown in the side column on wide screens and above the
 * list on narrow ones.
 */
export default function NeedsResponseBoxes({ sessions, role, timeZoneLabel, onRespond, className = "" }: NeedsResponseBoxesProps) {
    if (sessions.length === 0) return null;
    return (
        <section aria-label="Needs your response" className={`flex flex-col gap-2 ${className}`}>
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-rose-700">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-rose-600" />
                Needs your response
                <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] leading-none text-white">{sessions.length}</span>
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {sessions.map((session) => {
                    const { date, start, end } = localTimes(session, role);
                    const who =
                        role === "learner" ? session.volunteer_full_name?.trim() : joinNames(session.learner_first_name, session.learner_last_name);
                    const timeRange = [formatSessionTime(start), formatSessionTime(end)].filter(Boolean).join(" – ");
                    const duration = formatDuration(getDurationMinutes(start, end));
                    const title = session.session_title || "Session";
                    return (
                        <li key={session.session_id} className="rounded-lg border border-amber-300 border-l-4 border-l-rose-500 bg-amber-50/60 p-3">
                            <p className="m-0 truncate text-sm font-semibold text-gray-900">{title}</p>
                            {who && (
                                <p className="m-0 truncate text-xs text-gray-700">
                                    {role === "learner" ? "Volunteer" : "Learner"}: <span className="font-semibold">{who}</span>
                                </p>
                            )}
                            <p className="m-0 mt-0.5 text-xs text-gray-700">
                                <span className="font-medium text-gray-900">{formatSessionDate(date) || "Date not set"}</span>
                                {timeRange && (
                                    <span>
                                        {" "}
                                        · {timeRange}
                                        {timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, date)}` : ""}
                                    </span>
                                )}
                                {duration && <span> · {duration}</span>}
                            </p>
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onRespond}
                                    aria-label={`Respond to ${title}${who ? ` from ${who}` : ""}`}
                                    className="rounded-full border-0 bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                                >
                                    Respond
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
