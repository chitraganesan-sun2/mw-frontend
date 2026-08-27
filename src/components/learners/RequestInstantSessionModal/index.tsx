"use client";

import React, { useState } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LottieLoader from "@/components/common/Loader/Lottie";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { Input } from "@/components/common/Input";
import { useAppStore } from "@/store/useAppStore";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Onboarding stores the timezone as "ABBR - Full Name (UTC±HH:MM)"; map the abbr to an
// IANA zone so dayjs can do DST-correct math. Mirrors schedule/Modals/NewEventModal.
const ABBR_TO_IANA: Record<string, string> = {
    AKST: "America/Anchorage",
    AKDT: "America/Anchorage",
    AST: "America/Halifax",
    ADT: "America/Halifax",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    CT: "America/Chicago",
    EST: "America/New_York",
    EDT: "America/New_York",
    ET: "America/New_York",
    HST: "Pacific/Honolulu",
    HDT: "Pacific/Honolulu",
    MST: "America/Denver",
    MDT: "America/Denver",
    MT: "America/Denver",
    NST: "America/St_Johns",
    NDT: "America/St_Johns",
    PST: "America/Los_Angeles",
    PDT: "America/Los_Angeles",
    PT: "America/Los_Angeles",
    IST: "Asia/Kolkata",
};

interface RequestInstantSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Skill {
    skill_id: string;
    skill_name: string;
}

