"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { profileTimeZoneIana, shortTimeZone } from "@/utils/sessionDisplay";
import {
    FieldError,
    PillGroup,
    SESSION_FIELD_LABELS,
    SessionDetailsField,
    labelClass,
} from "@/components/schedule/forms/SessionFormFields";
import WingTimeStartTimeField from "@/components/wingtime/WingTimeStartTimeField";

dayjs.extend(utc);
dayjs.extend(timezone);

const MAX_TAGS = 5;
const MIN_NOTICE_HOURS = 3;
const MAX_DAYS_AHEAD = 60;

// Same field styling as the other session forms (SessionFormFields).
const inputClass = (error?: string) =>
    `w-full h-12 px-4 border rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] ${
        error ? "border-red-600" : "border-gray-200"
    }`;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProposed: () => void;
    /** The host's profile time zone label - the date and time are entered in it. */
    tzLabel?: string | null;
}

type Errors = Partial<Record<"topic" | "description" | "date" | "time" | "materials" | "capacity" | "tags", string>>;

export default function ProposeWingTimeModal({ isOpen, onClose, onProposed, tzLabel }: Props) {
    const tzIana = profileTimeZoneIana(tzLabel) || null;
    const nowInTz = tzIana ? dayjs().tz(tzIana) : dayjs();
    // The earliest date a WingTime can start on: 3 hours from now (so late in the evening that is already tomorrow).
    const earliestDate = nowInTz.add(MIN_NOTICE_HOURS, "hour").format("YYYY-MM-DD");

    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    // Opens on the earliest date a WingTime can be proposed for (normally today). Derived rather than
    // stored so it is right whenever the form is opened.
    const [pickedDate, setDate] = useState("");
    const date = pickedDate || earliestDate;
    const [time, setTime] = useState("");
    const [materialsChoice, setMaterialsChoice] = useState<"none" | "needed">("none");
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
        setMaterialsChoice("none");
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
        if (!topic.trim()) e.topic = "Please enter a topic.";
        if (!description.trim()) e.description = "Please describe the session.";
        if (!date) e.date = "Please choose a date.";
        else if (date < earliestDate) e.date = "That date has passed. Please choose today or a later date.";
        if (!time) e.time = "Please choose a start time.";
        if (date && time && !e.date) {
            // The same 3-hour / 60-day rule the server enforces, so the host hears it here first.
            const start = tzIana ? dayjs.tz(`${date}T${time}`, tzIana) : dayjs(`${date}T${time}`);
            if (start.isBefore(dayjs().add(MIN_NOTICE_HOURS, "hour"))) {
                e.time = "A WingTime needs at least 3 hours' notice. Please pick a later time.";
            } else if (start.isAfter(dayjs().add(MAX_DAYS_AHEAD, "day"))) {
                e.date = "A WingTime can be scheduled up to 60 days ahead. Please pick an earlier date.";
            }
        }
        if (materialsChoice === "needed" && !materials.trim()) e.materials = "Please list the materials.";
        const cap = Number(capacity);
        if (!Number.isInteger(cap) || cap < 1 || cap > 50) e.capacity = "Please enter a number from 1 to 50.";
        if (tags.length > MAX_TAGS) e.tags = `Please use at most ${MAX_TAGS} topics.`;
        else if (tags.some((t) => t.length > 30)) e.tags = "Each topic must be 30 characters or fewer.";
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
                materials: materialsChoice === "needed" ? materials.trim() : "None",
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

    const zone = tzLabel ? ` (${shortTimeZone(tzLabel, date || earliestDate)})` : "";

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
                <div className="flex flex-col gap-2">
                    <label htmlFor="wingtime-topic" className={labelClass}>
                        Topic <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="wingtime-topic"
                        value={topic}
                        maxLength={120}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.topic)}
                        aria-describedby={errors.topic ? "wingtime-topic-error" : undefined}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            if (e.target.value.trim()) setErrors((x) => ({ ...x, topic: undefined }));
                        }}
                        placeholder="e.g. Make pancakes together"
                        className={inputClass(errors.topic)}
                    />
                    <FieldError id="wingtime-topic-error" message={errors.topic} />
                </div>

                <SessionDetailsField
                    label="Session Description"
                    value={description}
                    error={errors.description}
                    placeholder="What will you do? What should learners expect?"
                    onChange={(value) => {
                        setDescription(value);
                        if (value.trim()) setErrors((x) => ({ ...x, description: undefined }));
                    }}
                />

                <div className="flex flex-col gap-2">
                    <label htmlFor="wingtime-date" className={labelClass}>
                        {SESSION_FIELD_LABELS.date} <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="wingtime-date"
                        type="date"
                        value={date}
                        min={earliestDate}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={errors.date ? "wingtime-date-error" : undefined}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setErrors((x) => ({ ...x, date: undefined, time: undefined }));
                        }}
                        className={inputClass(errors.date)}
                    />
                    <FieldError id="wingtime-date-error" message={errors.date} />
                </div>

                <WingTimeStartTimeField
                    id="wingtime-start-time"
                    label={`${SESSION_FIELD_LABELS.startTime}${zone}`}
                    date={date}
                    tzIana={tzIana}
                    minNoticeHours={MIN_NOTICE_HOURS}
                    value={time}
                    error={errors.time}
                    onChange={(value) => {
                        setTime(value);
                        setErrors((x) => ({ ...x, time: undefined }));
                    }}
                />
                <p className="-mt-3 text-xs text-gray-500">Sessions last 30 minutes.</p>

                <PillGroup
                    name="wingtime-materials"
                    label="Materials"
                    columns={2}
                    value={materialsChoice}
                    onChange={(value) => {
                        setMaterialsChoice(value);
                        setErrors((x) => ({ ...x, materials: undefined }));
                    }}
                    options={[
                        { value: "none", label: "None Needed" },
                        { value: "needed", label: "Materials Needed" },
                    ]}
                />
                {materialsChoice === "needed" && (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="wingtime-materials-list" className={labelClass}>
                            List the Materials <span aria-hidden="true">*</span>
                        </label>
                        <input
                            id="wingtime-materials-list"
                            value={materials}
                            maxLength={500}
                            required
                            aria-required="true"
                            aria-invalid={Boolean(errors.materials)}
                            aria-describedby={errors.materials ? "wingtime-materials-error" : undefined}
                            onChange={(e) => {
                                setMaterials(e.target.value);
                                if (e.target.value.trim()) setErrors((x) => ({ ...x, materials: undefined }));
                            }}
                            placeholder="e.g. A pan, flour, eggs"
                            className={inputClass(errors.materials)}
                        />
                        <FieldError id="wingtime-materials-error" message={errors.materials} />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label htmlFor="wingtime-capacity" className={labelClass}>
                        Maximum Learners <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="wingtime-capacity"
                        type="number"
                        min={1}
                        max={50}
                        value={capacity}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.capacity)}
                        aria-describedby={errors.capacity ? "wingtime-capacity-error" : undefined}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={inputClass(errors.capacity)}
                    />
                    <FieldError id="wingtime-capacity-error" message={errors.capacity} />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="wingtime-tags" className={labelClass}>
                        Topics (Optional)
                    </label>
                    <input
                        id="wingtime-tags"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="e.g. music, cooking, dance"
                        aria-invalid={Boolean(errors.tags)}
                        aria-describedby={errors.tags ? "wingtime-tags-error" : "wingtime-tags-hint"}
                        className={inputClass(errors.tags)}
                    />
                    {errors.tags ? (
                        <FieldError id="wingtime-tags-error" message={errors.tags} />
                    ) : (
                        <p id="wingtime-tags-hint" className="text-xs text-gray-500">
                            Separate with commas. Up to {MAX_TAGS}.
                        </p>
                    )}
                </div>

                {/* Actions - same buttons and spacing as the Request an Instant Session form */}
                <div className="flex gap-3 pt-5 border-t border-gray-100">
                    <button
                        onClick={close}
                        disabled={submitting}
                        className="btn-secondary-outline flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="btn-primary-fill flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        {submitting ? "Sending..." : "Send for Approval"}
                    </button>
                </div>
            </div>
        </CenterModal>
    );
}
