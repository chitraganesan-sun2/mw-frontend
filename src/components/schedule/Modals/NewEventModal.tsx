"use client";

import { useState, useEffect } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import { Input } from "@/components/common/Input";
import Button from "@/components/common/Button";
import TagComponent from "@/components/common/Tag";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { POST_API, GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "@/components/common/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import useInnerWidth from "@/hooks/useInnerWidth";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import { extractTimezoneOffset } from "@/utils/timeFunctions";

dayjs.extend(utc);
dayjs.extend(timezone);

/* Full-screen mobile modal: align wrap to top and make content fill viewport */
const fullScreenMobileStyles = (
    <style
        dangerouslySetInnerHTML={{
            __html: `
            @media (max-width: 767px) {
                .ant-modal-wrap:has(.new-event-modal-fullscreen-mobile) {
                    align-items: flex-start !important;
                }
                .new-event-modal-fullscreen-mobile.ant-modal {
                    max-width: 100vw !important;
                    top: 0 !important;
                    padding: 0 !important;
                }
                .new-event-modal-fullscreen-mobile .ant-modal-content {
                    height: 100dvh !important;
                    max-height: 100dvh !important;
                    border-radius: 0 !important;
                }
            }
        `,
        }}
    />
);

interface Skill {
    skill_id: string;
    skill_name: string;
}

interface NewEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: NewEventData) => void;
    /** When provided, used for the instant session. When omitted, slots for the selected date are fetched and the first slot is used. */
    volunteer_slot_id?: string;
}

export interface NewEventData {
    select_date: Date | null;
    duration: string;
    start_time: string;
    title: string;
    description: string;
    tags: string[];
}

const durationOptions = [
    { label: "15 mins", value: "15" },
    { label: "30 mins", value: "30" },
    { label: "45 mins", value: "45" },
    { label: "1 hour", value: "60" },
    // { label: "1.5 hours", value: "90" },
    // { label: "2 hours", value: "120" },
];

/** Request body for POST /api/v1/session/instant_session */
interface InstantSessionPayload {
    volunteer_slot_id: string;
    date: string;
    duration: number;
    start_time: string;
    title: string;
    description: string;
    tag_ids: string[];
}

const timezoneMapping: Record<string, string> = {
    AKST: "America/Anchorage",
    AKDT: "America/Anchorage",
    AST: "America/Halifax",
    ADT: "America/Halifax",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    EST: "America/New_York",
    EDT: "America/New_York",
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
    CT: "America/Chicago",
    ET: "America/New_York",
    IST: "Asia/Kolkata",
};