const DURATIONS = [15, 30, 45, 60];

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
    const tzAbbr =
        ((learnerDetails?.learner_personal_info?.learner_contact_details?.timezone as string) ?? "")
            .split(" - ")[0]
            ?.trim() ?? "";
    const learnerTz = ABBR_TO_IANA[tzAbbr] || "";
    const nowInTz = learnerTz ? dayjs().tz(learnerTz) : dayjs();
    const todayStr = nowInTz.format("YYYY-MM-DD");
    const tomorrowStr = nowInTz.add(1, "day").format("YYYY-MM-DD");

    // Form state
    const [sessionType, setSessionType] = useState<"academic" | "non_academic" | "">("");
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [level, setLevel] = useState("");
    // Default the date to today (in the learner's timezone) so they don't have to open
    // the picker for the common case; tomorrow is still selectable.
    const [date, setDate] = useState<string>(todayStr);
    const [time, setTime] = useState<string>("");
    const [duration, setDuration] = useState<number>(30);
    const [sessionDetails, setSessionDetails] = useState<string>("");

    // The picker carries a full datetime anchored to the selected date in the learner's
    // timezone, so MUI's `disablePast` greys out only the genuinely past slots for
    // "today" and leaves the whole clock open for "tomorrow".
    const makeInTz = (isoish: string) =>
        learnerTz ? dayjs.tz(isoish, learnerTz) : dayjs(isoish);
    const timeValue = time ? makeInTz(`${date}T${time}`) : null;

    const resetForm = () => {
        setSessionType("");
        setSelectedSkills([]);
        setLevel("");
        setDate(learnerTz ? dayjs().tz(learnerTz).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
        setTime("");
        setDuration(30);
        setSessionDetails("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!sessionType) {
            showToast({ message: "Please select what you want to learn", type: "error" });
            return;
        }
        if (selectedSkills.length === 0) {
            showToast({ message: "Please select at least one skill", type: "error" });
            return;
        }
        if (!level) {
            showToast({ message: "Please select a level", type: "error" });
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
            showToast({ message: "Start time can't be in the past", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                availability_date: dayjs(date).format("YYYY-MM-DD"),
                availability_start_time: time,
                duration: duration,
                session_type: sessionType,
                skill_ids: selectedSkills.map((s) => s.skill_id),
                grade_level: sessionType === "academic" ? level : null,
                expertise_level: sessionType === "non_academic" ? level : null,
                session_details: sessionDetails.trim() || null,
            };

            const res = await POST_API(endpoints.session.createLearnerInstantSessionRequest, payload);

            if (res.status === 201 || res.status === 200) {
                showToast({ message: "Session request created successfully! Volunteers will be notified.", type: "success" });
                onSuccess();
                handleClose();
            } else {
                showToast({ message: res.data?.detail || "Failed to create request", type: "error" });
            }
        } catch (error: any) {
            showToast({ message: error?.response?.data?.detail || "An error occurred", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Request a Session"
            topContent={
                <p className="text-sm text-gray-500 font-normal !mt-0">
                    Let a volunteer know when you&apos;re free to learn
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
                {/* Session Type */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-[#121212]">
                        What do you want to learn?
                    </label>
                    <select
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] appearance-none"
                        value={sessionType}
                        onChange={(e) => {
                            setSessionType(e.target.value as "academic" | "non_academic" | "");
                            setSelectedSkills([]);
                            setLevel("");
                        }}
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        <option value="academic">Academic</option>
                        <option value="non_academic">Arts &amp; Life Skills</option>
                    </select>
                </div>

                {/* Skills – LOV, filtered by category, matches the onboarding form's async-select
                    (same endpoint/response shape) so users can add a skill that isn't listed yet. */}
                {sessionType && (
                    <Input
                        name="skills"
                        label="Which skills do you want to learn?"
                        inputType="async-select"
                        variant="multi"
                        creatable
                        allowCreate
                        endpoint={`skills?category=${sessionType}`}
                        responseAsLabel="skill_name"
                        responseAsValue={["skill_id", "skill_name"]}
                        placeholder="Don't see your option? Type it in to add."
                        value={selectedSkills}
                        onChange={(value: any) => setSelectedSkills(Array.isArray(value) ? value : [])}
                        onCreate={(value: any) => setSelectedSkills((prev) => [...prev, value])}
                    />
                )}

                {/* Level */}
                {sessionType && (
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">
                            {sessionType === "academic" ? "Grade Level" : "Expertise Level"}
                        </label>
                        {sessionType === "academic" ? (
                            <select
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] appearance-none"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select your grade
                                </option>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={`Grade ${i + 1}`}>
                                        Grade {i + 1}
                                    </option>
                                ))}
                                <option value="College">College</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {["beginner", "intermediate", "expert"].map((exp) => (
                                    <button
                                        key={exp}
                                        type="button"
                                        onClick={() => setLevel(exp)}
                                        className={`py-3 px-2 rounded-xl border text-center text-sm font-medium capitalize transition-all duration-150 cursor-pointer ${
                                            level === exp
                                                ? "border-black bg-black text-white"
                                                : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                        }`}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={todayStr}
                            max={tomorrowStr}
                            className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">
                            Start Time{tzAbbr ? ` (${tzAbbr})` : ""}
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MobileTimePicker
                                format="h:mm A"
                                minutesStep={5}
                                timezone={learnerTz || undefined}
                                value={timeValue}
                                referenceDate={date === todayStr ? nowInTz : makeInTz(`${date}T09:00`)}
                                // disablePast is evaluated live against "now"; the submit
                                // guard re-checks with a fresh clock. (No stale minTime prop.)
                                disablePast={date === todayStr}
                                onChange={(value) => setTime(value ? value.format("HH:mm") : "")}
                                slotProps={{
                                    textField: {
                                        placeholder: "Select time",
                                        fullWidth: true,
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
                    </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-[#121212]">Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                        {DURATIONS.map((dur) => (
                            <button
                                key={dur}
                                type="button"
                                onClick={() => setDuration(dur)}
                                className={`py-3 px-2 rounded-xl border text-center text-sm font-medium transition-all duration-150 cursor-pointer ${
                                    duration === dur
                                        ? "border-black bg-black text-white"
                                        : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                }`}
                            >
                                {dur} min
                            </button>
                        ))}
                    </div>
                </div>

                {/* Session Details and Expectations from Volunteers */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-[#121212]">
                        Session Details and Expectations from Volunteers
                    </label>
                    <textarea
                        value={sessionDetails}
                        onChange={(e) => setSessionDetails(e.target.value)}
                        placeholder="Let the volunteer know what you're hoping to cover or any specific expectations"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-5 border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </CenterModal>
    );
};

export default RequestInstantSessionModal;
