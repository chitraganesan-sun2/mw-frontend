"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { PUT_API } from "@/api/request";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { useConfirm } from "@/hooks/useConfirm";
import { useAppStore } from "@/store/useAppStore";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import ReportPersonModal from "@/components/common/ReportPersonModal";
import { declineReasonText } from "@/utils/declineReason";
import { endpoints } from "@/api/constants";
import { downloadFile } from "@/utils/downloadFile";
import { isNativePlatform } from "@/utils/platform";
import { joinNames } from "@/utils/joinNames";
import { safeHref } from "@/utils/safeHref";
import JoinButton from "@/components/common/JoinButton";
import {
    canCompleteSession,
    joinState,
    formatDuration,
    formatSessionDate,
    formatLevel,
    formatSessionTime,
    counterpartTimeNote,
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
    /** Asks the other person to move this accepted session to a new time. */
    onReschedule?: (session: ScheduleSession) => void;
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

/**
 * The status the card actually shows: a pending request nobody answered before its time
 * passed is "expired" (derived client-side, the API still says "pending"). The status filter
 * must be built from the same value or it offers "Pending" and never "Expired".
 */
export function getDisplayStatus(
    session: ScheduleSession,
    role: ScheduleRole,
    timeZoneLabel?: string,
    now: dayjs.Dayjs = dayjs()
): string {
    const status = session.status ?? "";
    if (status !== "pending") return status;
    const { date, start, end } = localTimes(session, role);
    const bounds = getSessionInstantBounds(session, { date, start, end, timeZoneLabel });
    return bounds && !bounds.end.isAfter(now) ? "expired" : status;
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
    onReschedule,
    now = dayjs(),
}) => {
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [completing, setCompleting] = useState(false);
    const queryClient = useQueryClient();
    const { confirm, confirmModal } = useConfirm();
    const { setEventDetails } = useAppStore();
    const [, setModal] = useQueryState("modal");
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
    const joinStatus = joinHref ? joinState(session, bounds, now) : "none";
    const timeRange = [formatSessionTime(start), formatSessionTime(end)].filter(Boolean).join(" – ");
    const theirTime = counterpartTimeNote(
        bounds,
        timeZoneLabel,
        isLearnerViewer ? session.volunteer_timezone : session.learner_timezone
    );
    const awaitingMe = isAwaitingMyResponse(session, role);
    // Sessions are never auto-completed: once an accepted session has ended, either person marks
    // it completed (that credits the hours), then leaves feedback.
    const canComplete = Boolean(session.session_id) && canCompleteSession(session, bounds, now);
    const feedbackGiven =
        role === "volunteer" ? session.feedback_collected_from_volunteer : session.feedback_collected_from_learner;
    const canGiveFeedback = Boolean(session.session_id) && session.status === "completed" && !feedbackGiven;
    const showRespond = Boolean(onRespond) && awaitingMe;
    // Only an accepted session that hasn't started can be moved, one request at a time.
    const canReschedule =
        Boolean(onReschedule) &&
        session.status === "accepted" &&
        !session.reschedule_pending &&
        Boolean(bounds && bounds.start.isAfter(now));
    // Only a session that was actually arranged has another person to report.
    const canReport = Boolean(session.session_id) && (session.status === "accepted" || session.status === "completed");
    const declinedBecause = declineReasonText(session.decline_reason, session.decline_note);
    const isRescheduleRequest = session.status === "pending" && Boolean(session.reschedules_session_id);
    // A request nobody answered before its time passed is "Expired", not still "Pending".
    const statusKey = getDisplayStatus(session, role, timeZoneLabel, now);

    const handleComplete = async () => {
        if (completing) return;
        const ok = await confirm({
            title: "Mark this session as completed?",
            description:
                "This records the session as held and adds its hours to your totals. It can't be undone.",
            confirmText: "Mark as completed",
            cancelText: "Not yet",
        });
        if (!ok) return;
        setCompleting(true);
        try {
            await PUT_API(endpoints.session.markAsCompleted(session.session_id), {});
            showToast({ type: "success", message: "Session marked as completed." });
            invalidateScheduleViews(queryClient, role);
            // Hours and class counts shown on the profiles / browse lists.
            ["volunteer-profile", "learner", "volunteer"].forEach((key) =>
                queryClient.invalidateQueries({ queryKey: [key] })
            );
        } catch (err) {
            showToast({
                type: "error",
                message: getApiErrorMessage(err, "Couldn't mark the session as completed. Please try again."),
            });
        } finally {
            setCompleting(false);
        }
    };

    const handleGiveFeedback = () => {
        // The feedback modal reads the session from the store (same shape the calendar sets).
        setEventDetails({
            extendedProps: {
                sessionId: session.session_id,
                volunteerId: session.volunteer_id,
                volunteer_full_name: session.volunteer_full_name,
                learner: { id: session.learner_id, firstName: session.learner_first_name },
                learner_full_name: joinNames(session.learner_first_name, session.learner_last_name),
            },
        });
        setModal("feedback");
    };

    const showDescription =
        Boolean(session.session_description) &&
        !isRedundantLevelDescription(session.session_description, session.requested_level);

    return (
        <article
            aria-label={session.session_title || "Session"}
            className={`min-w-0 rounded-lg border bg-white p-3 flex flex-col gap-1.5 ${
                awaitingMe ? "border-amber-300 border-l-4 border-l-amber-400" : "border-gray-200"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {session.session_title || "Session"}
                    </h3>
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
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass(statusKey)}`}>
                    {getStatusLabel(statusKey)}
                </span>
            </div>

            <p className="text-xs text-gray-700 break-words">
                <span className="font-medium text-gray-900">{formatSessionDate(date) || "Date not set"}</span>
                {timeRange && <span> · {timeRange}{timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, date)}` : ""}</span>}
                {duration && <span> · {duration}</span>}
            </p>
            {theirTime && (
                <p className="text-[11px] text-gray-500">
                    {counterpartName ? `${counterpartName}'s time` : "Their time"}: {theirTime}
                </p>
            )}

            {subjects && <p className="text-xs text-gray-600">{subjects}</p>}

            {/* Accepted but the calendar event/Meet link was never created (calendar outage) -
                otherwise the card just has no Join button and nothing says why. */}
            {session.status === "accepted" && !joinHref && bounds && bounds.end.isAfter(now) && (
                <p className="text-xs font-medium text-amber-700">
                    Meeting link not available yet
                    {counterpartName ? ` – message ${counterpartName} if it doesn't appear` : ""}
                </p>
            )}
            {isRescheduleRequest && (
                <p className="text-xs font-medium text-amber-700">
                    New time requested – your current session stays until it&apos;s accepted
                </p>
            )}
            {session.status === "accepted" && session.reschedule_pending && (
                <p className="text-xs font-medium text-amber-700">Reschedule requested. Waiting for an answer.</p>
            )}
            {session.status === "rejected" && declinedBecause && (
                <p className="text-xs text-gray-700 break-words">
                    <span className="font-medium">Reason: </span>
                    {declinedBecause}
                </p>
            )}

            {showDescription && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">{session.session_description}</p>
            )}
            {session.preparation_details && (
                <p className="text-xs text-gray-600 line-clamp-3 break-words" title={session.preparation_details}>
                    <span className="font-medium text-gray-800">To prepare: </span>
                    {session.preparation_details}
                </p>
            )}
            {session.session_expectations && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">
                    <span className="font-medium text-gray-800">Expectations: </span>
                    {session.session_expectations}
                </p>
            )}

            {(joinStatus !== "none" || showRespond || canComplete || canGiveFeedback || canReschedule || canReport || (!isNativePlatform() && session.status === "accepted")) && (
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-0.5">
                    {canReport && (
                        <button
                            type="button"
                            onClick={() => setIsReportOpen(true)}
                            aria-label={`Report a problem with ${session.session_title || "this session"}`}
                            className="text-xs font-medium text-gray-600 underline-offset-2 hover:underline hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
                        >
                            Report a problem
                        </button>
                    )}
                    {canGiveFeedback && (
                        <button
                            type="button"
                            onClick={handleGiveFeedback}
                            aria-label={`Give feedback on ${session.session_title || "this session"}`}
                            className="text-xs font-medium text-primary underline-offset-2 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                            Give feedback
                        </button>
                    )}
                    {canComplete && (
                        <button
                            type="button"
                            onClick={handleComplete}
                            disabled={completing}
                            aria-label={`Mark ${session.session_title || "this session"} as completed`}
                            className="rounded-full bg-action px-3 py-1 text-xs font-semibold text-white hover:opacity-90 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {completing ? "Saving..." : "Mark as completed"}
                        </button>
                    )}
                    {canReschedule && (
                        <button
                            type="button"
                            onClick={() => onReschedule?.(session)}
                            aria-label={`Ask to reschedule ${session.session_title || "this session"}`}
                            className="text-xs font-medium text-gray-600 underline-offset-2 hover:underline hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
                        >
                            Reschedule
                        </button>
                    )}
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
                            title="Download a calendar file you can open in Google Calendar, Outlook, or Apple Calendar."
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 underline-offset-2 hover:underline hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
                        >
                            <HiOutlineArrowDownTray size={14} aria-hidden="true" />
                            Add to Calendar
                        </button>
                    )}
                    {showRespond && (
                        <button
                            type="button"
                            onClick={onRespond}
                            aria-label={`Respond to the session request${counterpartName ? ` from ${counterpartName}` : ""}`}
                            className="rounded-full bg-action px-3 py-1 text-xs font-semibold text-white hover:opacity-90 border-0 cursor-pointer"
                        >
                            Respond
                        </button>
                    )}
                    <JoinButton state={joinStatus} href={joinHref} contextLabel={session.session_title || "session"} />
                </div>
            )}
            {confirmModal}
            {isReportOpen && (
                <ReportPersonModal
                    isOpen
                    onClose={() => setIsReportOpen(false)}
                    reportType="session"
                    targetId={session.session_id}
                />
            )}
        </article>
    );
};

export default ScheduleSessionCard;
