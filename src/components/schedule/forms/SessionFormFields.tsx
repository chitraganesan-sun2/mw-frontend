"use client";
/**
 * Shared fields for every session form (learner + volunteer, instant + scheduled), so all
 * four forms use the same labels, the same order and the same controls:
 *
 *   [Select Volunteer / Select Learner]  (scheduled only)
 *   Category -> Skill (exactly one) -> Level (instant only)
 *   [Session Title]                       (scheduled only; instant sessions are auto-titled)
 *   Session Details & Expectations *
 *   Date -> Start Time / Available Slots -> Duration
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { Input } from "@/components/common/Input";
import { showToast } from "@/components/common/Toast";
import { formatSessionDate } from "@/utils/sessionDisplay";

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

const labelClass = "text-base font-medium text-[#121212]";
const pillClass = (selected: boolean) =>
    `py-2.5 px-2 rounded-xl border text-center text-sm font-medium transition-colors cursor-pointer ${
        selected ? "border-action bg-action text-white" : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
    }`;

function FieldError({ id, message }: { id: string; message?: string | null }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-sm text-red-700">
            {message}
        </p>
    );
}

/** Accessible single-choice pill group (radio semantics). */
function PillGroup<T extends string | number>({
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
    return (
        <PillGroup
            name="session-category"
            label={SESSION_FIELD_LABELS.category}
            columns={2}
            value={value || null}
            onChange={onChange}
            error={error}
            options={CATEGORY_OPTIONS.map((o) => ({ ...o, disabled: available ? !available.includes(o.value) : false }))}
        />
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
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string | null;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="session-details" className={labelClass}>
                {SESSION_FIELD_LABELS.details} <span aria-hidden="true">*</span>
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
