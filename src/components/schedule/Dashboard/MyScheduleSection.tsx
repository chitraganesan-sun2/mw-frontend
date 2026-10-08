"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { joinNames } from "@/utils/joinNames";
import { getStatusLabel } from "@/utils/sessionDisplay";
import {
    MAX_PAGE_SIZE,
    PAST_STEP,
    useScheduleSessions,
    type ScheduleSession,
} from "@/hooks/schedule/useScheduleSessions";
import { useApprovalDrawer } from "@/hooks/schedule/useApprovalDrawer";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useNow, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";
import ScheduleSessionCard, { isAwaitingMyResponse } from "./ScheduleSessionCard";
import NextSessionBanner, { findNextSession } from "./NextSessionBanner";
import {
    SCHEDULE_LABELS,
    SCHEDULE_TAB_EMPTY,
    SCHEDULE_TAB_LABELS,
    getScheduleTab,
    type ScheduleRole,
    type ScheduleTab,
} from "./scheduleCategories";

const TABS: ScheduleTab[] = ["posted", "accepted", "direct"];

interface MyScheduleSectionProps {
    role: ScheduleRole;
    timeZoneLabel?: string;
    onOpenProfile: (userId: string) => void;
    /** Opens Add New Session - offered from the empty states. */
    onAddSession?: () => void;
}

/** "My Posted Sessions (accepted by learners)" -> ["My Posted Sessions", "accepted by learners"]. */
function splitTabLabel(label: string): [string, string] {
    const m = label.match(/^(.*?)\s*\((.*)\)$/);
    return m ? [m[1], m[2]] : [label, ""];
}

interface SessionGroup {
    key: string;
    label: string;
    accent?: boolean;
    items: ScheduleSession[];
}

/** Date groups so the next session is easy to spot. Upcoming: requests waiting for the viewer
 * first, then Today / Tomorrow / This week / Next week / Later. Past: Today / Yesterday /
 * Earlier this week / Earlier this month / Older, with cancelled or declined sessions that were
 * scheduled for a later date kept together. Input order (already sorted by the API) is kept. */
function groupSessions(sessions: ScheduleSession[], role: ScheduleRole, when: "upcoming" | "past", today: string): SessionGroup[] {
    const groups: SessionGroup[] = [];
    const add = (key: string, label: string, session: ScheduleSession, accent = false) => {
        let group = groups.find((g) => g.key === key);
        if (!group) {
            group = { key, label, accent, items: [] };
            groups.push(group);
        }
        group.items.push(session);
    };
    const base = dayjs(today);
    sessions.forEach((session) => {
        if (when === "upcoming" && isAwaitingMyResponse(session, role)) {
            add("respond", "Needs your response", session, true);
            return;
        }
        const date = role === "volunteer" ? session.volunteer_start_date : session.learner_start_date;
        const diff = date && base.isValid() ? dayjs(date).diff(base, "day") : 0;
        if (when === "upcoming") {
            if (diff <= 0) add("today", "Today", session);
            else if (diff === 1) add("tomorrow", "Tomorrow", session);
            else if (diff <= 6) add("week", "This week", session);
            else if (diff <= 13) add("next", "Next week", session);
            else add("later", "Later", session);
        } else if (diff > 0) {
            add("cancelled-later", "Cancelled or declined", session);
        } else if (diff === 0) add("today", "Today", session);
        else if (diff === -1) add("yesterday", "Yesterday", session);
        else if (diff >= -6) add("week", "Earlier this week", session);
        else if (diff >= -30) add("month", "Earlier this month", session);
        else add("older", "Older", session);
    });
    return groups;
}

export function SessionListSkeleton({ rows = 2 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading sessions">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
            ))}
        </div>
    );
}

