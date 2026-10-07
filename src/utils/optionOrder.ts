/**
 * One ordering rule for dropdown options whose order isn't meaningful on its own (lookup
 * lists from the backend, a volunteer's skills, ...): alphabetical, with the catch-all
 * answers ("Other", "None", "N/A", ...) pinned to the end in that order.
 *
 * Lists with a natural order (grades, durations, levels, age groups, statuses, time zones)
 * are kept in their own order and must not be passed through this.
 */
const TRAILING_LABELS = ["other", "others", "none", "n/a", "not specified", "prefer not to say"];

function trailingRank(label: string): number {
    const index = TRAILING_LABELS.indexOf(label.trim().toLowerCase());
    return index === -1 ? -1 : index;
}

export function compareOptionLabels(a?: string | null, b?: string | null): number {
    const left = String(a ?? "");
    const right = String(b ?? "");
    const rankA = trailingRank(left);
    const rankB = trailingRank(right);
    if (rankA !== rankB) {
        if (rankA === -1) return -1;
        if (rankB === -1) return 1;
        return rankA - rankB;
    }
    return left.localeCompare(right, undefined, { sensitivity: "base", numeric: true });
}

export function sortByLabel<T>(items: T[], getLabel: (item: T) => string | null | undefined): T[] {
    return [...items].sort((a, b) => compareOptionLabels(getLabel(a), getLabel(b)));
}

/**
 * LOV endpoints whose server order IS the intended order (youngest -> oldest age group,
 * "comfortable with all" -> "not sure"), so AsyncSelect must not re-sort them.
 */
export const SERVER_ORDERED_LOV_ENDPOINTS = new Set(["preferred_learner_age_group", "support_preference"]);
