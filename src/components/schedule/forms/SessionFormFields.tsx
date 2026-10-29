"use client";
/**
 * Shared fields for every session form (learner + volunteer, instant + scheduled), so all
 * four forms use the same labels, the same order and the same controls:
 *
 *   [Select Volunteer / Select Learner]  (scheduled only)
 *   Category -> Skill (exactly one) -> Level (instant only)
 *   [Session Title]                       (scheduled only; instant sessions are auto-titled)
 *   Session Details & Expectations *   (the learner's booking form words it "What do you want to learn?",
 *                                        which also covers what the volunteer should know or prepare)
 *   Date -> Start Time / Available Slots -> Duration   (learner's booking form: one Available Times dropdown)
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { Input } from "@/components/common/Input";
import { showToast } from "@/components/common/Toast";
import { formatSessionDate, formatSessionTime, shortTimeZone } from "@/utils/sessionDisplay";
import { selectedSlotKey, slotOptionKey } from "@/utils/slotOptionKey";
import type { UpcomingSlot } from "@/hooks/schedule/useUpcomingSlots";

export type SessionCategory = "academic" | "non_academic";

export interface PickedSkill {
    skill_id: string;
    skill_name: string;
}

export const SESSION_FIELD_LABELS = {
    category: "Category",
    skill: "Skill",
    gradeLevel: "Grade Level",
    expertiseLevel: "Expertise Level",
    title: "Session Title",
    details: "Session Details & Expectations",
    availability: "Available Times",
    date: "Date",
    startTime: "Start Time",
    slots: "Available Slots",
    duration: "Duration",
} as const;

export const CATEGORY_OPTIONS: { value: SessionCategory; label: string }[] = [
    { value: "academic", label: "Academic" },
    { value: "non_academic", label: "Arts & Life Skills" },
];

export const GRADE_OPTIONS = [
    // Learners can be 5 (the minimum age), so the list starts before Grade 1.
    "Pre-K",
    "Kindergarten",
    ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
    "College",
    "Other",
];

export const EXPERTISE_OPTIONS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
];

export const DURATION_OPTIONS = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hr" },
];

export const DETAILS_MAX_LENGTH = 2000;

export const labelClass = "text-base font-medium text-[#121212]";
export const pillClass = (selected: boolean) =>
    `py-2.5 px-2 rounded-xl border text-center text-sm font-medium transition-colors cursor-pointer ${
        selected ? "border-action bg-action text-white" : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
    }`;

export function FieldError({ id, message }: { id: string; message?: string | null }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-sm text-red-700">
            {message}
        </p>
    );
}

/** Accessible single-choice pill group (radio semantics). */
export function PillGroup<T extends string | number>({
    name,
    label,
    options,
    value,
    onChange,
    columns,
    error,
}: {
    name: string;
    label: string;
    options: { value: T; label: string; disabled?: boolean }[];
    value: T | null | undefined;
    onChange: (value: T) => void;
    columns: number;
    error?: string | null;
}) {
    const gridCols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns] ?? "grid-cols-2";
    return (
        <div className="flex flex-col gap-2">
            <span id={`${name}-label`} className={labelClass}>
                {label} <span aria-hidden="true">*</span>
            </span>
            <div
                role="radiogroup"
                aria-labelledby={`${name}-label`}
                aria-describedby={error ? `${name}-error` : undefined}
                className={`grid ${gridCols} gap-2`}
            >
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        type="button"
                        role="radio"
                        aria-checked={value === opt.value}
                        disabled={opt.disabled}
                        onClick={() => onChange(opt.value)}
                        className={`${pillClass(value === opt.value)} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <FieldError id={`${name}-error`} message={error} />
        </div>
    );
}

export function CategoryField({
    value,
    onChange,
    available,
    error,
}: {
    value: SessionCategory | "";
    onChange: (value: SessionCategory) => void;
    /** Limit to categories that have skills to pick (e.g. a volunteer's profile). */
    available?: SessionCategory[];
    error?: string | null;
}) {
    // A greyed-out pill with no reason looks broken; say why it can't be picked.
    const unavailable = available ? CATEGORY_OPTIONS.filter((o) => !available.includes(o.value)) : [];
    return (
        <div className="flex flex-col gap-2">
            <PillGroup
                name="session-category"
                label={SESSION_FIELD_LABELS.category}
                columns={2}
                value={value || null}
                onChange={onChange}
                error={error}
                options={CATEGORY_OPTIONS.map((o) => ({ ...o, disabled: available ? !available.includes(o.value) : false }))}
            />
            {unavailable.length > 0 && (
                <p className="text-xs text-gray-500">
                    This person doesn&apos;t offer {unavailable.map((o) => o.label).join(" or ")}, so it can&apos;t be picked.
                </p>
            )}
        </div>
    );
}

/**
 * Exactly one skill. Catalog mode (instant sessions): the skills catalog for the category,
 * with "type to add" creating a real catalog skill (POST common/skills). Options mode
 * (scheduled sessions): a fixed list - the volunteer's own subjects / skills.
 */
export function SkillField({
    category,
    value,
    onChange,
    options,
    error,
}: {
    category: SessionCategory | "";
    value: PickedSkill | null;
    onChange: (value: PickedSkill | null) => void;
    options?: string[];
    error?: string | null;
}) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const catalogMode = !options;

    // Same key as other skills pickers, so the catalog is fetched once per category.
    const { data: catalog = [], isLoading } = useQuery({
        queryKey: ["common-skills", category],
        queryFn: async () => {
            const res = await GET_API(endpoints.common(`skills?category=${category}`));
            return (Array.isArray(res?.data) ? res.data : []) as PickedSkill[];
        },
        enabled: catalogMode && Boolean(category),
    });

    if (!category) return null;

    const createSkill = async (name: string) => {
        const skillName = name?.trim();
        if (!skillName) return;
        setIsCreating(true);
        try {
            const res = await POST_API(endpoints.common("skills"), { skill_name: skillName, category });
            const data = res?.data as { skill_id?: string; skill_name?: string } | string;
            const skillId = typeof data === "string" ? data : data?.skill_id;
            onChange({ skill_id: skillId || skillName, skill_name: (typeof data === "object" && data?.skill_name) || skillName });
            queryClient.invalidateQueries({ queryKey: ["common-skills", category] });
        } catch {
            showToast({ message: "Couldn't add that skill. Please pick one from the list.", type: "error" });
        } finally {
            setIsCreating(false);
        }
    };

    const describedBy = error ? "session-skill-error" : undefined;
    return (
        <div className="flex flex-col gap-2" aria-describedby={describedBy}>
            {catalogMode ? (
                <Input
                    name="session_skill"
                    label={SESSION_FIELD_LABELS.skill}
                    required
                    inputType="select-creatable"
                    variant="single"
                    placeholder="Search a skill, or type to add one"
                    value={value ? [value.skill_id] : []}
                    onChange={(id: string | number) => {
                        const found = catalog.find((s) => String(s.skill_id) === String(id));
                        onChange(found ?? null);
                    }}
                    onCreate={(name: string) => createSkill(name)}
                    allowCreate={true}
                    endpoint="skills"
                    isLoading={isLoading || isCreating}
                    options={catalog.map((s) => ({ label: s.skill_name, value: s.skill_id }))}
                    labelClassName="!text-base !font-medium !text-[#121212]"
                    inputClassName="w-full !h-12 !rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!text-base"
                />
            ) : (
                <Input
                    name="session_skill"
                    label={SESSION_FIELD_LABELS.skill}
                    required
                    inputType="select"
                    placeholder="Select a skill"
                    value={value?.skill_name ?? ""}
                    onChange={(name: string | number) =>
                        onChange(name ? { skill_id: String(name), skill_name: String(name) } : null)
                    }
                    options={options.map((name) => ({ label: name, value: name }))}
                    labelClassName="!text-base !font-medium !text-[#121212]"
                    inputClassName="w-full !h-12"
                />
            )}
            <FieldError id="session-skill-error" message={error} />
        </div>
    );
}

export function LevelField({
    category,
    value,
    onChange,
    error,
}: {
    category: SessionCategory | "";
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}) {
    if (!category) return null;
    if (category === "non_academic") {
        return (
            <PillGroup
                name="session-level"
                label={SESSION_FIELD_LABELS.expertiseLevel}
                columns={3}
                value={value || null}
                onChange={onChange}
                error={error}
                options={EXPERTISE_OPTIONS}
            />
        );
    }
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="session-grade-level" className={labelClass}>
                {SESSION_FIELD_LABELS.gradeLevel} <span aria-hidden="true">*</span>
            </label>
            <select
                id="session-grade-level"
                value={value}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "session-level-error" : undefined}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212]"
            >
                <option value="" disabled>
                    Select a grade
                </option>
                {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>
            <FieldError id="session-level-error" message={error} />
        </div>
    );
}

export function SessionDetailsField({
    value,
    onChange,
    placeholder,
    error,
    label = SESSION_FIELD_LABELS.details,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string | null;
    label?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="session-details" className={labelClass}>
                {label} <span aria-hidden="true">*</span>
            </label>
            <textarea
                id="session-details"
                value={value}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "session-details-error" : "session-details-hint"}
                maxLength={DETAILS_MAX_LENGTH}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] resize-none ${
                    error ? "border-red-600" : "border-gray-200"
                }`}
            />
            {error ? (
                <FieldError id="session-details-error" message={error} />
            ) : (
                <p id="session-details-hint" className="text-xs text-gray-500">
                    Required · {value.length}/{DETAILS_MAX_LENGTH}
                </p>
            )}
        </div>
    );
}