const MyScheduleSection: React.FC<MyScheduleSectionProps> = ({ role, timeZoneLabel, onOpenProfile, onAddSession }) => {
    const [activeTab, setActiveTab] = useState<ScheduleTab>("posted");
    const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
    const tabRefs = useRef<Record<ScheduleTab, HTMLButtonElement | null>>({ posted: null, accepted: null, direct: null });

    const router = useRouter();
    // Reschedule = the booking form in "reschedule" mode: same person, new time.
    const startReschedule = (session: ScheduleSession) => {
        const counterpartId = role === "learner" ? session.volunteer_id : session.learner_id;
        if (!counterpartId) return;
        const modal = role === "learner" ? "add_new_meeting" : "add_new_session";
        const counterpartParam = role === "learner" ? "volunteerId" : "learnerId";
        router.push(
            `/${role}/schedule?modal=${modal}&reschedule=${encodeURIComponent(session.session_id)}&${counterpartParam}=${encodeURIComponent(counterpartId)}`
        );
    };

    const openApprovals = useApprovalDrawer((state) => state.open);
    // Re-evaluated every minute so Join appears/disappears without a reload.
    const now = useNow();
    const today = useProfileToday(role);

    // Past history grows in steps ("Show more"); search / status filter narrow what is loaded.
    const [pastSize, setPastSize] = useState<number>(PAST_STEP);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const upcoming = useScheduleSessions(role, "upcoming");
    const past = useScheduleSessions(role, "past", when === "past", pastSize);
    const active = when === "upcoming" ? upcoming : past;

    const byTab = useMemo(() => {
        const groups: Record<ScheduleTab, ScheduleSession[]> = { posted: [], accepted: [], direct: [] };
        (active.data?.items || []).forEach((session) => {
            // A volunteer's slot bookings are listed under Availability while upcoming, but that
            // section has no past view - so in Past they appear under Direct (a specific learner
            // booked the slot) instead of vanishing from history.
            const tab = getScheduleTab(session, role) ?? (when === "past" ? "direct" : null);
            if (tab) groups[tab].push(session);
        });
        return groups;
    }, [active.data, role, when]);

    // Open on the first tab that has sessions (once per Upcoming/Past switch), rather than
    // an empty "Posted" tab while e.g. Direct has bookings. Manual tab picks are respected.
    const autoPicked = useRef<string | null>(null);
    useEffect(() => {
        if (!active.data || autoPicked.current === when) return;
        autoPicked.current = when;
        const firstWithItems = TABS.find((tab) => byTab[tab].length > 0);
        if (firstWithItems) setActiveTab(firstWithItems);
    }, [active.data, byTab, when]);

    const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        const index = TABS.indexOf(activeTab);
        let next: number | null = null;
        if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
        if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = TABS.length - 1;
        if (next === null) return;
        e.preventDefault();
        setActiveTab(TABS[next]);
        tabRefs.current[TABS[next]]?.focus();
    };

    const nextSession = useMemo(
        () => (when === "upcoming" ? findNextSession(upcoming.data?.items || [], role, timeZoneLabel, now) : null),
        [when, upcoming.data, role, timeZoneLabel, now]
    );
    const tabSessions = byTab[activeTab];
    // Statuses present in this tab, for the filter dropdown.
    const statusOptions = useMemo(
        () => Array.from(new Set(tabSessions.map((s) => s.status).filter(Boolean) as string[])),
        [tabSessions]
    );
    // A status picked on another tab may not exist here - fall back to "all".
    useEffect(() => {
        if (statusFilter !== "all" && !statusOptions.includes(statusFilter)) setStatusFilter("all");
    }, [statusFilter, statusOptions]);
    const isFiltering = search.trim() !== "" || statusFilter !== "all";
    const sessions = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return tabSessions.filter((s) => {
            if (statusFilter !== "all" && s.status !== statusFilter) return false;
            if (!needle) return true;
            const person = role === "learner" ? s.volunteer_full_name : joinNames(s.learner_first_name, s.learner_last_name);
            const haystack = [
                s.session_title,
                person,
                ...(s.requested_skills || []),
                ...(s.academic_skills || []),
                ...(s.non_academic_skills || []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [tabSessions, search, statusFilter, role]);
    const groups = useMemo(() => groupSessions(sessions, role, when, today), [sessions, role, when, today]);
    const loadedPast = past.data?.items.length ?? 0;
    const hiddenPast = when === "past" && (past.data?.total ?? 0) > loadedPast;
    const canShowMore = hiddenPast && pastSize < MAX_PAGE_SIZE;
    const showFilters = tabSessions.length >= 4 || isFiltering;

    return (
        <section aria-labelledby="my-schedule-heading" className="bg-white rounded-xl p-4 flex flex-col gap-3 min-w-0">
            {/* Heading centered, Upcoming/Past toggle at the right (stacked and centered on phones). */}
            <div className="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr]">
                <span aria-hidden="true" className="hidden sm:block" />
                <h2 id="my-schedule-heading" className="text-lg font-semibold text-center">
                    {SCHEDULE_LABELS.mySchedule}
                </h2>
                <div role="group" aria-label="Show sessions" className="inline-flex rounded-full border border-gray-200 p-0.5 text-xs sm:justify-self-end">
                    {(["upcoming", "past"] as const).map((w) => (
                        <button
                            key={w}
                            type="button"
                            aria-pressed={when === w}
                            onClick={() => {
                                setWhen(w);
                                setSearch("");
                                setStatusFilter("all");
                            }}
                            className={`rounded-full px-3 py-1 font-medium capitalize ${when === w ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {nextSession && <NextSessionBanner session={nextSession} role={role} timeZoneLabel={timeZoneLabel} now={now} />}

            <div role="tablist" aria-label={SCHEDULE_LABELS.mySchedule} className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                {TABS.map((tab) => {
                    const selected = tab === activeTab;
                    const count = active.data ? byTab[tab].length : null;
                    const [tabTitle, tabNote] = splitTabLabel(SCHEDULE_TAB_LABELS[role][tab]);
                    return (
                        <button
                            key={tab}
                            ref={(el) => {
                                tabRefs.current[tab] = el;
                            }}
                            id={`schedule-tab-${tab}`}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`schedule-panel-${tab}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setActiveTab(tab)}
                            onKeyDown={onTabKeyDown}
                            className={`flex-1 rounded-lg border px-3 py-2 text-left text-xs font-medium leading-snug transition-colors ${selected ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"}`}
                        >
                            <span className="block">
                                {tabTitle}
                                {count !== null && <span className={`ml-1 ${selected ? "text-gray-300" : "text-gray-500"}`}>({count})</span>}
                            </span>
                            {tabNote && (
                                <span className={`block text-[11px] font-normal ${selected ? "text-gray-300" : "text-gray-500"}`}>
                                    {tabNote}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {showFilters && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, person or subject"
                        aria-label="Search sessions"
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                    />
                    {statusOptions.length > 1 && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
                        >
                            <option value="all">All statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* Announces the result of a search / filter to screen readers. */}
            <p role="status" aria-live="polite" className="sr-only">
                {isFiltering ? `${sessions.length} of ${tabSessions.length} sessions shown` : ""}
            </p>

            <div
                id={`schedule-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`schedule-tab-${activeTab}`}
                className="flex flex-col gap-2"
            >
                {/* isPending, not isLoading: the query stays disabled until the user id is read
                    from the cookie, and a disabled query reports isLoading=false - the empty-state
                    text used to flash before the real list. */}
                {active.isPending ? (
                    <SessionListSkeleton />
                ) : active.isError ? (
                    <QueryErrorNotice message="Couldn't load your sessions." onRetry={() => active.refetch()} />
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <p className="text-sm text-gray-600">
                            {isFiltering
                                ? "No sessions match your search."
                                : when === "past"
                                  ? "No past sessions here yet."
                                  : SCHEDULE_TAB_EMPTY[role][activeTab]}
                        </p>
                        {isFiltering && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                }}
                                className="text-xs font-medium text-gray-700 underline bg-transparent border-0 p-0 cursor-pointer"
                            >
                                Clear search
                            </button>
                        )}
                        {!isFiltering && when === "upcoming" && onAddSession && (
                            <button
                                type="button"
                                onClick={onAddSession}
                                className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-900 border-0 cursor-pointer"
                            >
                                Add New Session
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {groups.map((group) => (
                            <div
                                key={group.key}
                                role="group"
                                aria-labelledby={`schedule-group-${group.key}`}
                                className="flex flex-col gap-2"
                            >
                                <h3
                                    id={`schedule-group-${group.key}`}
                                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                                        group.accent ? "text-amber-700" : "text-gray-500"
                                    }`}
                                >
                                    {group.label} <span className="font-normal">({group.items.length})</span>
                                </h3>
                                {/* grid-cols-1 = minmax(0, 1fr): an implicit auto column grew to the cards'
                                    content width on phones, pushing Join past the section edge. */}
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                    {group.items.map((session) => (
                                        <ScheduleSessionCard
                                            key={session.session_id}
                                            session={session}
                                            role={role}
                                            timeZoneLabel={timeZoneLabel}
                                            onOpenProfile={onOpenProfile}
                                            onRespond={openApprovals}
                                            onReschedule={when === "upcoming" ? startReschedule : undefined}
                                            now={now}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {hiddenPast && (
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <p className="text-xs text-gray-500">
                            Showing your {loadedPast} most recent of {past.data?.total} sessions.
                        </p>
                        {canShowMore && (
                            <button
                                type="button"
                                onClick={() => setPastSize((size) => Math.min(size + PAST_STEP, MAX_PAGE_SIZE))}
                                disabled={past.isFetching}
                                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50 cursor-pointer disabled:opacity-60"
                            >
                                {past.isFetching ? "Loading…" : "Show more"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MyScheduleSection;
