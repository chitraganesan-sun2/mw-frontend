"use client";
import dayjs from "dayjs";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { endpoints } from "@/api/constants";
import { downloadFile } from "@/utils/downloadFile";
import { isNativePlatform } from "@/utils/platform";
import { joinNames } from "@/utils/joinNames";
import { safeHref } from "@/utils/safeHref";
import {
    canJoinSession,
    formatDuration,
    formatSessionDate,
    formatLevel,
    formatSessionTime,
    getDurationMinutes,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    isRedundantLevelDescription,
    shortTimeZone,
} from "@/utils/sessionDisplay";
import type { ScheduleSession } from "@/hooks/schedule/useScheduleSessions";
import { getSessionOrigin, type ScheduleRole } from "./scheduleCategories";

interface ScheduleSessionCardProps {
    session: ScheduleSession;
    role: ScheduleRole;
    timeZoneLabel?: string;
    /** Opens the other participant's profile (learner -> volunteer, volunteer -> learner). */
    onOpenProfile?: (userId: string) => void;
    /** Opens the Approval drawer - shown on pending sessions awaiting the viewer's answer. */
    onRespond?: () => void;
    now?: dayjs.Dayjs;
}

/** A pending direct session the OTHER party asked for: the viewer is the one who has to
 * accept or decline (legacy sessions without initiated_by were learner-initiated). Requests
 * the viewer sent stay a plain "Pending". */
export function isAwaitingMyResponse(session: ScheduleSession, role: ScheduleRole): boolean {
    if (session.status !== "pending") return false;
    const origin = getSessionOrigin(session);
    if (origin !== "learner_booked_slot" && origin !== "volunteer_proposed") return false;
    return (session.initiated_by || "learner") !== role;
}

/** The viewer's own local date/time fields (the API stores both participants' local copies). */
function localTimes(session: ScheduleSession, role: ScheduleRole) {
    return role === "volunteer"
        ? { date: session.volunteer_start_date, start: session.volunteer_start_time, end: session.volunteer_end_time }
        : { date: session.learner_start_date, start: session.learner_start_time, end: session.learner_end_time };
}

function subjectLine(session: ScheduleSession): string {
    const subjects = [
        ...(session.requested_skills || []),
        ...(session.academic_skills || []),
        ...(session.non_academic_skills || []),
    ].filter(Boolean);
    const parts = [subjects.join(", "), formatLevel(session.requested_level)].filter(Boolean);
    return parts.join(" · ");
}

const ScheduleSessionCard: React.FC<ScheduleSessionCardProps> = ({
    session,
    role,
    timeZoneLabel,
    onOpenProfile,
    onRespond,
    now = dayjs(),
}) => {
    const { date, start, end } = localTimes(session, role);
    // Absolute instants (from the UTC fields) for the Join decision - the local fields are in
    // the PROFILE timezone, which can differ from the browser's.
    const bounds = getSessionInstantBounds(session, { date, start, end, timeZoneLabel });
    const duration = formatDuration(getDurationMinutes(start, end));
    const isLearnerViewer = role === "learner";
    const counterpartId = isLearnerViewer ? session.volunteer_id : session.learner_id;
    const counterpartName = isLearnerViewer
        ? session.volunteer_full_name?.trim()
        : joinNames(session.learner_first_name, session.learner_last_name);
    const counterpartRole = isLearnerViewer ? "Volunteer" : "Learner";
    const subjects = subjectLine(session);
    const joinHref = safeHref(session.meet_link);
    const showJoin = Boolean(joinHref) && canJoinSession(session, bounds?.end, now);
    const timeRange = [formatSessionTime(start), formatSessionTime(end)].filter(Boolean).join(" – ");
    const showRespond = Boolean(onRespond) && isAwaitingMyResponse(session, role);
    const showDescription =
        Boolean(session.session_description) &&
        !isRedundantLevelDescription(session.session_description, session.requested_level);

    return (
        <article
            aria-label={session.session_title || "Session"}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {session.session_title || "Session"}
                    </h4>
                    {counterpartName && (
                        <p className="text-sm text-gray-700 break-words">
                            <span className="text-gray-500">{counterpartRole}: </span>
                            {onOpenProfile && counterpartId ? (
                                <button
                                    type="button"
                                    onClick={() => onOpenProfile(counterpartId)}
                                    aria-label={`View ${counterpartName}'s profile`}
                                    className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-primary hover:decoration-current bg-transparent border-0 p-0 cursor-pointer"
                                >
                                    {counterpartName}
                                </button>
                            ) : (
                                <span className="font-semibold text-gray-900">{counterpartName}</span>
                            )}
                        </p>
                    )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass(session.status)}`}>
                    {getStatusLabel(session.status)}
                </span>
            </div>

            <p className="text-xs text-gray-700 break-words">
                <span className="font-medium text-gray-900">{formatSessionDate(date) || "Date not set"}</span>
                {timeRange && <span> · {timeRange}{timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, date)}` : ""}</span>}
                {duration && <span> · {duration}</span>}
            </p>

            {subjects && <p className="text-xs text-gray-600">{subjects}</p>}

            {showDescription && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">{session.session_description}</p>
            )}
            {session.session_expectations && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">
                    <span className="font-medium text-gray-800">Expectations: </span>
                    {session.session_expectations}
                </p>
            )}

            {(showJoin || showRespond || (!isNativePlatform() && session.status === "accepted")) && (
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-0.5">
                    {!isNativePlatform() && session.status === "accepted" && (
                        <button
                            type="button"
                            onClick={() =>
                                downloadFile(
                                    endpoints.session.downloadIcs(session.session_id),
                                    `session-${session.session_id}.ics`,
                                    "text/calendar"
                                )
                            }
                            // A bare calendar icon read as "open my calendar" but downloads a file -
                            // say what it does.
                            title="Downloads an .ics file you can open in Google Calendar, Outlook or Apple Calendar"
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 underline-offset-2 hover:underline hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
                        >
                            <HiOutlineArrowDownTray size={14} aria-hidden="true" />
                            Download .ics
                        </button>
                    )}
                    {showRespond && (
                        <button
                            type="button"
                            onClick={onRespond}
                            aria-label={`Respond to the session request${counterpartName ? ` from ${counterpartName}` : ""}`}
                            className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white hover:opacity-90 border-0 cursor-pointer"
                        >
                            Respond
                        </button>
                    )}
                    {showJoin && (
                        <a
                            href={joinHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full btn-primary-fill px-3 py-1 text-xs font-semibold"
                        >
                            Join
                        </a>
                    )}
                </div>
            )}
        </article>
    );
};

export default ScheduleSessionCard;
