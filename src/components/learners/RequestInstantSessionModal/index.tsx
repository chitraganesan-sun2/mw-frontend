"use client";

import React, { useState } from "react";
import { getApiErrorMessage } from "@/utils/apiError";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CommitActionBar from "@/components/common/Input/Picker/CommitActionBar";
import LottieLoader from "@/components/common/Loader/Lottie";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import {
    CategoryField,
    DurationField,
    InstantDateField,
    LevelField,
    SESSION_FIELD_LABELS,
    SessionDetailsField,
    SkillField,
    type PickedSkill,
    type SessionCategory,
} from "@/components/schedule/forms/SessionFormFields";
import { useAppStore } from "@/store/useAppStore";
import { profileTimeZoneIana, shortTimeZone } from "@/utils/sessionDisplay";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


interface RequestInstantSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}



const RequestInstantSessionModal: React.FC<RequestInstantSessionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // Everything date/time is reasoned about in the learner's *profile* timezone, not
    // the browser's, so "today", the past-time guard and the picker all agree with what
    // the backend later assumes when it converts availability_start_time to UTC.
    const { learnerDetails } = useAppStore();
    // Onboarding stores "ABBR - Full Name (UTC±HH:MM)". Keep the abbr as-is for the label
    // (it's exactly what the learner picked - "IST", "PST", ...) and map it to an IANA
    // zone for DST-correct date math.
    const tzLabel = (learnerDetails?.learner_personal_info?.learner_contact_details?.timezone as string) ?? "";
    const tzAbbr = tzLabel.split(" - ")[0]?.trim() ?? "";
    // Full-label aware (Arizona / Saskatchewan / Puerto Rico have no daylight saving).
    const learnerTz = profileTimeZoneIana(tzLabel) || "";

    const nowInTz = learnerTz ? dayjs().tz(learnerTz) : dayjs();
    const todayStr = nowInTz.format("YYYY-MM-DD");
    const tomorrowStr = nowInTz.add(1, "day").format("YYYY-MM-DD");

    // Form state
    const [category, setCategory] = useState<SessionCategory | "">("");
    const [skill, setSkill] = useState<PickedSkill | null>(null);
    const [level, setLevel] = useState("");
    // Default the date to today (in the learner's timezone) so they don't have to open
    // the picker for the common case; tomorrow is still selectable.
    const [date, setDate] = useState<string>(todayStr);
    const [time, setTime] = useState<string>("");
    const [duration, setDuration] = useState<number>(30);
    const [sessionDetails, setSessionDetails] = useState<string>("");
    const [errors, setErrors] = useState<{ category?: string; skill?: string; level?: string; details?: string; time?: string }>({});
    // Controlled picker + draft value: see CommitActionBar. The draft starts on a sensible
    // default (next 5 minutes today, 9:00 AM tomorrow) so the clock never opens on an
    // empty "-- : --" header with OK doing nothing.
    const [pickerOpen, setPickerOpen] = useState(false);
    const [draftTime, setDraftTime] = useState<dayjs.Dayjs | null>(null);

    // The picker carries a full datetime anchored to the selected date in the learner's
    // timezone, so MUI's `disablePast` greys out only the genuinely past slots for
    // "today" and leaves the whole clock open for "tomorrow".
    const makeInTz = (isoish: string) =>
        learnerTz ? dayjs.tz(isoish, learnerTz) : dayjs(isoish);
    const timeValue = time ? makeInTz(`${date}T${time}`) : null;

    const resetForm = () => {
        setCategory("");
        setSkill(null);
        setLevel("");
        setDate(learnerTz ? dayjs().tz(learnerTz).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
        setTime("");
        setDuration(30);
        setSessionDetails("");
        setErrors({});
    };

    const defaultDraft = () => {
        if (date === todayStr) {
            const now = learnerTz ? dayjs().tz(learnerTz) : dayjs();
            const rounded = Math.ceil((now.minute() + 1) / 5) * 5;
            return now.minute(0).second(0).millisecond(0).add(rounded, "minute");
        }
        return makeInTz(`${date}T09:00`);
    };

    const commitDraftTime = () => {
        setPickerOpen(false);
        if (!draftTime) return;
        if (date === todayStr && draftTime.isBefore(dayjs())) {
            setErrors((e) => ({ ...e, time: "That time has already passed. Please pick a later time." }));
            return;
        }
        setTime(draftTime.format("HH:mm"));
        setErrors((e) => ({ ...e, time: undefined }));
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        const found = {
            category: category ? undefined : "Please choose a category.",
            skill: skill ? undefined : "Please choose a skill.",
            level: level ? undefined : "Please choose a level.",
            details: sessionDetails.trim() ? undefined : "Please describe the session details and expectations.",
        };
        if (found.category || found.skill || found.level || found.details) {
            setErrors((e) => ({ ...e, ...found }));
            showToast({ message: "Please complete the highlighted fields", type: "error" });
            return;
        }
        if (!date || !time) {
            showToast({ message: "Please select both date and time", type: "error" });
            return;
        }
        if (date !== todayStr && date !== tomorrowStr) {
            showToast({ message: "Instant Sessions can only be requested for today or tomorrow", type: "error" });
            return;
        }
        // isBefore compares absolute instants, so a fresh dayjs() is correct regardless
        // of zone - and re-reading the clock here avoids a stale render-time value.
        if (date === todayStr && makeInTz(`${date}T${time}`).isBefore(dayjs())) {
            setErrors((e) => ({ ...e, time: "That time has already passed. Please pick a later time." }));
            showToast({ message: "Start time can't be in the past", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                availability_date: dayjs(date).format("YYYY-MM-DD"),
                availability_start_time: time,
                duration: duration,
                session_type: category,
                skill_ids: [skill!.skill_id],
                grade_level: category === "academic" ? level : null,
                expertise_level: category === "non_academic" ? level : null,
                session_details: sessionDetails.trim(),
            };

            const res = await POST_API(endpoints.session.createLearnerInstantSessionRequest, payload);

            if (res.status === 201 || res.status === 200) {
                showToast({ message: "Request posted! Volunteers will be notified.", type: "success" });
                onSuccess();
                handleClose();
            } else {
                showToast({ message: res.data?.detail || "Failed to create request", type: "error" });
            }
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "An error occurred"), type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Request an Instant Session"
            topContent={
                <p className="text-sm text-gray-500 font-normal !mt-0">
                    Post what you want to learn - a volunteer can accept it.
                </p>
            }
            width={580}
            hideFooter={true}
            rootClassName="!rounded-3xl overflow-hidden"
            headerClassName="!px-6 !py-5"
            bodyClassName="!px-6 !py-[20px]"
        >
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-3xl">
                    <LottieLoader isLoading={true} />
                </div>
            )}

            <div className="flex flex-col gap-5">
                <CategoryField
                    value={category}
                    error={errors.category}
                    onChange={(value) => {
                        setCategory(value);
                        setSkill(null);
                        setLevel("");
                        setErrors((e) => ({ ...e, category: undefined, skill: undefined, level: undefined }));
                    }}
                />
                <SkillField
                    category={category}
                    value={skill}
                    error={errors.skill}
                    onChange={(value) => {
                        setSkill(value);
                        setErrors((e) => ({ ...e, skill: undefined }));
                    }}
                />
                <LevelField
                    category={category}
                    value={level}
                    error={errors.level}
                    onChange={(value) => {
                        setLevel(value);
                        setErrors((e) => ({ ...e, level: undefined }));
                    }}
                />
                <SessionDetailsField
                    value={sessionDetails}
                    error={errors.details}
                    placeholder="What do you want to cover? Anything the volunteer should know or prepare?"
                    onChange={(value) => {
                        setSessionDetails(value);
                        if (value.trim()) setErrors((e) => ({ ...e, details: undefined }));
                    }}
                />

                <InstantDateField
                    value={date}
                    today={todayStr}
                    tomorrow={tomorrowStr}
                    onChange={(value) => {
                        setDate(value);
                        setTime("");
                        setErrors((e) => ({ ...e, time: undefined }));
                    }}
                />
                <div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="request-session-time" className="text-base font-medium text-[#121212]">
                            {SESSION_FIELD_LABELS.startTime}{tzAbbr ? ` (${shortTimeZone(tzLabel, date)})` : ""} <span aria-hidden="true">*</span>
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MobileTimePicker
                                format="h:mm A"
                                minutesStep={5}
                                timezone={learnerTz || undefined}
                                value={pickerOpen ? draftTime : timeValue}
                                open={pickerOpen}
                                onOpen={() => {
                                    setDraftTime(timeValue ?? defaultDraft());
                                    setPickerOpen(true);
                                }}
                                // Backdrop / Escape: discard the draft, keep the committed time.
                                onClose={() => setPickerOpen(false)}
                                onChange={(value) => setDraftTime(value)}
                                closeOnSelect={false}
                                // disablePast is evaluated live against "now"; OK and the
                                // submit guard re-check with a fresh clock.
                                disablePast={date === todayStr}
                                slots={{ actionBar: CommitActionBar }}
                                slotProps={{
                                    actionBar: {
                                        onCancelClick: () => setPickerOpen(false),
                                        onAcceptClick: commitDraftTime,
                                    } as any,
                                    textField: {
                                        id: "request-session-time",
                                        placeholder: "Select time",
                                        fullWidth: true,
                                        error: Boolean(errors.time),
                                        inputProps: {
                                            "aria-describedby": errors.time ? "request-session-time-error" : undefined,
                                        },
                                        InputProps: {
                                            sx: {
                                                height: 48,
                                                borderRadius: "0.75rem",
                                                fontSize: "1rem",
                                                "& fieldset": { borderColor: "#e5e7eb" },
                                                "&:hover fieldset": { borderColor: "#9ca3af" },
                                                "&.Mui-focused fieldset": { borderColor: "#000" },
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        {errors.time && (
                            <p id="request-session-time-error" role="alert" className="text-sm text-red-700">
                                {errors.time}
                            </p>
                        )}
                    </div>
                </div>

                <DurationField value={duration} onChange={setDuration} />

                {/* Actions */}
                <div className="flex gap-3 pt-5 border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="btn-secondary-outline flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn-primary-fill flex-1 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Posting..." : "Post Request"}
                    </button>
                </div>
            </div>
        </CenterModal>
    );
};

export default RequestInstantSessionModal;
