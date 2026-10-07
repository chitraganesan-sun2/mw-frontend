"use client";
import { useMemo, useRef } from "react";
import AsyncSelect from "react-select/async";
import type { StylesConfig } from "react-select";
import { BiCaretDown } from "react-icons/bi";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { customStyles } from "@/components/common/Input/Select/helper";
import { joinNames } from "@/utils/joinNames";

export interface CounterpartOption {
    value: string;
    label: string;
}

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

function toOptions(kind: "volunteer" | "learner", items: any[]): CounterpartOption[] {
    const rows = items
        .map((item) => {
            const value = kind === "volunteer" ? item?.volunteer_id : item?.learner_id;
            const name =
                kind === "volunteer"
                    ? joinNames(item?.volunteer_first_name, item?.volunteer_last_name)
                    : joinNames(
                          item?.learner_personal_info?.learner_first_name,
                          item?.learner_personal_info?.learner_last_name
                      );
            // What they teach / want to learn - only used to tell apart people with the same
            // name (everyone listed is already same-country, so country wouldn't help).
            const topics: string[] = (
                kind === "volunteer"
                    ? [...(item?.volunteer_subjects || []), ...(item?.volunteer_skills || [])]
                    : item?.skills || []
            )
                // Skip the onboarding "None" chip (id "__none__") - not a topic.
                .filter((s: any) => (s?.subject_id ?? s?.skill_id) !== "__none__")
                .map((s: any) => s?.subject_name ?? s?.skill_name)
                .filter(Boolean);
            return value ? { value: String(value), name: name || "Unnamed", topics } : null;
        })
        .filter(Boolean) as { value: string; name: string; topics: string[] }[];
    const counts = rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.name] = (acc[r.name] ?? 0) + 1;
        return acc;
    }, {});
    return rows.map((r) => ({
        value: r.value,
        label: counts[r.name] > 1 && r.topics.length ? `${r.name} (${r.topics.slice(0, 2).join(", ")})` : r.name,
    }));
}

/**
 * Searchable picker for the other participant of a scheduled session. Queries the backend
 * (`?query=` + paging) as the user types instead of loading one unpaginated page - the old
 * dropdown only ever held the first 50 people and its search box couldn't reach the rest.
 */
export default function CounterpartSelect({
    kind,
    name,
    label,
    value,
    onChange,
    disabled,
    error,
    placeholder,
}: {
    /** Who is listed: volunteers (learner booking) or learners (volunteer proposing). */
    kind: "volunteer" | "learner";
    name: string;
    label: string;
    value: CounterpartOption | null;
    onChange: (option: CounterpartOption | null) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadOptions = useMemo(() => {
        const fetchPage = async (input: string) => {
            const base = kind === "volunteer" ? endpoints.volunteer.getAllVolunteers : endpoints.learner.getAllLearners;
            const query = input.trim();
            const res: any = await GET_API(
                `${base}?page=1&size=${PAGE_SIZE}${query ? `&query=${encodeURIComponent(query)}` : ""}`
            );
            return toOptions(kind, res?.data?.items || []);
        };
        return (input: string) =>
            new Promise<CounterpartOption[]>((resolve) => {
                if (timer.current) clearTimeout(timer.current);
                timer.current = setTimeout(
                    () => fetchPage(input).then(resolve).catch(() => resolve([])),
                    input ? SEARCH_DEBOUNCE_MS : 0
                );
            });
    }, [kind]);

    return (
        <div className="mb-1 lg:mb-2 w-full h-auto flex flex-col gap-2">
            <label htmlFor={name} className="text-[16px] md:text-sm font-normal text-gray-700">
                {label}
                <span className="text-red-500">&nbsp;*</span>
            </label>
            <AsyncSelect<CounterpartOption>
                inputId={name}
                // Stable id - react-select's auto ids differ between server and client renders.
                instanceId={name}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={value}
                onChange={(option) => onChange(option ?? null)}
                isDisabled={disabled}
                isClearable={!disabled}
                placeholder={placeholder || "Type a name to search"}
                classNamePrefix="select"
                loadingMessage={() => "Searching…"}
                noOptionsMessage={({ inputValue }) => (inputValue ? "No one found" : "Type a name to search")}
                aria-invalid={Boolean(error)}
                styles={customStyles as StylesConfig<CounterpartOption, false>}
                components={{
                    DropdownIndicator: () => <BiCaretDown className="text-black mr-1" />,
                    IndicatorSeparator: () => null,
                }}
            />
            {error && (
                <p role="alert" className="text-xs text-red-700 first-letter:uppercase font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