export default function NewEventModal({
    isOpen,
    onClose,
    onSubmit,
    volunteer_slot_id: volunteerSlotIdProp,
}: NewEventModalProps) {
    const [formData, setFormData] = useState<NewEventData>({
        select_date: new Date(),
        duration: "",
        start_time: "",
        title: "",
        description: "",
        tags: [],
    });

    // Tags are split into Academic vs Non-Academic skills - the skills catalog already
    // carries a `category` ("academic" | "non_academic"), so each picker just fetches its
    // own slice. At least one selection across the two is required. tag_ids on the payload
    // stays the union of skill_ids, so all downstream tag resolution is unchanged.
    const [selectedAcademic, setSelectedAcademic] = useState<Skill[]>([]);
    const [selectedNonAcademic, setSelectedNonAcademic] = useState<Skill[]>([]);
    const [academicSelectValue, setAcademicSelectValue] = useState<string | null>(null);
    const [nonAcademicSelectValue, setNonAcademicSelectValue] = useState<string | null>(null);
    const [isCreatingSkill, setIsCreatingSkill] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Temporary time state for mobile time picker dialog
    const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(null);
    // Track the original tempTime when picker opens, so we can reset on cancel
    const [originalTempTime, setOriginalTempTime] = useState<dayjs.Dayjs | null>(null);
    // Track selected meridiem explicitly to ensure PM hours show immediately
    const [selectedMeridiem, setSelectedMeridiem] = useState<string | null>(null);

    const { volunteerDetails, volunteerUtcOffset } = useAppStore();
    const timezoneRaw =
        (
            volunteerDetails as {
                volunteer_contact_details?: { timezone?: string; utc_offset?: string };
            }
        )?.volunteer_contact_details?.timezone ?? "";

    const rawAbbreviation = timezoneRaw.includes(" - ")
        ? (timezoneRaw.split(" - ")[0]?.trim() ?? "")
        : "";

    const ianaTimezone = timezoneMapping[rawAbbreviation] || null;

    // Use IANA timezone name if available, otherwise raw abbreviation
    const volunteerTimezone = ianaTimezone || rawAbbreviation;

    // Get the current active abbreviation (handles NST -> NDT transition)
    const activeAbbreviation = ianaTimezone
        ? dayjs().tz(ianaTimezone).format("z")
        : rawAbbreviation;

    // Get UTC offset from volunteerDetails or store, with fallback to extracting from timezone string
    const volunteerUtcOffsetValue =
        (volunteerDetails as { volunteer_contact_details?: { utc_offset?: string } })
            ?.volunteer_contact_details?.utc_offset ||
        volunteerUtcOffset ||
        (timezoneRaw ? extractTimezoneOffset(timezoneRaw) : null);

    // Get current time in volunteer's timezone
    const getNowInVolunteerTimezone = () => {
        // dayjs.tz handles DST correctly when given an IANA name
        return dayjs.tz(undefined, volunteerTimezone || "UTC");
    };

    // Get today's date in YYYY-MM-DD format in volunteer's timezone
    const getTodayDate = () => {
        return getNowInVolunteerTimezone().format("YYYY-MM-DD");
    };

    // Get tomorrow's date in YYYY-MM-DD format in volunteer's timezone
    const getTomorrowDate = () => {
        return getNowInVolunteerTimezone().add(1, "day").format("YYYY-MM-DD");
    };

    // Get today's date as a Date object in volunteer's timezone
    const getTodayDateObject = (): Date => {
        const now = getNowInVolunteerTimezone();
        // Create a Date object representing the date in "local" time for the datepicker
        return new Date(now.year(), now.month(), now.date());
    };

    // Reset all form fields when modal opens
    useEffect(() => {
        if (isOpen) {
            // Get today's date in volunteer's timezone
            const todayInTimezone = getTodayDateObject();
            setFormData({
                select_date: todayInTimezone,
                duration: "",
                start_time: "",
                title: "",
                description: "",
                tags: [],
            });
            setAcademicSelectValue(null);
            setNonAcademicSelectValue(null);
            setSelectedAcademic([]);
            setSelectedNonAcademic([]);
            setTempTime(null);
            setOriginalTempTime(null);
            setSelectedMeridiem(null);
        }
    }, [isOpen, volunteerUtcOffsetValue, volunteerTimezone]);

    // Sync tempTime with formData.start_time
    useEffect(() => {
        if (formData.start_time) {
            setTempTime(dayjs.tz(formData.start_time, "HH:mm", volunteerTimezone || "UTC"));
        } else {
            setTempTime(null);
        }
    }, [formData.start_time, volunteerTimezone]);

    const queryClient = useQueryClient();
    const { data: academicSkillsData } = useQuery({
        queryKey: ["common-skills", "academic"],
        queryFn: async () => {
            const res = await GET_API(endpoints.common("skills?category=academic"));
            return res?.data as Skill[];
        },
        enabled: isOpen,
    });
    const { data: nonAcademicSkillsData } = useQuery({
        queryKey: ["common-skills", "non_academic"],
        queryFn: async () => {
            const res = await GET_API(endpoints.common("skills?category=non_academic"));
            return res?.data as Skill[];
        },
        enabled: isOpen,
    });
    const academicSkills: Skill[] = Array.isArray(academicSkillsData) ? academicSkillsData : [];
    const nonAcademicSkills: Skill[] = Array.isArray(nonAcademicSkillsData) ? nonAcademicSkillsData : [];
    const toOptions = (list: Skill[], picked: Skill[]) =>
        list
            .filter((s) => !picked.some((p) => String(p.skill_id) === String(s.skill_id)))
            .map((s) => ({ label: s.skill_name, value: s.skill_id }));

    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({ ...prev, select_date: date }));
    };

    const handleDurationChange = (value: string | number) => {
        setFormData((prev) => ({ ...prev, duration: String(value) }));
    };

    // Fetch available slots for the selected date
    const { data: slotsData, refetch: refetchSlots } = useQuery({
        queryKey: ["available-slots", dayjs(formData.select_date).format("YYYY-MM-DD")],
        queryFn: async () => {
            if (!formData.select_date) return [];
            const dateStr = dayjs(formData.select_date).format("YYYY-MM-DD");
            try {
                const res = await GET_API(
                    endpoints.volunteer_slot.getAvailableDaysForDate(dateStr)
                );
                return res?.data?.slots || [];
            } catch (error) {
                console.error("Error fetching slots:", error);
                return [];
            }
        },
        enabled: !!formData.select_date,
    });

    const handleTimeChange = (time: dayjs.Dayjs | null) => {
        if (time) {
            setFormData((prev) => ({ ...prev, start_time: time.format("HH:mm") }));
        }
    };

    const handleTimeAccept = (time: dayjs.Dayjs | null) => {
        if (time) {
            setFormData((prev) => ({ ...prev, start_time: time.format("HH:mm") }));
        }
    };

    const shouldDisableTime = (timeValue: dayjs.Dayjs, clockType: string | any) => {
        if (!formData.select_date) return false;

        const nowInTz = getNowInVolunteerTimezone();
        const selectedDateStr = dayjs(formData.select_date).format("YYYY-MM-DD");
        const currentDateStr = nowInTz.format("YYYY-MM-DD");

        // If selected date is in the past, disable all times
        if (selectedDateStr < currentDateStr) {
            return true;
        }

        // Helper function to check if a time slot is booked
        const isTimeSlotBooked = (timeStr: string): boolean => {
            if (!slotsData || !Array.isArray(slotsData)) return false;
            return slotsData.some((slot: any) => {
                return timeStr >= slot.start_time && timeStr < slot.end_time;
            });
        };

        const isToday = selectedDateStr === currentDateStr;

        if (clockType === "hours") {
            const hour24 = timeValue.hour();

            if (isToday && hour24 < nowInTz.hour()) {
                return true;
            }

            // Check if all minute slots in this hour are unavailable (past or booked)
            const minutesToCheck = Array.from({ length: 60 }, (_, minute) => minute);
            return minutesToCheck.every((minute) => {
                const checkTime = timeValue.minute(minute).second(0);
                if (isToday && checkTime.isBefore(nowInTz, "minute")) return true;
                return isTimeSlotBooked(checkTime.format("HH:mm"));
            });
        } else if (clockType === "minutes") {
            const timeStr = timeValue.format("HH:mm");
            if (isToday && timeValue.isBefore(nowInTz, "minute")) return true;
            return isTimeSlotBooked(timeStr);
        } else if (clockType === "meridiem") {
            if (isToday && nowInTz.format("A") === "PM" && timeValue.format("A") === "AM") {
                return true;
            }
        }

        return false;
    };

    const handleTitleChange = (value: string | string[]) => {
        setFormData((prev) => ({ ...prev, title: Array.isArray(value) ? value[0] : value }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    type SkillCategory = "academic" | "non_academic";

    const catState = (category: SkillCategory) =>
        category === "academic"
            ? {
                  list: academicSkills,
                  selected: selectedAcademic,
                  setSelected: setSelectedAcademic,
                  setSelectValue: setAcademicSelectValue,
              }
            : {
                  list: nonAcademicSkills,
                  selected: selectedNonAcademic,
                  setSelected: setSelectedNonAcademic,
                  setSelectValue: setNonAcademicSelectValue,
              };

    const handleAddSkill = (category: SkillCategory, skillId: string) => {
        const { list, selected, setSelected, setSelectValue } = catState(category);
        const skill = list.find((s) => String(s.skill_id) === String(skillId));
        if (skill && !selected.some((s) => String(s.skill_id) === String(skillId))) {
            setSelected((prev) => [...prev, skill]);
            setSelectValue(null);
        }
    };

    /** Create a new skill via POST /api/v1/common/skills/ and return it for use in payload. */
    const createSkill = async (
        skillName: string,
        category: SkillCategory
    ): Promise<Skill | null> => {
        const name = skillName?.trim();
        if (!name) return null;
        try {
            const res = await POST_API<{ skill_name: string; category: string }>(
                endpoints.common("skills"),
                { skill_name: name, category }
            );
            if (res?.status === 201 || res?.status === 200) {
                const data = res?.data as { skill_id?: string; skill_name?: string } | string;
                const skillId = typeof data === "string" ? data : (data?.skill_id ?? "");
                const skillNameRes =
                    typeof data === "object" && data?.skill_name ? data.skill_name : name;
                if (skillId) {
                    return { skill_id: skillId, skill_name: skillNameRes };
                }
                return { skill_id: name, skill_name: name };
            }
        } catch {
            showToast({ message: "Failed to create tag", type: "error" });
        }
        return null;
    };

    const handleCreateSkill = async (category: SkillCategory, skillName: string) => {
        const { selected, setSelected, setSelectValue } = catState(category);
        setIsCreatingSkill(true);
        try {
            const newSkill = await createSkill(skillName, category);
            if (newSkill && !selected.some((s) => String(s.skill_id) === String(newSkill.skill_id))) {
                setSelected((prev) => [...prev, newSkill]);
                setSelectValue(null);
                queryClient.invalidateQueries({ queryKey: ["common-skills", category] });
            }
        } finally {
            setIsCreatingSkill(false);
        }
    };

    const handleRemoveSkill = (category: SkillCategory, skillId: string) => {
        const { setSelected, setSelectValue } = catState(category);
        setSelected((prev) => prev.filter((s) => String(s.skill_id) !== String(skillId)));
        // Clear the input field to ensure the removed tag can be selected again
        setSelectValue(null);
    };

    // Helper function to check if time slots overlap
    const areSlotsOverlapping = (
        start1: string,
        end1: string,
        start2: string,
        end2: string
    ): boolean => {
        const start1Minutes = dayjs(start1, "HH:mm");
        const end1Minutes = dayjs(end1, "HH:mm");
        const start2Minutes = dayjs(start2, "HH:mm");
        const end2Minutes = dayjs(end2, "HH:mm");

        return start1Minutes.isBefore(end2Minutes) && end1Minutes.isAfter(start2Minutes);
    };

    // Helper function to calculate end time from start time and duration
    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        return dayjs(startTime, "HH:mm").add(durationMinutes, "minute").format("HH:mm");
    };

    const handleSubmit = async () => {
        if (!formData.duration || !formData.start_time || !formData.title?.trim()) {
            showToast({ message: "Please fill in Duration, start time and title", type: "error" });
            return;
        }
        if (selectedAcademic.length === 0 && selectedNonAcademic.length === 0) {
            showToast({
                message: "Add at least one Academic or Non-Academic Skill",
                type: "error",
            });
            return;
        }

        // Validate that the selected time is not in the past
        const dateStr = formData.select_date
            ? dayjs(formData.select_date).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD");

        // Get current time in volunteer's timezone
        const nowInTz = getNowInVolunteerTimezone();
        const currentDateStr = nowInTz.format("YYYY-MM-DD");
        const currentTimeStr = nowInTz.format("HH:mm");

        // Check if selected date is in the past
        if (dateStr < currentDateStr) {
            showToast({ message: "Cannot create session for a past date", type: "error" });
            return;
        }

        // Check if selected time is in the past (only for today)
        if (dateStr === currentDateStr) {
            const selectedTimeStr = formData.start_time;
            if (selectedTimeStr < currentTimeStr) {
                showToast({ message: "Cannot create session for a past time", type: "error" });
                return;
            }
        }

        // Check for overlapping time slots
        if (slotsData && Array.isArray(slotsData) && slotsData.length > 0) {
            const durationMinutes = Number(formData.duration) || 0;
            const newStartTime = formData.start_time;
            const newEndTime = calculateEndTime(newStartTime, durationMinutes);

            // Check if the new slot overlaps with any existing slot
            const hasOverlap = slotsData.some((slot: any) => {
                if (!slot.start_time || !slot.end_time) return false;

                // Check for overlap
                return areSlotsOverlapping(
                    newStartTime,
                    newEndTime,
                    slot.start_time,
                    slot.end_time
                );
            });

            if (hasOverlap) {
                showToast({
                    message: "Time slot overlaps with an existing session",
                    type: "error",
                });
                return;
            }
        }
        let volunteer_slot_id = volunteerSlotIdProp;
        if (!volunteer_slot_id) {
            // Generate a unique 64-character hex ID (SHA-256 format)
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            volunteer_slot_id = Array.from(array)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        }
        const allSelected = [...selectedAcademic, ...selectedNonAcademic];
        const payload: InstantSessionPayload = {
            volunteer_slot_id,
            date: dateStr,
            duration: Number(formData.duration) || 0,
            start_time: formData.start_time,
            title: formData.title.trim(),
            description: formData.description?.trim() ?? "",
            // Union of both pickers - each skill_id already carries its own academic /
            // non_academic category in the skills catalog, so downstream stays unchanged.
            tag_ids: allSelected.map((s) => s.skill_id),
        };
        setIsSubmitting(true);
        try {
            const res = await POST_API(endpoints.session.createInstantSession, payload);
            if (res?.status === 200 || res?.status === 201) {
                showToast({ message: "Event created successfully", type: "success" });
                onSubmit?.({ ...formData, tags: allSelected.map((s) => s.skill_name) });
                setFormData({
                    select_date: getTodayDateObject(),
                    duration: "",
                    start_time: "",
                    title: "",
                    description: "",
                    tags: [],
                });
                setSelectedAcademic([]);
                setSelectedNonAcademic([]);
                setAcademicSelectValue(null);
                setNonAcademicSelectValue(null);
                setTempTime(null);
                setOriginalTempTime(null);
                onClose();
            } else {
                showToast({ message: "Failed to create event", type: "error" });
            }
        } catch {
            showToast({ message: "Failed to create event", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            select_date: getTodayDateObject(),
            duration: "",
            start_time: "",
            title: "",
            description: "",
            tags: [],
        });
        setSelectedAcademic([]);
        setSelectedNonAcademic([]);
        setAcademicSelectValue(null);
        setNonAcademicSelectValue(null);
        setTempTime(null);
        setOriginalTempTime(null);
        setSelectedMeridiem(null);
        onClose();
    };

    const innerWidth = useInnerWidth();
    const isMobile = innerWidth > 0 && innerWidth < 768;
    const mobileHeader = (
        <div className="flex items-center gap-3 w-full">
            <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center rounded-full p-0 border-0 bg-transparent active:scale-90 transition-all duration-200 cursor-pointer"
                aria-label="Close"
            >
                <ModalCloseIcon className="active:scale-90 transition-all duration-200" />
            </button>
            <p className="text-[20px] font-medium text-[#1a1a1a]">New Instant Session</p>
        </div>
    );

    return (
        <>
            {fullScreenMobileStyles}
            <CenterModal
                title="New Instant Session"
                topContent={
                    <p className="text-sm text-gray-500 font-normal !mt-0">
                        Set up a live session for learners to join instantly
                    </p>
                }
                headerComponent={isMobile ? mobileHeader : undefined}
                hideCloseIcon={isMobile}
                isOpen={isOpen}
                onClose={handleCancel}
                width={620}
                hideFooter={true}
                customClassName="new-event-modal-fullscreen-mobile !rounded-3xl max-md:!w-screen max-md:!min-h-[100dvh] max-md:!h-[100dvh] max-md:!max-h-[100dvh] max-md:!top-0 max-md:!rounded-none max-md:!m-0"
                rootClassName="!rounded-3xl overflow-hidden max-md:!min-h-full max-md:!h-full"
                headerClassName="!px-6 !py-5"
                bodyClassName="md:!px-6 !p-[20px]"
            >
                <div className="flex flex-col gap-5 max-md:gap-5">
                    {/* Select Date */}
                    <div className="flex flex-col gap-2">
                        <Input
                            name="select_date"
                            label="Select Date"
                            inputType="datepicker"
                            value={formData.select_date}
                            onChange={handleDateChange}
                            disabled={false}
                            format="DD MMMM YYYY"
                            labelClassName="!text-base !font-medium !text-[#121212]"
                            inputClassName="w-full !h-12 !bg-white md:!border-gray-200 hover:!bg-white focus:!bg-white [&_.ant-picker]:!bg-white [&_.ant-picker]:!rounded-xl [&_.ant-picker]:!border-gray-200 [&_.ant-picker:hover]:!border-gray-400 [&_.ant-picker-focused]:!border-black [&_.ant-picker-input>input]:!bg-white [&_.ant-picker-input>input]:!text-[#121212] [&_.ant-picker-input>input]:!text-base [&_.ant-picker-suffix]:!text-[#4F4F4F]"
                            availableDates={[getTodayDate(), getTomorrowDate()]}
                        />
                    </div>

                    {/* Duration – card-style pill selector */}
                    <div className="flex flex-col gap-2">
                        <label className="md:text-base text-[14px] font-medium text-[#121212]">
                            Duration
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {durationOptions.map((opt) => {
                                const isSelected = formData.duration === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleDurationChange(opt.value)}
                                        className={`py-3 px-2 rounded-xl border text-center text-sm font-medium transition-all duration-150 cursor-pointer ${
                                            isSelected
                                                ? "border-black bg-black text-white"
                                                : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Start Time */}
                    <div className="flex flex-col gap-2">
                        <label className="md:text-base text-[14px] font-medium text-[#121212]">
                            Start Time{activeAbbreviation ? ` (${activeAbbreviation})` : ""}
                        </label>
                        <div className="w-full">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <MobileTimePicker
                                    format="h:mm A"
                                    minutesStep={1}
                                    timezone={volunteerTimezone || "UTC"}
                                    value={tempTime}
                                    onChange={(time) => {
                                        // Always update tempTime when time changes
                                        // This includes when user clicks AM/PM (meridiem changes)
                                        // This ensures mobile picker shows hours correctly when PM is selected
                                        setTempTime(time);
                                        // Track meridiem explicitly when it changes
                                        if (time) {
                                            const meridiem = time.format("A");
                                            setSelectedMeridiem(meridiem);
                                        }
                                    }}
                                    onOpen={() => {
                                        // Save the original tempTime value before opening
                                        setOriginalTempTime(tempTime);

                                        // Fetch slots when time picker opens
                                        // This ensures we have the latest slot data for overlap checking
                                        if (formData.select_date) {
                                            refetchSlots();
                                        }

                                        // If tempTime is null, set default time based on current time in volunteer's timezone
                                        // This ensures hours are visible immediately when picker opens
                                        if (!tempTime) {
                                            // Get current time in volunteer's timezone
                                            const nowInTz = getNowInVolunteerTimezone();

                                            // Round to next 15-minute slot for a better UX
                                            const minutes = nowInTz.minute();
                                            const roundedMinutes = Math.ceil(minutes / 15) * 15;
                                            const defaultTime = nowInTz.minute(roundedMinutes).second(0);

                                            setTempTime(defaultTime);
                                            setSelectedMeridiem(defaultTime.format("A"));
                                        } else {
                                            // If tempTime exists, track its meridiem
                                            const meridiem = tempTime.format("A");
                                            setSelectedMeridiem(meridiem);
                                        }
                                    }}
                                    onClose={() => {
                                        // If user cancels without accepting, reset tempTime to original value
                                        // This ensures the input field stays empty if no time was selected
                                        setTempTime(originalTempTime);
                                        setOriginalTempTime(null);
                                    }}
                                    onAccept={(time) => {
                                        // Clear the original tempTime tracking since user accepted
                                        setOriginalTempTime(null);
                                        handleTimeAccept(time);
                                    }}
                                    shouldDisableTime={shouldDisableTime}
                                    closeOnSelect={false}
                                    slotProps={{
                                        textField: {
                                            placeholder: "Select Time",
                                            sx: {
                                                width: "100%",
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "12px",
                                                    fontSize: "16px",
                                                    height: "48px",
                                                    backgroundColor: "#ffffff",
                                                    "& fieldset": {
                                                        border: "1px solid #e5e7eb",
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: "#ffffff",
                                                        "& fieldset": {
                                                            border: "1px solid #9ca3af",
                                                        },
                                                    },
                                                    "&.Mui-focused": {
                                                        backgroundColor: "#ffffff",
                                                        "& fieldset": {
                                                            border: "1px solid #000000",
                                                        },
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 14px",
                                                    fontSize: "16px",
                                                    color: "#121212",
                                                    height: "48px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                },
                                                "& .MuiInputBase-input::placeholder": {
                                                    color: "#808080",
                                                    opacity: 1,
                                                    fontSize: "16px",
                                                    fontWeight: 400,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <Input
                            name="title"
                            label="Title"
                            inputType="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Enter title here"
                            labelClassName="!text-base !font-medium !text-[#121212]"
                            inputClassName="w-full !h-12 !rounded-xl !border-gray-200 hover:!border-gray-400 focus:!border-black !text-base !text-[#121212] placeholder:!text-[#808080] placeholder:!text-base"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <Input
                            name="description"
                            label="Description (Optional)"
                            inputType="textarea"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter description here"
                            labelClassName="!text-base !font-medium !text-[#121212]"
                            inputClassName="w-full !h-[100px] !rounded-xl !border-gray-200 hover:!border-gray-400 focus:!border-black !text-base !text-[#121212] placeholder:!text-[#808080] placeholder:!text-base"
                            rows={4}
                        />
                    </div>

                    {/* Academic Skills – tags from the academic skills catalog */}
                    <div className="flex flex-col md:gap-2">
                        <label className="md:text-base text-[14px] font-medium text-[#121212]">
                            Academic Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                            {selectedAcademic.map((skill) => (
                                <TagComponent
                                    key={skill.skill_id}
                                    text={skill.skill_name}
                                    isClose={true}
                                    onClose={() => handleRemoveSkill("academic", skill.skill_id)}
                                />
                            ))}
                        </div>
                        <Input
                            key={`academic-select-${selectedAcademic.length}`}
                            name="academic_skill_select"
                            inputType="select-creatable"
                            variant="single"
                            placeholder="Search and select academic skills or create a new tag"
                            value={academicSelectValue ? [academicSelectValue] : []}
                            onChange={(value: string | number) => {
                                if (value != null && value !== "") {
                                    handleAddSkill("academic", String(value));
                                }
                            }}
                            onCreate={(name: string) => handleCreateSkill("academic", name)}
                            allowCreate={true}
                            endpoint="skills"
                            isLoading={isCreatingSkill}
                            options={toOptions(academicSkills, selectedAcademic)}
                            inputClassName="w-full !h-12 !rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!text-base"
                        />
                    </div>

                    {/* Non-Academic Skills – tags from the non-academic skills catalog */}
                    <div className="flex flex-col md:gap-2">
                        <label className="md:text-base text-[14px] font-medium text-[#121212]">
                            Non-Academic Skills
                        </label>
                        <p className="text-xs text-gray-500 mb-1 md:-mt-1">
                            Add at least one Academic or Non-Academic Skill.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                            {selectedNonAcademic.map((skill) => (
                                <TagComponent
                                    key={skill.skill_id}
                                    text={skill.skill_name}
                                    isClose={true}
                                    onClose={() => handleRemoveSkill("non_academic", skill.skill_id)}
                                />
                            ))}
                        </div>
                        <Input
                            key={`non-academic-select-${selectedNonAcademic.length}`}
                            name="non_academic_skill_select"
                            inputType="select-creatable"
                            variant="single"
                            placeholder="Search and select non-academic skills or create a new tag"
                            value={nonAcademicSelectValue ? [nonAcademicSelectValue] : []}
                            onChange={(value: string | number) => {
                                if (value != null && value !== "") {
                                    handleAddSkill("non_academic", String(value));
                                }
                            }}
                            onCreate={(name: string) => handleCreateSkill("non_academic", name)}
                            allowCreate={true}
                            endpoint="skills"
                            isLoading={isCreatingSkill}
                            options={toOptions(nonAcademicSkills, selectedNonAcademic)}
                            inputClassName="w-full !h-12 !rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!text-base"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex gap-3 pt-5 pb-2 border-t border-stroke">
                        <Button
                            title="Cancel"
                            onClick={handleCancel}
                            customClassName="flex-1 !bg-white !text-black !font-medium !rounded-2xl !border !border-gray-200 hover:!bg-gray-50 !py-3"
                        />
                        <Button
                            title={isSubmitting ? "Creating..." : "Create Event"}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            customClassName="flex-1 !bg-black !text-white !font-medium !rounded-2xl !py-3"
                        />
                    </div>
                </div>
                <div className="flex md:hidden gap-3 pt-5 border-t border-stroke">
                    <Button
                        title="Cancel"
                        onClick={handleCancel}
                        customClassName="flex-1 !bg-white !text-black !font-medium !rounded-2xl !border !border-gray-200 !py-3"
                    />
                    <Button
                        title={isSubmitting ? "Creating..." : "Create Event"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        customClassName="flex-1 !bg-black !text-white !font-medium !rounded-2xl !py-3"
                    />
                </div>
            </CenterModal>
        </>
    );
}
