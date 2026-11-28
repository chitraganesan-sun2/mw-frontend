"use client";
import { useId } from "react";
import { statusViewOptions, type StatusFilterValue } from "@/utils/statusView";

interface StatusFilterProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    /** The choices. Defaults to Upcoming / Completed / Cancelled (with "All" in front when `withAll`). */
    options?: { value: T; label: string }[];
    /** Adds an "All" option in front of the default choices (the Instant Sessions lists). */
    withAll?: boolean;
    /** Optional per-option suffix, e.g. a count: `{ upcoming: "26" }` renders "Upcoming (26)". */
    counts?: Partial<Record<string, string | number>>;
    className?: string;
}

/** A small "Status  [Upcoming v]" filter that sits at the top right of a list. */
export default function StatusFilter<T extends string = StatusFilterValue>({
    value,
    onChange,
    options,
    withAll = false,
    counts,
    className = "",
}: StatusFilterProps<T>) {
    const id = useId();
    const choices = options ?? (statusViewOptions(withAll) as unknown as { value: T; label: string }[]);
    return (
        <div className={`flex shrink-0 items-center gap-2 ${className}`}>
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                Status
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 cursor-pointer"
            >
                {choices.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                        {counts?.[o.value] !== undefined ? ` (${counts[o.value]})` : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}
