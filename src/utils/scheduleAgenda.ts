/**
 * Pure logic behind the My Schedule agenda: one list of everything the viewer has scheduled
 * (sessions, instant sessions, WingTimes) grouped by date. No React and no app imports, so it is
 * unit-tested directly (tests/unit/scheduleAgenda.test.ts).
 *
 * Every item carries its start as "YYYY-MM-DD" + "HH:mm" in the VIEWER's time zone - the caller
 * does that conversion once, so grouping ("Today", "This week") and sorting never mix zones.
 */
import dayjs from "dayjs";

export type AgendaKind = "session" | "instant" | "wingtime";
export type AgendaFilter = "all" | AgendaKind;
export type AgendaWhen = "upcoming" | "past";

export interface AgendaEntry<T = unknown> {
    /** Unique across kinds ("session:<id>", "wingtime:<id>", "instant:<id>"). */
    key: string;
    kind: AgendaKind;
    /** Start date / time in the viewer's zone. */
    date: string;
    time: string;
    /** A request from someone else that is waiting for the viewer - shown first when upcoming. */
    needsResponse: boolean;
    /** The status the card's pill shows (the status filter is built from these). */
    status: string;
    /** The pill's words, so the filter dropdown reads exactly like the cards. */
    statusLabel: string;
    /** Lower-cased text the search box matches against. */
    searchText: string;
    /** The original record, rendered by the matching card. */
    data: T;
}

export const AGENDA_KIND_LABEL: Record<AgendaKind, string> = {
    session: "Session",
    instant: "Instant",
    wingtime: "WingTime",
};

/** Chip labels - plural, as they read in "All / Sessions / Instant / WingTimes". */
export const AGENDA_FILTER_LABEL: Record<AgendaFilter, string> = {
    all: "All",
    session: "Sessions",
    instant: "Instant",
    wingtime: "WingTimes",
};

const sortKey = (e: Pick<AgendaEntry, "date" | "time">) => `${e.date || "9999-12-31"} ${e.time || "00:00"}`;

/** Upcoming: soonest first. Past: most recent first. Ties keep a stable order by key. */
export function sortAgenda<T>(entries: AgendaEntry<T>[], when: AgendaWhen): AgendaEntry<T>[] {
    const dir = when === "upcoming" ? 1 : -1;
    return [...entries].sort((a, b) => {
        const diff = sortKey(a).localeCompare(sortKey(b));
        return diff !== 0 ? diff * dir : a.key.localeCompare(b.key);
    });
}

export interface AgendaGroup<T = unknown> {
    key: string;
    label: string;
    accent?: boolean;
    items: AgendaEntry<T>[];
}

/**
 * Date groups so the next thing is easy to spot. Upcoming: requests waiting for the viewer first,
 * then Today / Tomorrow / This week / Next week / Later. Past: Today / Yesterday / Earlier this
 * week / Earlier this month / Older, with cancelled or declined items that were scheduled for a
 * LATER date kept together. `today` is the viewer's "today" (YYYY-MM-DD) in their profile zone.
 * Input order is kept inside each group - sort first with sortAgenda.
 */
export function groupAgenda<T>(entries: AgendaEntry<T>[], when: AgendaWhen, today: string): AgendaGroup<T>[] {
    const groups: AgendaGroup<T>[] = [];
    const add = (key: string, label: string, entry: AgendaEntry<T>, accent = false) => {
        let group = groups.find((g) => g.key === key);
        if (!group) {
            group = { key, label, accent, items: [] };
            groups.push(group);
        }
        group.items.push(entry);
    };
    const base = dayjs(today);
    entries.forEach((entry) => {
        if (when === "upcoming" && entry.needsResponse) {
            add("respond", "Needs your response", entry, true);
            return;
        }
        const diff = entry.date && base.isValid() ? dayjs(entry.date).diff(base, "day") : 0;
        if (when === "upcoming") {
            if (diff <= 0) add("today", "Today", entry);
            else if (diff === 1) add("tomorrow", "Tomorrow", entry);
            else if (diff <= 6) add("week", "This week", entry);
            else if (diff <= 13) add("next", "Next week", entry);
            else add("later", "Later", entry);
        } else if (diff > 0) {
            add("cancelled-later", "Cancelled or declined", entry);
        } else if (diff === 0) add("today", "Today", entry);
        else if (diff === -1) add("yesterday", "Yesterday", entry);
        else if (diff >= -6) add("week", "Earlier this week", entry);
        else if (diff >= -30) add("month", "Earlier this month", entry);
        else add("older", "Older", entry);
    });
    // Groups are created in the order their first item turns up, so a waiting request that sorts
    // behind today's items would otherwise land mid-list. It always leads.
    const respond = groups.findIndex((g) => g.key === "respond");
    if (respond > 0) groups.unshift(...groups.splice(respond, 1));
    return groups;
}

export interface AgendaFilters {
    kind: AgendaFilter;
    /** "all" or one displayed status. */
    status: string;
    search: string;
}

export function filterAgenda<T>(entries: AgendaEntry<T>[], { kind, status, search }: AgendaFilters): AgendaEntry<T>[] {
    const needle = search.trim().toLowerCase();
    return entries.filter((e) => {
        if (kind !== "all" && e.kind !== kind) return false;
        if (status !== "all" && e.status !== status) return false;
        return !needle || e.searchText.includes(needle);
    });
}

/** How many entries of each kind (for the chip counts). */
export function countByKind(entries: Pick<AgendaEntry, "kind">[]): Record<AgendaFilter, number> {
    const counts: Record<AgendaFilter, number> = { all: entries.length, session: 0, instant: 0, wingtime: 0 };
    entries.forEach((e) => {
        counts[e.kind] += 1;
    });
    return counts;
}

/** The distinct displayed statuses present, for the status dropdown (first-seen order). */
export function statusOptions(entries: Pick<AgendaEntry, "status" | "statusLabel">[]): { value: string; label: string }[] {
    const seen = new Map<string, string>();
    entries.forEach((e) => {
        if (e.status && !seen.has(e.status)) seen.set(e.status, e.statusLabel || e.status);
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
}
