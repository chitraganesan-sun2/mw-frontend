"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { useScheduleSessions, type ScheduleSession } from "@/hooks/schedule/useScheduleSessions";
import { useApprovalDrawer } from "@/hooks/schedule/useApprovalDrawer";
import { useNow } from "@/hooks/schedule/useProfileTimeZone";
import ScheduleSessionCard from "./ScheduleSessionCard";
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

const MyScheduleSection: React.FC<MyScheduleSectionProps> = ({ role, timeZoneLabel, onOpenProfile }) => {
    const [activeTab, setActiveTab] = useState<ScheduleTab>("posted");
    const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
    const tabRefs = useRef<Record<ScheduleTab, HTMLButtonElement | null>>({ posted: null, accepted: null, direct: null });

    const openApprovals = useApprovalDrawer((state) => state.open);
    // Re-evaluated every minute so Join appears/disappears without a reload.
    const now = useNow();

    const upcoming = useScheduleSessions(role, "upcoming");
    const past = useScheduleSessions(role, "past", when === "past");
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

    const sessions = byTab[activeTab];
    const hiddenPast = when === "past" && (past.data?.total ?? 0) > (past.data?.items.length ?? 0);

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
                            onClick={() => setWhen(w)}
                            className={`rounded-full px-3 py-1 font-medium capitalize ${when === w ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            <div role="tablist" aria-label={SCHEDULE_LABELS.mySchedule} className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                {TABS.map((tab) => {
                    const selected = tab === activeTab;
                    const count = active.data ? byTab[tab].length : null;
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
                            {SCHEDULE_TAB_LABELS[role][tab]}
                            {count !== null && <span className={`ml-1 ${selected ? "text-gray-300" : "text-gray-500"}`}>({count})</span>}
                        </button>
                    );
                })}
            </div>

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
                    <p className="text-sm text-gray-600 py-2">
                        {when === "past" ? "No past sessions here yet." : SCHEDULE_TAB_EMPTY[role][activeTab]}
                    </p>
                ) : (
                    // grid-cols-1 = minmax(0, 1fr): an implicit auto column grew to the cards'
                    // content width on phones, pushing Join past the section edge.
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {sessions.map((session) => (
                            <ScheduleSessionCard
                                key={session.session_id}
                                session={session}
                                role={role}
                                timeZoneLabel={timeZoneLabel}
                                onOpenProfile={onOpenProfile}
                                onRespond={openApprovals}
                                now={now}
                            />
                        ))}
                    </div>
                )}
                {hiddenPast && (
                    <p className="text-xs text-gray-500">Showing your {past.data?.items.length} most recent sessions.</p>
                )}
            </div>
        </section>
    );
};

export default MyScheduleSection;