export const LEARNER_DETAILS_PLACEHOLDER =
    "Tell us what you want to learn, plus any topics, questions, background information, or materials the volunteer should know about or review before your session.";

/** "October 30, 2026 · 6:00 PM – 6:45 PM EDT" - the zone is the one in effect on that date. */
export function formatSlotOption(slot: UpcomingSlot, timeZoneLabel?: string): string {
    const range = `${formatSessionTime(slot.start_time)} – ${formatSessionTime(slot.end_time)}`;
    const zone = timeZoneLabel ? shortTimeZone(timeZoneLabel, slot.date) : "";
    return `${formatSessionDate(slot.date)} · ${[range, zone].filter(Boolean).join(" ")}`;
}

/**
 * The volunteer's bookable times as one dropdown, replacing the date picker + radio slots.
 * Times are already in the viewer's profile timezone, which the options are labelled with.
 */
export function AvailabilityField({
    slots,
    value,
    selectedDate,
    onChange,
    isLoading,
    isError,
    onRetry,
    timeZoneLabel,
    error,
    unavailableReason,
}: {
    slots: UpcomingSlot[];
    /** volunteer_slot_id of the pick - shared by every date of a weekly slot, so pair it with selectedDate. */
    value: string;
    selectedDate?: string;
    onChange: (slot: UpcomingSlot | null) => void;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    timeZoneLabel?: string;
    error?: string | null;
    /** Set when the volunteer has paused new requests or is at their limit - shown instead of the times. */
    unavailableReason?: string | null;
}) {
    let status: string | null = null;
    if (isLoading) status = "Loading available times...";
    else if (isError) status = "Couldn't load available times.";
    else if (unavailableReason) status = unavailableReason;
    else if (slots.length === 0) status = "This volunteer has no open times in the next few weeks.";
    else if (slots.every((s) => s.conflicts_with_my_schedule))
        status = "All of this volunteer's open times overlap sessions you already have.";

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="session-availability" className={labelClass}>
                {SESSION_FIELD_LABELS.availability} <span aria-hidden="true">*</span>
            </label>
            <select
                id="session-availability"
                value={selectedSlotKey(selectedDate, value)}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "session-availability-error" : status ? "session-availability-status" : undefined}
                disabled={isLoading || isError || slots.length === 0}
                onChange={(e) => onChange(slots.find((s) => slotOptionKey(s) === e.target.value) ?? null)}
                className={`w-full h-12 px-4 border rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                    error ? "border-red-600" : "border-gray-200"
                }`}
            >
                <option value="" disabled>
                    {isLoading ? "Loading..." : "Select a time"}
                </option>
                {slots.map((slot) => (
                    <option key={slotOptionKey(slot)} value={slotOptionKey(slot)} disabled={Boolean(slot.conflicts_with_my_schedule)}>
                        {formatSlotOption(slot, timeZoneLabel)}
                        {slot.conflicts_with_my_schedule ? " (you have a session then)" : ""}
                    </option>
                ))}
            </select>
            {status && (
                <p id="session-availability-status" role="status" className="text-xs text-gray-500">
                    {status}{" "}
                    {isError && (
                        <button type="button" onClick={onRetry} className="underline font-medium text-black">
                            Try again
                        </button>
                    )}
                </p>
            )}
            {!status && !error && (
                <p className="text-xs text-gray-500">
                    Times are shown in your profile timezone.
                </p>
            )}
            <FieldError id="session-availability-error" message={error} />
        </div>
    );
}

/** Instant sessions are for today or tomorrow only - two pills instead of a calendar. */
export function InstantDateField({
    value,
    onChange,
    today,
    tomorrow,
}: {
    value: string;
    onChange: (value: string) => void;
    today: string;
    tomorrow: string;
}) {
    return (
        <PillGroup
            name="session-date"
            label={SESSION_FIELD_LABELS.date}
            columns={2}
            value={value}
            onChange={onChange}
            options={[
                { value: today, label: `Today · ${formatSessionDate(today)}` },
                { value: tomorrow, label: `Tomorrow · ${formatSessionDate(tomorrow)}` },
            ]}
        />
    );
}

export function DurationField({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
    return (
        <PillGroup
            name="session-duration"
            label={SESSION_FIELD_LABELS.duration}
            columns={4}
            value={value}
            onChange={onChange}
            options={DURATION_OPTIONS}
        />
    );
}
