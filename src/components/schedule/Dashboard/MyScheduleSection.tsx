"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import PageIntro from "@/components/common/PageIntro";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import { HELP, TERMS } from "@/constants/copy";
import { HiOutlineCalendarDays, HiOutlinePlus } from "react-icons/hi2";
import { CALENDAR_VIEW } from "@/components/schedule/Header";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { useApprovalDrawer } from "@/hooks/schedule/useApprovalDrawer";
import { useScheduleAgenda } from "@/hooks/schedule/useScheduleAgenda";
import { useStartReschedule } from "@/hooks/schedule/useStartReschedule";
import { useNow, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";
import {
    AGENDA_FILTER_LABEL,
    AGENDA_TAB_HINT,
    AGENDA_TAB_LABEL,
    countByKind,
    countByTab,
    filterAgenda,
    groupAgenda,
    sortAgenda,
    statusOptions,
    type AgendaFilter,
    type AgendaTab,
} from "@/utils/scheduleAgenda";
import ScheduleOpenInstantCard from "./ScheduleOpenInstantCard";
import ScheduleSessionCard from "./ScheduleSessionCard";
import ScheduleTypeTag from "./ScheduleTypeTag";
import NextSessionBanner, { findNextSession } from "./NextSessionBanner";
import { SCHEDULE_LABELS, getSessionOriginNote, type ScheduleRole } from "./scheduleCategories";

interface MyScheduleSectionProps {
    role: ScheduleRole;
    timeZoneLabel?: string;
    onOpenProfile: (userId: string) => void;
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

const FILTERS: AgendaFilter[] = ["all", "session", "instant", "wingtime"];
const TABS: AgendaTab[] = ["upcoming", "completed", "cancelled"];

/**
 * My Schedule: the one place for everything the viewer has scheduled - Book for Later sessions,
 * Instant Sessions (incl. ones still waiting for the other person) and WingTimes - as a single
 * agenda grouped by date, with a type tag and a status pill on every card. Three views (Upcoming /
 * Completed / Cancelled); filter by type, status and search. A side panel keeps the next session and
 * anything waiting for a reply in sight whichever view is open.
 */
const MyScheduleSection: React.FC<MyScheduleSectionProps> = ({ role, timeZoneLabel, onOpenProfile }) => {
    const router = useRouter();
    const [tab, setTab] = useState<AgendaTab>("upcoming");
    // The server's two windows: upcoming, and everything that is over (completed, cancelled, declined).
    const when = tab === "upcoming" ? "upcoming" : "past";
    const [kind, setKind] = useState<AgendaFilter>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const startReschedule = useStartReschedule(role);
    const openApprovals = useApprovalDrawer((state) => state.open);
    // Re-evaluated every minute so Join appears/disappears without a reload.
    const now = useNow();
    const today = useProfileToday(role);

    const { entries, sessions: active, upcomingSessions, pastLoaded, pastHasMore, extras } = useScheduleAgenda(
        role,
        tab,
        timeZoneLabel,
        today,
        now
    );

    const tabCounts = useMemo(() => countByTab(entries), [entries]);
    const inTab = useMemo(() => entries.filter((e) => e.tab === tab), [entries, tab]);
    const sorted = useMemo(() => sortAgenda(inTab, when), [inTab, when]);
    const counts = useMemo(() => countByKind(sorted), [sorted]);
    const statuses = useMemo(() => statusOptions(sorted), [sorted]);
    // A status that no longer exists (e.g. after switching Upcoming/Past) falls back to "all".
    useEffect(() => {
        if (statusFilter !== "all" && !statuses.some((s) => s.value === statusFilter)) setStatusFilter("all");
    }, [statusFilter, statuses]);

    const isFiltering = search.trim() !== "" || statusFilter !== "all" || kind !== "all";
    const filtered = useMemo(() => filterAgenda(sorted, { kind, status: statusFilter, search }), [sorted, kind, statusFilter, search]);
    const groups = useMemo(() => groupAgenda(filtered, when, today), [filtered, when, today]);

    // Shown beside every view: what is next and what needs a reply do not depend on the tab.
    const nextSession = useMemo(
        () => findNextSession(upcomingSessions.data?.items || [], role, timeZoneLabel, now),
        [upcomingSessions.data, role, timeZoneLabel, now]
    );

    const loadedCount = active.data?.items.length ?? 0;
    const totalCount = active.data?.total ?? 0;
    // More sessions exist than the pages loaded so far.
    const hasHidden = totalCount > loadedCount;
    const canShowMore = hasHidden && Boolean(active.hasNextPage);
    const showFilters = sorted.length >= 4 || isFiltering;
    const visibleFilters = FILTERS.filter((f) => f !== "wingtime" || WINGTIME_ENABLED);
    // Requests from someone else that are waiting for the viewer (the side panel lists them).
    const awaiting = useMemo(
        () => entries.filter((e) => e.tab === "upcoming" && e.needsResponse && e.data.type === "session"),
        [entries]
    );
    const showTypeFilters = sorted.length > 0 || kind !== "all";
    // The panel always has its links, so the wide layout never changes shape between views.
    const hasPanel = true;

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setKind("all");
    };

    // The same type filter, as chips on narrow screens and a vertical list in the side panel.
    const typeFilter = (layout: "chips" | "list") => (
        <div
            role="group"
            aria-label="Filter by type"
            className={layout === "chips" ? "flex flex-wrap gap-2 lg:hidden" : "flex flex-col gap-1"}
        >
            {visibleFilters.map((f) => (
                <button
                    key={`${layout}-${f}`}
                    type="button"
                    aria-pressed={kind === f}
                    onClick={() => setKind(f)}
                    className={
                        layout === "chips"
                            ? `rounded-full border px-3 py-1 text-xs font-medium cursor-pointer ${
                                  kind === f ? "border-transparent bg-action text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`
                            : `flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer border-0 ${
                                  kind === f ? "bg-action text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
                              }`
                    }
                >
                    <span>{AGENDA_FILTER_LABEL[f]}</span>
                    <span className={kind === f ? "opacity-90" : "text-gray-500"}>{layout === "chips" ? `(${counts[f]})` : counts[f]}</span>
                </button>
            ))}
        </div>
    );

    return (
        <section aria-labelledby="my-schedule-heading" className="bg-white rounded-xl p-4 flex flex-col gap-3 min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 id="my-schedule-heading" className="text-lg font-medium">
                        {SCHEDULE_LABELS.mySchedule}
                    </h2>
                    <PageIntro>{HELP.mySessions}</PageIntro>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Link
                        href={`/${role}/book-a-session`}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-action bg-action px-3 py-1.5 text-sm font-medium text-white hover:bg-action-hover"
                    >
                        <HiOutlinePlus size={16} aria-hidden="true" />
                        {TERMS.bookSession}
                    </Link>
                    <Link
                        href={`/${role}/book-for-later?view=${CALENDAR_VIEW}`}
                        title={HELP.viewCalendar}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50"
                    >
                        <HiOutlineCalendarDays size={16} aria-hidden="true" />
                        {SCHEDULE_LABELS.viewCalendar}
                    </Link>
                </div>
            </div>

            {/* Upcoming / Completed / Cancelled. The past views load the server's past window on first use. */}
            <div role="tablist" aria-label="Show schedule" className="grid grid-cols-3 border-b border-gray-200 sm:flex sm:gap-1">
                {TABS.map((t) => {
                    const known = t === "upcoming" || pastLoaded;
                    const more = (t === "upcoming" ? Boolean(upcomingSessions.hasNextPage) : pastHasMore) ? "+" : "";
                    return (
                        <button
                            key={t}
                            id={`schedule-tab-${t}`}
                            type="button"
                            role="tab"
                            aria-selected={tab === t}
                            aria-controls="schedule-tabpanel"
                            onClick={() => {
                                setTab(t);
                                resetFilters();
                            }}
                            className={`-mb-px border-0 border-b-2 bg-transparent px-2 py-2 text-sm font-medium cursor-pointer whitespace-nowrap sm:px-4 ${
                                tab === t ? "border-b-action text-gray-900" : "border-b-transparent text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {AGENDA_TAB_LABEL[t]}
                            {known && <span className="ml-1 font-normal text-gray-500">({tabCounts[t]}{more})</span>}
                        </button>
                    );
                })}
            </div>
            <PageIntro className="-mt-1">{AGENDA_TAB_HINT[tab]}</PageIntro>

            {/* Wide screens: the agenda on the left, a panel on the right (next up, what needs a
                reply, type filters). Narrower screens: one column, banner and chips on top. */}
            <div
                id="schedule-tabpanel"
                role="tabpanel"
                aria-labelledby={`schedule-tab-${tab}`}
                className={`grid grid-cols-1 gap-4 ${hasPanel ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : ""} lg:items-start`}
            >
            <div className="flex min-w-0 flex-col gap-3">
                {nextSession && (
                    <div className="lg:hidden">
                        <NextSessionBanner session={nextSession} role={role} timeZoneLabel={timeZoneLabel} now={now} />
                    </div>
                )}

                {showTypeFilters && typeFilter("chips")}

                {showFilters && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, person, or subject"
                            aria-label="Search your schedule"
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        />
                        {statuses.length > 1 && (
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="Filter by status"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
                            >
                                <option value="all">All statuses</option>
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Announces the result of a search / filter to screen readers. */}
                <p role="status" aria-live="polite" className="sr-only">
                    {isFiltering ? `${filtered.length} of ${sorted.length} items shown` : ""}
                </p>

                {(extras.wingtimeError || extras.instantError) && (
                    <QueryErrorNotice
                        message={
                            extras.wingtimeError && extras.instantError
                                ? "Couldn't load your WingTimes and instant requests."
                                : extras.wingtimeError
                                  ? "Couldn't load your WingTimes."
                                  : "Couldn't load your instant requests."
                        }
                        onRetry={extras.retry}
                    />
                )}

                {/* isPending, not isLoading: the query stays disabled until the user id is read from
                    the cookie, and a disabled query reports isLoading=false - the empty-state text
                    used to flash before the real list. */}
                {active.isError ? (
                    <QueryErrorNotice message="Couldn't load your schedule." onRetry={() => active.refetch()} />
                ) : active.isPending ? (
                    <SessionListSkeleton rows={3} />
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        {isFiltering ? (
                            <>
                                <p className="text-sm text-gray-600">Nothing matches your filters.</p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-medium text-gray-700 underline bg-transparent border-0 p-0 cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            </>
                        ) : tab !== "upcoming" ? (
                            <p className="text-sm text-gray-600">
                                {tab === "completed" ? "No completed sessions yet." : "Nothing has been cancelled."}
                            </p>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">Nothing scheduled yet.</p>
                                <p className="text-xs text-gray-500">
                                    <Link className="underline" href={`/${role}/book-a-session`}>
                                        {role === "learner" ? "Book a Session" : "Post an Instant Session or plan a session"}
                                    </Link>
                                    {WINGTIME_ENABLED && (
                                        <>
                                            {" "}or {role === "learner" ? "join" : "propose"} a{" "}
                                            <Link className="underline" href={`/${role}/wingtime`}>WingTime</Link>
                                        </>
                                    )}
                                    .
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.key} role="group" aria-labelledby={`schedule-group-${group.key}`} className="flex flex-col gap-2">
                            <h3
                                id={`schedule-group-${group.key}`}
                                className={`text-[11px] font-semibold uppercase tracking-wide ${group.accent ? "text-amber-700" : "text-gray-500"}`}
                            >
                                {group.label} <span className="font-normal">({group.items.length})</span>
                            </h3>
                            {group.items.map((entry) => {
                                const data = entry.data;
                                if (data.type === "session") {
                                    return (
                                        <ScheduleSessionCard
                                            key={entry.key}
                                            session={data.session}
                                            role={role}
                                            timeZoneLabel={timeZoneLabel}
                                            onOpenProfile={onOpenProfile}
                                            onRespond={openApprovals}
                                            onReschedule={when === "upcoming" ? (s) => startReschedule(s) : undefined}
                                            now={now}
                                            typeTag={<ScheduleTypeTag kind={entry.kind} note={getSessionOriginNote(data.session, role)} />}
                                        />
                                    );
                                }
                                if (data.type === "wingtime") {
                                    return (
                                        <WingTimeCard
                                            key={entry.key}
                                            item={data.wingtime}
                                            tzLabel={timeZoneLabel}
                                            onClick={() => router.push(`/${role}/wingtime`)}
                                            typeTag={
                                                <ScheduleTypeTag
                                                    kind="wingtime"
                                                    note={data.wingtime.is_host ? "You're hosting" : "You signed up"}
                                                />
                                            }
                                        />
                                    );
                                }
                                return (
                                    <ScheduleOpenInstantCard
                                        key={entry.key}
                                        row={data.row}
                                        role={role}
                                        timeZoneLabel={timeZoneLabel}
                                        typeTag={<ScheduleTypeTag kind="instant" note={role === "learner" ? "Your request" : "Your posting"} />}
                                    />
                                );
                            })}
                        </div>
                    ))
                )}

                {hasHidden && (
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <p className="text-xs text-gray-500">
                            {when === "past"
                                ? `Showing your ${loadedCount} most recent of ${totalCount} past sessions.`
                                : `Showing your next ${loadedCount} of ${totalCount} upcoming sessions.`}
                        </p>
                        {canShowMore && (
                            <button
                                type="button"
                                onClick={() => active.fetchNextPage()}
                                disabled={active.isFetching}
                                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50 cursor-pointer disabled:opacity-60"
                            >
                                {active.isFetching ? "Loading…" : "Show More"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {hasPanel && (
                <aside aria-label="Schedule summary" className="hidden lg:flex lg:sticky lg:top-3 flex-col gap-3">
                    {nextSession && <NextSessionBanner session={nextSession} role={role} timeZoneLabel={timeZoneLabel} now={now} />}

                    {awaiting.length > 0 && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50/40 p-3">
                            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                                Needs your response ({awaiting.length})
                            </h3>
                            <ul className="mt-1.5 flex flex-col gap-1">
                                {awaiting.slice(0, 3).map((e) => (
                                    <li key={e.key} className="truncate text-sm text-gray-800">
                                        {e.data.type === "session" ? e.data.session.session_title || "Session" : ""}
                                    </li>
                                ))}
                            </ul>
                            {awaiting.length > 3 && <p className="mt-1 text-xs text-gray-500">and {awaiting.length - 3} more</p>}
                            <button
                                type="button"
                                onClick={openApprovals}
                                className="mt-2 rounded-full bg-action px-3 py-1 text-xs font-semibold text-white hover:opacity-90 border-0 cursor-pointer"
                            >
                                Respond
                            </button>
                        </div>
                    )}

                    {showTypeFilters && (
                        <div className="rounded-lg border border-gray-200 p-2">
                            <h3 className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Show</h3>
                            {typeFilter("list")}
                        </div>
                    )}
                </aside>
            )}
            </div>
        </section>
    );
};

export default MyScheduleSection;
