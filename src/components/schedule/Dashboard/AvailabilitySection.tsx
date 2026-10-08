"use client";
import { useMemo, useState } from "react";
import type dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DELETE_API, GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { showToast } from "@/components/common/Toast";
import { useConfirm } from "@/hooks/useConfirm";
import { getApiErrorMessage } from "@/utils/apiError";
import {
    joinState,
    formatSessionDate,
    formatSessionTime,
    formatShortSessionDate,
    formatTimeRange,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    shortTimeZone,
} from "@/utils/sessionDisplay";
import { joinNames } from "@/utils/joinNames";
import { safeHref } from "@/utils/safeHref";
import JoinButton from "@/components/common/JoinButton";
import { useScheduleSessions, type ScheduleSession } from "@/hooks/schedule/useScheduleSessions";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useApprovalDrawer } from "@/hooks/schedule/useApprovalDrawer";
import { useNow, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";
import { isAwaitingMyResponse } from "./ScheduleSessionCard";
import OneTimeSlotEditModal, { type OneTimeSlot } from "./OneTimeSlotEditModal";
import { SessionListSkeleton } from "./MyScheduleSection";
import { SCHEDULE_LABELS, getVolunteerSlotGroup, type ScheduleRole } from "./scheduleCategories";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
/** Rows shown per volunteer session list before "Show all". */
const COLLAPSED_ROWS = 3;

/** One-line row for the volunteer's "Slots I'm Offering / I've Taken" lists. These used to
 * repeat the full session card (already shown in My Schedule), doubling the page length. */
function CompactSessionRow({
    session,
    timeZoneLabel,
    onOpenProfile,
    onRespond,
    now,
}: {
    session: ScheduleSession;
    timeZoneLabel?: string;
    onOpenProfile: (userId: string) => void;
    onRespond: () => void;
    now: dayjs.Dayjs;
}) {
    const learnerName = joinNames(session.learner_first_name, session.learner_last_name);
    // Absolute instants from the UTC fields - see getSessionInstantBounds.
    const bounds = getSessionInstantBounds(session, {
        date: session.volunteer_start_date,
        start: session.volunteer_start_time,
        end: session.volunteer_end_time,
        timeZoneLabel,
    });
    const joinHref = safeHref(session.meet_link);
    const joinStatus = joinHref ? joinState(session, bounds, now) : "none";
    const showRespond = isAwaitingMyResponse(session, "volunteer");
    return (
        <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{session.session_title || "Session"}</p>
                <p className="text-xs text-gray-600">
                    {formatShortSessionDate(session.volunteer_start_date)} ·{" "}
                    {formatSessionTime(session.volunteer_start_time)}
                    {timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, session.volunteer_start_date)}` : ""}
                    {learnerName && session.learner_id && (
                        <>
                            {" "}·{" "}
                            <button
                                type="button"
                                onClick={() => onOpenProfile(session.learner_id as string)}
                                aria-label={`View ${learnerName}'s profile`}
                                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
                            >
                                {learnerName}
                            </button>
                        </>
                    )}
                </p>
            </div>
            <span className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass(session.status)}`}>
                    {getStatusLabel(session.status)}
                </span>
                {showRespond && (
                    <button
                        type="button"
                        onClick={onRespond}
                        aria-label={`Respond to the session request${learnerName ? ` from ${learnerName}` : ""}`}
                        className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white hover:opacity-90 border-0 cursor-pointer"
                    >
                        Respond
                    </button>
                )}
                <JoinButton state={joinStatus} href={joinHref} />
            </span>
        </li>
    );
}

interface WeeklySlot {
    start_time: string;
    end_time: string;
    slot_type?: "repeats_weekly" | "custom";
    start_date?: string;
    end_date?: string;
    weekly_repeat_interval?: number;
}

interface WeeklyDay {
    day: string;
    slots: WeeklySlot[];
}

/** Query keys share the editors' invalidation prefix (useScheduleSlots invalidates
 * ["volunteer_slot"] / ["learner_slot"] on save), so the card refreshes after any edit. */
const weeklyKey = (role: ScheduleRole) => [role === "volunteer" ? "volunteer_slot" : "learner_slot", "weekly"];
const ONE_TIME_KEY = ["volunteer_slot", "one_time"];

function recurrenceLabel(slot: WeeklySlot): string {
    const interval = slot.weekly_repeat_interval && slot.weekly_repeat_interval > 1 ? slot.weekly_repeat_interval : 1;
    const every = interval > 1 ? `Every ${interval} weeks` : "Weekly";
    if (slot.slot_type === "custom" && slot.end_date) return `${every} until ${formatSessionDate(slot.end_date)}`;
    if (slot.slot_type === "custom" && slot.start_date) return `${every} from ${formatSessionDate(slot.start_date)}`;
    return every;
}

interface AvailabilitySectionProps {
    role: ScheduleRole;
    timeZoneLabel?: string;
    onScheduleAvailability: () => void;
    /** Volunteer only: open the date-specific slot editor for a date (YYYY-MM-DD). */
    onAddDateSlot?: (date: string) => void;
    onOpenProfile: (userId: string) => void;
}

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
    role,
    timeZoneLabel,
    onScheduleAvailability,
    onAddDateSlot,
    onOpenProfile,
}) => {
    const isVolunteer = role === "volunteer";
    const queryClient = useQueryClient();
    const { confirm, confirmModal } = useConfirm();
    const [editing, setEditing] = useState<OneTimeSlot | null>(null);
    const [newDate, setNewDate] = useState("");
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    // One-time slot being removed - disables its Remove so a double click can't fire twice.
    const [removingId, setRemovingId] = useState<string | null>(null);
    const openApprovals = useApprovalDrawer((state) => state.open);
    const now = useNow();
    // "Today" in the PROFILE timezone (the browser's date can differ).
    const today = useProfileToday(role);

    const weekly = useQuery({
        queryKey: weeklyKey(role),
        queryFn: async () => {
            const res: any = await GET_API(isVolunteer ? endpoints.volunteer_slot.get : endpoints.learner_slot.get);
            return (Array.isArray(res?.data) ? res.data : []) as WeeklyDay[];
        },
    });

    const oneTime = useQuery({
        queryKey: ONE_TIME_KEY,
        queryFn: async () => {
            const res: any = await GET_API(endpoints.volunteer_slot.listOneTimeSlots);
            return (Array.isArray(res?.data) ? res.data : []) as OneTimeSlot[];
        },
        enabled: isVolunteer,
    });

    // Same query (and cache entry) as My Schedule's upcoming list - no extra request.
    const upcoming = useScheduleSessions(role, "upcoming", isVolunteer);
    const { offering, taken } = useMemo(() => {
        const groups: { offering: ScheduleSession[]; taken: ScheduleSession[] } = { offering: [], taken: [] };
        (upcoming.data?.items || []).forEach((s) => {
            const group = getVolunteerSlotGroup(s);
            if (group) groups[group].push(s);
        });
        return groups;
    }, [upcoming.data]);

    const weeklyRows = useMemo(
        () =>
            (weekly.data || [])
                .flatMap((d) => (d.slots || []).filter((s) => s.start_time && s.end_time).map((s) => ({ day: d.day, slot: s })))
                .sort(
                    (a, b) =>
                        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.slot.start_time.localeCompare(b.slot.start_time)
                ),
        [weekly.data]
    );

    const refreshAvailability = () => invalidateScheduleViews(queryClient, role);

    const deleteSlot = async (slot: OneTimeSlot) => {
        const ok = await confirm({
            title: "Remove this availability?",
            description: `${formatSessionDate(slot.date)}, ${formatTimeRange(slot.start_time, slot.end_time)} will no longer be offered to learners.`,
            confirmText: "Remove",
            danger: true,
        });
        if (!ok) return;
        setRemovingId(slot.volunteer_slot_id);
        try {
            await DELETE_API(endpoints.volunteer_slot.oneTimeSlot(slot.date, slot.volunteer_slot_id));
            showToast({ type: "success", message: "Availability removed" });
            refreshAvailability();
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't remove this slot.") });
        } finally {
            setRemovingId(null);
        }
    };

    const isLoading = weekly.isLoading || (isVolunteer && oneTime.isLoading);
    const hasError = weekly.isError || (isVolunteer && oneTime.isError);
    const nothingScheduled = weeklyRows.length === 0 && (oneTime.data?.length ?? 0) === 0;

    const renderSessionGroup = (title: string, sessions: ScheduleSession[], empty: string) => (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">
                {title} <span className="font-normal text-gray-500">({upcoming.data ? sessions.length : "…"})</span>
            </h3>
            {/* isPending: see MyScheduleSection - avoids an empty-state flash. */}
            {upcoming.isPending ? (
                <SessionListSkeleton rows={1} />
            ) : upcoming.isError ? (
                <QueryErrorNotice message="Couldn't load these sessions." onRetry={() => upcoming.refetch()} />
            ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-600">{empty}</p>
            ) : (
                <>
                    <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
                        {(expanded[title] ? sessions : sessions.slice(0, COLLAPSED_ROWS)).map((s) => (
                            <CompactSessionRow
                                key={s.session_id}
                                session={s}
                                timeZoneLabel={timeZoneLabel}
                                onOpenProfile={onOpenProfile}
                                onRespond={openApprovals}
                                now={now}
                            />
                        ))}
                    </ul>
                    {sessions.length > COLLAPSED_ROWS && (
                        <button
                            type="button"
                            aria-expanded={Boolean(expanded[title])}
                            onClick={() => setExpanded((e) => ({ ...e, [title]: !e[title] }))}
                            className="self-start text-xs font-medium underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                            {expanded[title] ? "Show fewer" : `Show all ${sessions.length}`}
                        </button>
                    )}
                </>
            )}
        </div>
    );

    return (
        <section aria-labelledby="availability-heading" className="bg-white rounded-xl p-4 flex flex-col gap-4 min-w-0">
            {confirmModal}
            <OneTimeSlotEditModal
                slot={editing}
                onClose={() => setEditing(null)}
                onSaved={() => {
                    setEditing(null);
                    showToast({ type: "success", message: "Availability updated" });
                    refreshAvailability();
                }}
            />

            <h2 id="availability-heading" className="text-base font-semibold">
                {SCHEDULE_LABELS.availabilityHeading}
            </h2>

            {/* Full-width section: the groups sit side by side on wide screens instead of one tall column. */}
            <div className={isVolunteer ? "grid grid-cols-1 gap-4 items-start lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {isVolunteer && renderSessionGroup(SCHEDULE_LABELS.slotsOffering, offering, "No learner has booked your availability yet.")}
            {isVolunteer && renderSessionGroup(SCHEDULE_LABELS.slotsTaken, taken, "You haven't taken any learner postings yet.")}

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{SCHEDULE_LABELS.myAvailabilitySchedule}</h3>
                    {/* The header's "Schedule my availability" opens the same editor. */}
                    <button
                        type="button"
                        onClick={onScheduleAvailability}
                        aria-label="Edit my recurring availability"
                        className="text-xs font-medium underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                        Edit recurring
                    </button>
                </div>
                {isLoading ? (
                    <SessionListSkeleton rows={1} />
                ) : hasError ? (
                    <QueryErrorNotice
                        message="Couldn't load your availability."
                        onRetry={() => {
                            weekly.refetch();
                            if (isVolunteer) oneTime.refetch();
                        }}
                    />
                ) : nothingScheduled ? (
                    <p className="text-sm text-gray-600">You haven&apos;t scheduled any availability yet.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
                        {weeklyRows.map(({ day, slot }, i) => (
                            <li key={`w-${day}-${slot.start_time}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                                <span>
                                    <span className="font-medium">Every {day}</span>
                                    <span className="text-gray-700">
                                        {" "}·{" "}
                                        {formatTimeRange(
                                            slot.start_time,
                                            slot.end_time,
                                            timeZoneLabel ? shortTimeZone(timeZoneLabel) : null
                                        )}
                                    </span>
                                </span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                    Recurring · {recurrenceLabel(slot)}
                                </span>
                            </li>
                        ))}
                        {(oneTime.data || []).map((slot) => (
                            <li key={`o-${slot.date}-${slot.volunteer_slot_id}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                                <span>
                                    <span className="font-medium">{formatSessionDate(slot.date)}</span>
                                    <span className="text-gray-700">
                                        {" "}·{" "}
                                        {formatTimeRange(
                                            slot.start_time,
                                            slot.end_time,
                                            timeZoneLabel ? shortTimeZone(timeZoneLabel, slot.date) : null
                                        )}
                                    </span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800">One-time</span>
                                    {slot.is_booked ? (
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClass("booked")}`}>Booked</span>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setEditing(slot)}
                                                aria-label={`Edit availability on ${formatSessionDate(slot.date)} at ${formatSessionTime(slot.start_time)}`}
                                                className="text-xs font-medium underline bg-transparent border-0 p-0 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteSlot(slot)}
                                                disabled={removingId === slot.volunteer_slot_id}
                                                aria-label={`Remove availability on ${formatSessionDate(slot.date)} at ${formatSessionTime(slot.start_time)}`}
                                                className="text-xs font-medium text-gray-700 underline bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {removingId === slot.volunteer_slot_id ? "Removing…" : "Remove"}
                                            </button>
                                        </>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {isVolunteer && onAddDateSlot && (
                    <form
                        className="flex flex-wrap items-end gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!newDate || newDate < today) {
                                showToast({ type: "error", message: "Please pick today or a future date." });
                                return;
                            }
                            onAddDateSlot(newDate);
                        }}
                    >
                        <label htmlFor="date-specific-availability" className="flex flex-col gap-1 text-xs font-medium text-gray-700">
                            Add a date-specific slot
                            <input
                                id="date-specific-availability"
                                type="date"
                                min={today}
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="h-9 rounded-lg border border-gray-300 px-2 text-sm font-normal"
                            />
                        </label>
                        <button
                            type="submit"
                            className="h-9 rounded-full bg-black px-4 text-xs font-semibold text-white disabled:opacity-50"
                            disabled={!newDate}
                        >
                            Choose times
                        </button>
                    </form>
                )}
            </div>
            </div>
        </section>
    );
};

export default AvailabilitySection;
