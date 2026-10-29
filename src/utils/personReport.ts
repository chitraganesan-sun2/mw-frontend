export type PersonReportType = "user" | "message" | "session";

export type PersonReportReason = {
    value: string;
    label: string;
    /** Only offered for these report types (all types when omitted). */
    onlyFor?: PersonReportType[];
};

export const PERSON_REPORT_REASONS: PersonReportReason[] = [
    { value: "unsafe_behavior", label: "Unsafe or inappropriate behavior" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "personal_info", label: "Asked for personal details or to talk outside MelodyWings" },
    { value: "no_show", label: "Didn't show up or acted unprofessionally", onlyFor: ["session"] },
    { value: "other", label: "Something else" },
];

// Matches the backend's report_description max_length (5000), leaving room for the reason label.
export const REPORT_DETAILS_MAX_LENGTH = 4500;

export function reasonsFor(type: PersonReportType): PersonReportReason[] {
    return PERSON_REPORT_REASONS.filter((r) => !r.onlyFor || r.onlyFor.includes(type));
}

/** An error message for the form, or null when it can be submitted. */
export function validateReport(type: PersonReportType, reason: string, details: string): string | null {
    if (!reasonsFor(type).some((r) => r.value === reason)) return "Please choose a reason for your report.";
    if (reason === "other" && !details.trim()) return "Please tell us what happened.";
    return null;
}

/** What moderators read: the reason, plus anything the reporter added. */
export function buildReportDescription(type: PersonReportType, reason: string, details: string): string {
    const label = reasonsFor(type).find((r) => r.value === reason)?.label ?? reason;
    const extra = details.trim().slice(0, REPORT_DETAILS_MAX_LENGTH);
    return extra ? `${label} - ${extra}` : label;
}
