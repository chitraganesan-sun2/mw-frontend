/**
 * The "Status" filter shared by My Schedule and the Instant Sessions lists: every item is in
 * exactly one of Upcoming / Completed / Cancelled. No React and no app imports, so it is
 * unit-tested directly (tests/unit/statusView.test.ts).
 */
export type StatusView = "upcoming" | "completed" | "cancelled";
export type StatusFilterValue = "all" | StatusView;

export const STATUS_VIEW_LABEL: Record<StatusView, string> = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
};

/** Options for the dropdown. `withAll` adds "All" in front (the Instant Sessions lists). */
export function statusViewOptions(withAll: boolean): { value: StatusFilterValue; label: string }[] {
    const views = (Object.keys(STATUS_VIEW_LABEL) as StatusView[]).map((value) => ({ value, label: STATUS_VIEW_LABEL[value] }));
    return withAll ? [{ value: "all", label: "All" }, ...views] : views;
}

/** Statuses that will never take place, whatever their date (same rule as My Schedule's agenda). */
const NEVER_HAPPENS = new Set(["cancelled", "rejected", "declined", "expired"]);

/**
 * Which view a request / instant session belongs to. `ended` = its end time has passed: a session
 * that was arranged and is over counts as Completed, one still waiting for an answer that nobody
 * gave is Expired (the API says so), and anything else is still to come.
 */
export function statusViewOf(status: string | undefined, ended = false): StatusView {
    const s = (status ?? "").toLowerCase();
    if (NEVER_HAPPENS.has(s)) return "cancelled";
    if (s === "completed") return "completed";
    return ended && (s === "accepted" || s === "active" || s === "claimed" || s === "booked") ? "completed" : "upcoming";
}

/** Whether an item in `view` should be listed under the chosen filter. */
export function matchesStatusFilter(filter: StatusFilterValue, view: StatusView): boolean {
    return filter === "all" || filter === view;
}
