"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { shortTimeZone } from "@/utils/sessionDisplay";
import { useProfileToday } from "@/hooks/schedule/useProfileTimeZone";

const MAX_TAGS = 5;
const inputClass =
    "w-full rounded-xl border border-gray-300 px-3 py-3 text-base text-gray-900 outline-none focus:border-black";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProposed: () => void;
    /** The host's profile time zone label - the date and time are entered in it. */
    tzLabel?: string | null;
}

type Errors = Partial<Record<"topic" | "description" | "date" | "time" | "materials" | "capacity" | "tags", string>>;

function Field({
    id,
    label,
    error,
    hint,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-base font-medium text-[#121212]">
                {label}
            </label>
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="text-xs text-gray-600">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function ProposeWingTimeModal({ isOpen, onClose, onProposed, tzLabel }: Props) {
    const today = useProfileToday("volunteer");
    const tomorrow = dayjs(today).add(1, "day").format("YYYY-MM-DD");

    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [needsMaterials, setNeedsMaterials] = useState(false);
    const [materials, setMaterials] = useState("");
    const [capacity, setCapacity] = useState("10");
    const [tagsText, setTagsText] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);

    const reset = () => {
        setTopic("");
        setDescription("");
        setDate("");
        setTime("");
        setNeedsMaterials(false);
        setMaterials("");
        setCapacity("10");
        setTagsText("");
        setErrors({});
    };
    const close = () => {
        if (submitting) return;
        reset();
        onClose();
    };

    const tags = Array.from(new Set(tagsText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)));

    const validate = (): Errors => {
        const e: Errors = {};
        if (!topic.trim()) e.topic = "Enter a topic.";
        if (!description.trim()) e.description = "Describe what you'll do.";
        if (!date) e.date = "Choose a date.";
        else if (date < tomorrow) e.date = "Choose tomorrow or a later date - a WingTime needs at least 24 hours' notice.";
        if (!time) e.time = "Choose a start time.";
        if (needsMaterials && !materials.trim()) e.materials = "List the materials, or choose “No materials needed”.";
        const cap = Number(capacity);
        if (!Number.isInteger(cap) || cap < 1 || cap > 50) e.capacity = "Enter a whole number from 1 to 50.";
        if (tags.length > MAX_TAGS) e.tags = `Use at most ${MAX_TAGS} topics.`;
        if (tags.some((t) => t.length > 30)) e.tags = "Each topic must be 30 characters or fewer.";
        return e;
    };

    const submit = async () => {
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length) return;
        setSubmitting(true);
        try {
            await POST_API(endpoints.wingtime.base, {
                topic: topic.trim(),
                description: description.trim(),
                date,
                start_time: time,
                materials: needsMaterials ? materials.trim() : "None",
                capacity: Number(capacity),
                tags,
            });
            showToast({ message: "Your WingTime was sent for approval. We'll let you know once it's reviewed.", type: "success" });
            reset();
            onProposed();
            onClose();
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't send your WingTime. Please try again."), type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const described = (id: string, hasHint = false) =>
        errors[id as keyof Errors] ? `${id}-error` : hasHint ? `${id}-hint` : undefined;
    const zoneNote = tzLabel ? ` (${shortTimeZone(tzLabel, date || tomorrow)})` : "";

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={close}
            title="Propose a WingTime"
            topContent={
                <p className="text-sm text-gray-500 font-normal !mt-0">
                    A fun 30-minute group session. An admin reviews it before learners can see it.
                </p>
            }
            width={580}
            hideFooter={true}
            rootClassName="!rounded-3xl overflow-hidden"
            headerClassName="!px-6 !py-5"
            bodyClassName="!px-6 !py-[20px]"
        >
            <div className="flex flex-col gap-5">
                <Field id="wt-topic" label="Topic *" error={errors.topic}>
                    <input
                        id="wt-topic"
                        value={topic}
                        maxLength={120}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Make pancakes together"
                        aria-invalid={Boolean(errors.topic)}
                        aria-describedby={described("topic")}
                        className={inputClass}
                    />
                </Field>

                <Field id="wt-description" label="Session description *" error={errors.description} hint={`${description.length}/2000`}>
                    <textarea
                        id="wt-description"
                        value={description}
                        maxLength={2000}
                        rows={4}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What will you do? What should learners expect?"
                        aria-invalid={Boolean(errors.description)}
                        aria-describedby={described("description", true)}
                        className={inputClass}
                    />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="wt-date" label="Date *" error={errors.date}>
                        <input
                            id="wt-date"
                            type="date"
                            value={date}
                            min={tomorrow}
                            onChange={(e) => setDate(e.target.value)}
                            aria-invalid={Boolean(errors.date)}
                            aria-describedby={described("date")}
                            className={inputClass}
                        />
                    </Field>
                    <Field id="wt-time" label={`Start time${zoneNote} *`} error={errors.time} hint="Sessions last 30 minutes.">
                        <input
                            id="wt-time"
                            type="time"
                            step={300}
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            aria-invalid={Boolean(errors.time)}
                            aria-describedby={described("time", true)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <fieldset className="flex flex-col gap-2">
                    <legend className="text-base font-medium text-[#121212] mb-1">Materials</legend>
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                        <input type="radio" name="wt-materials" checked={!needsMaterials} onChange={() => setNeedsMaterials(false)} />
                        No materials needed
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                        <input type="radio" name="wt-materials" checked={needsMaterials} onChange={() => setNeedsMaterials(true)} />
                        Materials needed
                    </label>
                    {needsMaterials && (
                        <>
                            <input
                                id="wt-materials"
                                aria-label="Materials needed"
                                value={materials}
                                maxLength={500}
                                onChange={(e) => setMaterials(e.target.value)}
                                placeholder="e.g. A pan, flour, eggs"
                                aria-invalid={Boolean(errors.materials)}
                                aria-describedby={described("materials")}
                                className={inputClass}
                            />
                            {errors.materials && (
                                <p id="materials-error" role="alert" className="text-sm text-red-700">
                                    {errors.materials}
                                </p>
                            )}
                        </>
                    )}
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="wt-capacity" label="Maximum learners" error={errors.capacity}>
                        <input
                            id="wt-capacity"
                            type="number"
                            min={1}
                            max={50}
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            aria-invalid={Boolean(errors.capacity)}
                            aria-describedby={described("capacity")}
                            className={inputClass}
                        />
                    </Field>
                    <Field id="wt-tags" label="Topics (optional)" error={errors.tags} hint="Separate with commas, e.g. music, cooking">
                        <input
                            id="wt-tags"
                            value={tagsText}
                            onChange={(e) => setTagsText(e.target.value)}
                            aria-invalid={Boolean(errors.tags)}
                            aria-describedby={described("tags", true)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={close}
                        disabled={submitting}
                        className="btn-secondary-outline flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={submitting}
                        className="btn-primary-fill flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        {submitting ? "Sending..." : "Send for approval"}
                    </button>
                </div>
            </div>
        </CenterModal>
    );
}
