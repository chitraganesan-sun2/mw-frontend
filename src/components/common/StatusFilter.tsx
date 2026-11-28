"use client";
import { useId } from "react";
import { statusViewOptions, type StatusFilterValue } from "@/utils/statusView";

interface StatusFilterProps {
    value: StatusFilterValue;
    onChange: (value: StatusFilterValue) => void;
    /** Adds an "All" option in front (the Instant Sessions lists). My Schedule has no "All". */
    withAll?: boolean;
    /** Optional per-option suffix, e.g. a count: `{ upcoming: "26" }` renders "Upcoming (26)". */
    counts?: Partial<Record<StatusFilterValue, string | number>>;
    className?: string;
}

/** A small "Status  [Upcoming v]" filter that sits at the top right of a list. */
export default function StatusFilter({ value, onChange, withAll = false, counts, className = "" }: StatusFilterProps) {
    const id = useId();
    return (
        <div className={`flex shrink-0 items-center gap-2 ${className}`}>
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                Status
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value as StatusFilterValue)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 cursor-pointer"
            >
                {statusViewOptions(withAll).map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                        {counts?.[o.value] !== undefined ? ` (${counts[o.value]})` : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}
