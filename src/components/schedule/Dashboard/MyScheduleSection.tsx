"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import PageIntro from "@/components/common/PageIntro";
import WingTimeCard from "@/components/wingtime/WingTimeCard";
import { HELP } from "@/constants/copy";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { useApprovalDrawer } from "@/hooks/schedule/useApprovalDrawer";
import { useScheduleAgenda } from "@/hooks/schedule/useScheduleAgenda";
import { useStartReschedule } from "@/hooks/schedule/useStartReschedule";
import { useNow, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";
import {
    AGENDA_FILTER_LABEL,
    countByKind,
    filterAgenda,
    groupAgenda,
    sortAgenda,
    statusOptions,
    type AgendaFilter,
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

/**
 * My Schedule: one agenda of everything the viewer has scheduled - regular sessions, instant
 * sessions (incl. ones still waiting for the other person) and WingTimes - grouped by date, with
 * a type tag and a status pill on every card. Upcoming / Past toggle; filter by type, status
 * and search.
 */
const MyScheduleSection: React.FC<MyScheduleSectionProps> = ({ role, timeZoneLabel, onOpenProfile }) => {
    const router = useRouter();
    const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
    const [kind, setKind] = useState<AgendaFilter>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const startReschedule = useStartReschedule(role);
    const openApprovals = useApprovalDrawer((state) => state.open);
    // Re-evaluated every minute so Join appears/disappears without a reload.
    const now = useNow();
    const today = useProfileToday(role);

    const { entries, sessions: active, upcomingSessions, extras } = useScheduleAgenda(role, when, timeZoneLabel, today, now);

    const sorted = useMemo(() => sortAgenda(entries, when), [entries, when]);
    const counts = useMemo(() => countByKind(sorted), [sorted]);
    const statuses = useMemo(() => statusOptions(sorted), [sorted]);
    // A status that no longer exists (e.g. after switching Upcoming/Past) falls back to "all".
    useEffect(() => {
        if (statusFilter !== "all" && !statuses.some((s) => s.value === statusFilter)) setStatusFilter("all");
    }, [statusFilter, statuses]);

    const isFiltering = search.trim() !== "" || statusFilter !== "all" || kind !== "all";
    const filtered = useMemo(() => filterAgenda(sorted, { kind, status: statusFilter, search }), [sorted, kind, statusFilter, search]);
    const groups = useMemo(() => groupAgenda(filtered, when, today), [filtered, when, today]);

    const nextSession = useMemo(
        () => (when === "upcoming" ? findNextSession(upcomingSessions.data?.items || [], role, timeZoneLabel, now) : null),
        [when, upcomingSessions.data, role, timeZoneLabel, now]
    );

    const loadedCount = active.data?.items.length ?? 0;
    const totalCount = active.data?.total ?? 0;
    // More sessions exist than the pages loaded so far.
    const hasHidden = totalCount > loadedCount;
    const canShowMore = hasHidden && Boolean(active.hasNextPage);
    const showFilters = sorted.length >= 4 || isFiltering;
    const visibleFilters = FILTERS.filter((f) => f !== "wingtime" || WINGTIME_ENABLED);

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setKind("all");
    };

    return (
        <section aria-labelledby="my-schedule-heading" className="bg-white rounded-xl p-4 flex flex-col gap-3 min-w-0">
            {/* Heading centered, Upcoming/Past toggle at the right (stacked and centered on phones). */}
            <div className="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr]">
                <span aria-hidden="true" className="hidden sm:block" />
                <h2 id="my-schedule-heading" className="text-lg font-medium text-center">
                    {SCHEDULE_LABELS.mySchedule}
                </h2>
                <div role="group" aria-label="Show schedule" className="inline-flex rounded-full border border-gray-200 p-0.5 text-xs sm:justify-self-end">
                    {(["upcoming", "past"] as const).map((w) => (
                        <button
                            key={w}
                            type="button"
                            aria-pressed={when === w}
                            onClick={() => {
                                setWhen(w);
                                resetFilters();
                            }}
                            className={`rounded-full px-3 py-1 font-medium capitalize ${when === w ? "bg-action text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            <PageIntro className="text-center">{HELP.mySessions}</PageIntro>

            {nextSession && <NextSessionBanner session={nextSession} role={role} timeZoneLabel={timeZoneLabel} now={now} />}

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                {/* Type chips, with how many of each are loaded. */}
                {(sorted.length > 0 || kind !== "all") && (
                    <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
                        {visibleFilters.map((f) => (
                            <button
                                key={f}
                                type="button"
                                aria-pressed={kind === f}
                                onClick={() => setKind(f)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium cursor-pointer ${
                                    kind === f
                                        ? "border-transparent bg-action text-white"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {AGENDA_FILTER_LABEL[f]} <span className={kind === f ? "opacity-90" : "text-gray-500"}>({counts[f]})</span>
                            </button>
                        ))}
                    </div>
                )}

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
                        ) : when === "past" ? (
                            <p className="text-sm text-gray-600">Nothing in your past schedule yet.</p>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">Nothing scheduled yet.</p>
                                <p className="text-xs text-gray-500">
                                    {role === "learner" ? (
                                        <>
                                            Try <Link className="underline" href="/learner/book-for-later">Book for Later</Link>,{" "}
                                            <Link className="underline" href="/learner/instant-sessions">Instant Sessions</Link>
                                            {WINGTIME_ENABLED && (
                                                <>
                                                    {" "}or <Link className="underline" href="/learner/wingtime">WingTime</Link>
                                                </>
                                            )}
                                            .
                                        </>
                                    ) : (
                                        <>
                                            Post an <Link className="underline" href="/volunteer/instant-sessions">Instant Session</Link>
                                            {WINGTIME_ENABLED && (
                                                <>
                                                    {" "}or propose a <Link className="underline" href="/volunteer/wingtime">WingTime</Link>
                                                </>
                                            )}
                                            , or add{" "}
                                            <Link className="underline" href="/volunteer/book-for-later">availability</Link>.
                                        </>
                                    )}
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
                                ? `Showing your ${loadedCount} most recent of ${totalCount} sessions.`
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
        </section>
    );
};

export default MyScheduleSection;
