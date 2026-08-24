"use client";
import { endpoints } from "@/api/constants";
import { GET_API, PUT_API } from "@/api/request";
import SideModal from "@/components/common/Modals/SideModal";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/icons/TrashIcon";
import cn from "classnames";
import dayjs from "dayjs";
import AddSlotIcon from "@/assets/icons/AddSlotIcon";
import { useSendData } from "@/hooks/useReactQuery";
import { convertToUTC, generateTimeSlotId } from "@/utils/timeFunctions";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import CheckIcon from "@/assets/icons/CheckIcon";
import CustomRecurrenceModal from "@/components/schedule/Modals/CustomRecurrenceModal";

import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { showToast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import InnerWidth from "@/utils/innerWidth";
import type { MyScheduleModalProps } from "./index.type";

interface TimeSlot {
    start_time: string;
    end_time: string;
    volunteer_slot_id?: string;
    /** Stable id for UI state (repeat/custom). From API: volunteer_slot_id; new slots: generated client_id. */
    client_id?: string;
    slot_type?: "repeats_weekly" | "custom";
    start_date?: string;
    end_date?: string;
    weekly_repeat_interval?: number;
}

/** Stable id for a slot so repeat/custom state stays correct when slots are reordered by time. */
function getSlotId(slot: TimeSlot): string {
    return slot.volunteer_slot_id ?? slot.client_id ?? "";
}

interface DaySchedule {
    [key: string]: TimeSlot[];
}

interface APITimeSlot {
    volunteer_slot_id?: string;
    start_time: string;
    end_time: string;
    slot_type?: "repeats_weekly" | "custom";
    start_date?: string;
    end_date?: string;
    weekly_repeat_interval?: number;
    utc_start_time?: string;
    utc_end_time?: string;
}

interface APIScheduleFormat {
    day: string;
    slots: APITimeSlot[];
}

interface DeletedSlot {
    volunteer_slot_id: string;
    day: string;
}

interface TimePickerComponentProps {
    day: string;
    slot: TimeSlot;
    slotIndex: number;
    type: "start_time" | "end_time";
    handleTimeChange: (day: string, slotIndex: number, type: "start_time" | "end_time", value: string | null) => void;
    errors: { [key: string]: string[] };
    timePickerClass: string;
}

const TimePickerComponent = ({
    day,
    slot,
    slotIndex,
    type,
    handleTimeChange,
    errors,
    timePickerClass,
}: TimePickerComponentProps) => {
    const [selectedTime, setSelectedTime] = useState<dayjs.Dayjs | null>(
        type === "start_time"
            ? slot.start_time
                ? dayjs(slot.start_time, "HH:mm")
                : null
            : slot.end_time
                ? dayjs(slot.end_time, "HH:mm")
                : null
    );

    const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(selectedTime);

    // Sync state with props when slot changes
    useEffect(() => {
        const timeStr = type === "start_time" ? slot.start_time : slot.end_time;
        const newTime = timeStr ? dayjs(timeStr, "HH:mm") : null;
        setSelectedTime(newTime);
        setTempTime(newTime);
    }, [slot.start_time, slot.end_time, type]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileTimePicker
                format="h:mm A"
                value={tempTime}
                onChange={(time) => setTempTime(time)}
                onAccept={() => {
                    if (tempTime) {
                        setSelectedTime(tempTime);
                        handleTimeChange(day, slotIndex, type, tempTime.format("HH:mm"));
                    }
                }}
                closeOnSelect={false}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid var(--background-secondary-color) !important",
                        },
                    },
                }}
                className={cn(
                    timePickerClass,
                    errors[day]?.some((error) =>
                        error.includes(`Time slot ${slotIndex + 1}`)
                    ) && "border-red-500"
                )}
            />
        </LocalizationProvider>
    );
};

const MyScheduleModal: React.FC<MyScheduleModalProps> = ({ isOpen, onClose }) => {
    const [schedule, setSchedule] = useState<DaySchedule>({
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    });
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [deletedSlots, setDeletedSlots] = useState<DeletedSlot[]>([]);
    const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
    const [repeatFrequency, setRepeatFrequency] = useState<{
        [day: string]: { [slotId: string]: string };
    }>({});
    const [openDropdowns, setOpenDropdowns] = useState<{
        [day: string]: { [slotId: string]: boolean };
    }>({});
    const [customRecurrenceModalOpen, setCustomRecurrenceModalOpen] = useState(false);
    const [currentDayForCustom, setCurrentDayForCustom] = useState<string>("");
    const [currentSlotIdForCustom, setCurrentSlotIdForCustom] = useState<string>("");
    const [justSavedCustom, setJustSavedCustom] = useState(false);
    const [customRecurrenceData, setCustomRecurrenceData] = useState<{
        [day: string]: {
            [slotId: string]: {
                start_date: string;
                end_date: string | null;
                weekly_repeat_interval?: number;
            };
        };
    }>({});
    const queryClient = useQueryClient();
    const { volunteerUtcOffset } = useAppStore();
    const isMobileScreen = InnerWidth() < 768;

    useEffect(() => {
        // Only fetch when modal is open
        if (!isOpen) return;

        // Reset state when modal opens to avoid stale data
        setDeletedSlots([]);
        setCustomRecurrenceData({});
        setRepeatFrequency({});

        GET_API(endpoints.volunteer_slot.get)
            .then((res: any) => {
                const slotsData: APIScheduleFormat[] = Array.isArray(res?.data) ? res.data : [];

                const newSchedule: DaySchedule = {
                    Sunday: [],
                    Monday: [],
                    Tuesday: [],
                    Wednesday: [],
                    Thursday: [],
                    Friday: [],
                    Saturday: [],
                };

                if (slotsData.length === 0) {
                    setSchedule(newSchedule);
                    return;
                }

                // Initialize state objects to batch updates (keyed by slot id so reordering doesn't swap repeat type)
                const newCustomRecurrenceData: {
                    [day: string]: {
                        [slotId: string]: {
                            start_date: string;
                            end_date: string | null;
                            weekly_repeat_interval?: number;
                        };
                    };
                } = {};
                const newRepeatFrequency: { [day: string]: { [slotId: string]: string } } = {};

                // Populate the schedule with API data
                slotsData.forEach((dayData: APIScheduleFormat) => {
                    const dayName = dayData.day;
                    if (dayName && dayData.slots && Array.isArray(dayData.slots)) {
                        newSchedule[dayName] = dayData.slots.map((slot: APITimeSlot, slotIndex: number) => {
                            const slotId = slot.volunteer_slot_id ?? `load_${dayName}_${slotIndex}`;
                            return {
                                volunteer_slot_id: slot.volunteer_slot_id,
                                client_id: slotId,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                slot_type: slot.slot_type || "repeats_weekly",
                                start_date: slot.start_date,
                                end_date: slot.end_date,
                                weekly_repeat_interval: slot.weekly_repeat_interval,
                            };
                        });

                        // Store custom recurrence data keyed by slot id so reordering doesn't swap repeat type
                        newSchedule[dayName].forEach((slot) => {
                            const slotId = getSlotId(slot);
                            if (!slotId) return;
                            if (!newRepeatFrequency[dayName]) newRepeatFrequency[dayName] = {};
                            if (slot.slot_type === "custom" && slot.start_date) {
                                if (!newCustomRecurrenceData[dayName])
                                    newCustomRecurrenceData[dayName] = {};
                                newCustomRecurrenceData[dayName][slotId] = {
                                    start_date: slot.start_date,
                                    end_date: slot.end_date ?? null,
                                    weekly_repeat_interval: slot.weekly_repeat_interval,
                                };
                                newRepeatFrequency[dayName][slotId] = "custom";
                            } else {
                                newRepeatFrequency[dayName][slotId] = "weekly";
                            }
                        });
                    }
                });

                // Batch all state updates together
                setSchedule(newSchedule);
                setCustomRecurrenceData(newCustomRecurrenceData);
                setRepeatFrequency(newRepeatFrequency);
            })
            .catch(() => {
                showToast({ message: "Failed to load schedule", type: "error" });
            });
    }, [isOpen]);

    // Add this useEffect to check for overlapping times whenever schedule changes
    useEffect(() => {
        const newErrors: { [key: string]: string[] } = {};

        days.forEach((day) => {
            const dayErrors: string[] = [];
            schedule[day].forEach((slot, index) => {
                const slotLabel = `Time slot ${index + 1}`;
                // One field empty: require both start and end
                if (slot.start_time && !slot.end_time) {
                    dayErrors.push(`${slotLabel}: Please select end time`);
                }
                if (!slot.start_time && slot.end_time) {
                    dayErrors.push(`${slotLabel}: Please select start time`);
                }
                // Both filled: no same time, no overlap
                if (slot.start_time && slot.end_time) {
                    if (slot.start_time === slot.end_time) {
                        dayErrors.push(`${slotLabel}: Start and end time cannot be the same`);
                    } else if (
                        convertTimeToMinutes(slot.end_time) - convertTimeToMinutes(slot.start_time) >
                        60
                    ) {
                        dayErrors.push(`${slotLabel}: Slot duration cannot exceed one hour`);
                    } else if (isTimeOverlapping(day, slot.start_time, slot.end_time, index)) {
                        dayErrors.push(`${slotLabel} overlaps with another slot`);
                    }
                }
            });
            if (dayErrors.length > 0) {
                newErrors[day] = dayErrors;
            }
        });

        setErrors(newErrors);
    }, [schedule]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".repeat-dropdown-container")) {
                setOpenDropdowns({});
            }
        };

        const hasOpenDropdown = Object.values(openDropdowns).some(
            (dayDropdowns) =>
                dayDropdowns &&
                typeof dayDropdowns === "object" &&
                Object.values(dayDropdowns).some(Boolean)
        );

        if (hasOpenDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [openDropdowns]);

    const isTimeOverlapping = (
        day: string,
        newFrom: string,
        newTo: string,
        currentIndex: number
    ): boolean => {
        if (!newFrom || !newTo) return false;

        const newFromMinutes = convertTimeToMinutes(newFrom);
        const newToMinutes = convertTimeToMinutes(newTo);

        return schedule[day].some((slot, index) => {
            if (index === currentIndex || !slot.start_time || !slot.end_time) return false;

            const existingFromMinutes = convertTimeToMinutes(slot.start_time);
            const existingToMinutes = convertTimeToMinutes(slot.end_time);

            return (
                (newFromMinutes >= existingFromMinutes && newFromMinutes < existingToMinutes) ||
                (newToMinutes > existingFromMinutes && newToMinutes <= existingToMinutes) ||
                (newFromMinutes <= existingFromMinutes && newToMinutes >= existingToMinutes)
            );
        });
    };

    const convertTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    // Modify handleTimeChange to remove error handling since it's now handled by useEffect
    const handleTimeChange = (
        day: string,
        slotIndex: number,
        type: "start_time" | "end_time",
        value: string | null
    ) => {
        const updatedSlot = {
            ...schedule[day][slotIndex],
            [type]: value ? dayjs(value, "HH:mm").format("HH:mm") : "",
        };

        if (
            updatedSlot.start_time &&
            updatedSlot.end_time &&
            dayjs(updatedSlot.start_time, "HH:mm").isAfter(dayjs(updatedSlot.end_time, "HH:mm"))
        ) {
            const temp = updatedSlot.start_time;
            updatedSlot.start_time = updatedSlot.end_time;
            updatedSlot.end_time = temp;
        }

        setSchedule((prev) => ({
            ...prev,
            [day]: prev[day]
                .map((slot, index) => (index === slotIndex ? updatedSlot : slot))
                .sort((a, b) =>
                    type === "start_time"
                        ? 0
                        : dayjs(a.start_time, "HH:mm").isBefore(dayjs(b.start_time, "HH:mm"))
                            ? -1
                            : 1
                ),
        }));
    };

    const addTimeSlot = (day: string) => {
        const newClientId = `new_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setSchedule((prev) => ({
            ...prev,
            [day]: [
                ...prev[day],
                {
                    start_time: "",
                    end_time: "",
                    slot_type: "repeats_weekly",
                    client_id: newClientId,
                },
            ],
        }));
        setRepeatFrequency((prev) => ({
            ...prev,
            [day]: { ...prev[day], [newClientId]: "weekly" },
        }));
    };

    const removeTimeSlot = (day: string, slotIndex: number) => {
        setSchedule((prev) => {
            const slotToRemove = prev[day][slotIndex];
            const slotId = getSlotId(slotToRemove);
            if (slotToRemove.volunteer_slot_id) {
                setDeletedSlots((prev) => {
                    if (
                        !prev.some(
                            (slot) => slot.volunteer_slot_id === slotToRemove.volunteer_slot_id
                        )
                    ) {
                        return [
                            ...prev,
                            { volunteer_slot_id: slotToRemove.volunteer_slot_id!, day },
                        ];
                    }
                    return prev;
                });
            }
            if (slotId) {
                setCustomRecurrenceData((prev) => {
                    const newData = { ...prev };
                    if (newData[day]?.[slotId]) {
                        delete newData[day][slotId];
                        if (Object.keys(newData[day]).length === 0) delete newData[day];
                    }
                    return newData;
                });
                setRepeatFrequency((prev) => {
                    const newFreq = { ...prev };
                    if (newFreq[day]?.[slotId]) {
                        delete newFreq[day][slotId];
                        if (Object.keys(newFreq[day]).length === 0) delete newFreq[day];
                    }
                    return newFreq;
                });
            }
            return {
                ...prev,
                [day]: prev[day].filter((_, index) => index !== slotIndex),
            };
        });
    };

    const formatScheduleForAPI = (): APIScheduleFormat[] => {
        return days.map((day) => ({
            day,
            slots: schedule[day]
                .filter((slot) => slot.start_time && slot.end_time) // Only include filled slots
                .map((slot) => {
                    const slotId = getSlotId(slot);
                    const frequencyValue = slotId ? repeatFrequency[day]?.[slotId] : undefined;
                    const slotType: "repeats_weekly" | "custom" =
                        slot.slot_type ||
                        (frequencyValue === "custom" ? "custom" : "repeats_weekly") ||
                        "repeats_weekly";
                    const isCustom = slotType === "custom";
                    const customData = slotId ? customRecurrenceData[day]?.[slotId] : undefined;

                    const apiSlot: APITimeSlot = {
                        volunteer_slot_id:
                            slot.volunteer_slot_id ||
                            generateTimeSlotId(slot.start_time, slot.end_time),
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        slot_type: slotType,
                        utc_start_time: convertToUTC(volunteerUtcOffset, slot.start_time),
                        utc_end_time: convertToUTC(volunteerUtcOffset, slot.end_time),
                    };

                    // Add start_date, end_date, and weekly_repeat_interval for custom recurrence
                    if (isCustom && customData) {
                        apiSlot.start_date = customData.start_date;
                        if (customData.end_date) {
                            apiSlot.end_date = customData.end_date;
                        }
                        if (customData.weekly_repeat_interval) {
                            apiSlot.weekly_repeat_interval = customData.weekly_repeat_interval;
                        }
                    }

                    // Add weekly_repeat_interval for repeats_weekly slots (default to 1 if not specified)
                    if (slotType === "repeats_weekly") {
                        apiSlot.weekly_repeat_interval = slot.weekly_repeat_interval || 1;
                    }

                    return apiSlot;
                }),
        }));
    };

    const handleSave = async () => {
        const formattedData = formatScheduleForAPI();
        const payload = {
            deleted_slots: deletedSlots,
            slots: formattedData,
        };
        const res = await PUT_API(endpoints.volunteer_slot.update, payload);
        if (res?.status === 201) {
            showToast({ message: "Schedule updated successfully", type: "success" });
        } else {
            showToast({ message: "Failed to update schedule", type: "error" });
        }
        return res;
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        invalidateKey: ["volunteer_slot"],
        success: () => {
            setDeletedSlots([]);
            onClose();
            queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
        },
        error: () => { },
    });

    // Add this CSS class to style the TimePicker input
    const timePickerClass = cn("!text-sm");

    // Add this function to check if there are any errors
    const hasErrors = () => {
        return Object.values(errors).some((dayErrors) => dayErrors.length > 0);
    };

    const toggleDay = (day: string) => {
        setExpandedDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const toggleRepeatDropdown = (day: string, slotId: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slotId]: !prev[day]?.[slotId],
            },
        }));
    };

    const handleRepeatFrequencyChange = (day: string, slotId: string, value: string) => {
        if (value === "custom") {
            setRepeatFrequency((prev) => ({
                ...prev,
                [day]: { ...prev[day], [slotId]: "custom" },
            }));
            setCurrentDayForCustom(day);
            setCurrentSlotIdForCustom(slotId);
            setCustomRecurrenceModalOpen(true);
        } else {
            setRepeatFrequency((prev) => ({
                ...prev,
                [day]: { ...prev[day], [slotId]: value },
            }));
            setSchedule((prev) => ({
                ...prev,
                [day]: prev[day].map((slot) =>
                    getSlotId(slot) === slotId
                        ? {
                            ...slot,
                            slot_type: "repeats_weekly",
                            start_date: undefined,
                            end_date: undefined,
                        }
                        : slot
                ),
            }));
            setCustomRecurrenceData((prev) => {
                const newData = { ...prev };
                if (newData[day]?.[slotId]) {
                    delete newData[day][slotId];
                    if (Object.keys(newData[day]).length === 0) delete newData[day];
                }
                return newData;
            });
        }
        setOpenDropdowns((prev) => ({
            ...prev,
            [day]: { ...prev[day], [slotId]: false },
        }));
    };

    const handleCustomRecurrenceSave = (data: {
        repeatEvery: number;
        repeatUnit: string;
        startDate: dayjs.Dayjs | null;
        endType: "never" | "date";
        endDate: dayjs.Dayjs | null;
    }) => {
        if (!data.startDate) {
            showToast({ message: "Please select a start date", type: "error" });
            return;
        }

        const startDateStr = data.startDate.format("YYYY-MM-DD");
        const endDateStr =
            data.endType === "date" && data.endDate ? data.endDate.format("YYYY-MM-DD") : null;

        // Update all states immediately
        setSchedule((prev) => ({
            ...prev,
            [currentDayForCustom]: prev[currentDayForCustom].map((slot) =>
                getSlotId(slot) === currentSlotIdForCustom
                    ? {
                        ...slot,
                        slot_type: "custom" as const,
                        start_date: startDateStr,
                        end_date:
                            data.endType === "date" && data.endDate
                                ? endDateStr || undefined
                                : undefined,
                    }
                    : slot
            ),
        }));

        setRepeatFrequency((prev) => ({
            ...prev,
            [currentDayForCustom]: {
                ...prev[currentDayForCustom],
                [currentSlotIdForCustom]: "custom",
            },
        }));

        setCustomRecurrenceData((prev) => ({
            ...prev,
            [currentDayForCustom]: {
                ...prev[currentDayForCustom],
                [currentSlotIdForCustom]: {
                    start_date: startDateStr,
                    end_date: endDateStr,
                    weekly_repeat_interval: data.repeatEvery,
                },
            },
        }));

        setJustSavedCustom(true);
        setCustomRecurrenceModalOpen(false);
        setCurrentDayForCustom("");
        setCurrentSlotIdForCustom("");

        // Reset the flag after modal is fully closed
        setTimeout(() => {
            setJustSavedCustom(false);
        }, 100);
    };

    const repeatOptions = [
        { label: "Repeats Weekly", value: "weekly" },
        { label: "Custom", value: "custom" },
    ];


    return (
        <SideModal
            title={isMobileScreen ? "" : "My Schedule"}
            onClose={onClose}
            saveButtonText="Save Schedule"
            cancelButtonText="Cancel"
            isOpen={isOpen}
            onSave={() => onSave({})}
            onCancel={onClose}
            isDisabled={hasErrors()}
            isLoading={isPending}
            modalWidth={430}
            hideHeaderDividerOnMobile
            mobileBgGray
        >
            <div>
                <div className="flex flex-col gap-1 px-5 py-4">
                    <p className="font-medium">Date and Time</p>
                    <p className="text-xs text-gray-light">
                        Select the dates and times that you are available teaching in a week.
                    </p>
                </div>
                <div>
                    <div className="flex flex-col gap-4 p-5 pt-0">
                        {days.map((day) => {
                            const isExpanded = expandedDays[day];
                            return (
                                <div
                                    key={day}
                                    className="flex flex-col gap-2 border bg-white md:bg-transparent border-gray-200 rounded-lg p-4"
                                >
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleDay(day)}
                                    >
                                        <p className="font-semibold">{day}</p>
                                        <ChevronRightIcon
                                            className={`transition-transform ${isExpanded ? "rotate-90" : ""
                                                }`}
                                        />
                                    </div>
                                    {isExpanded && (
                                        <div className="flex items-start justify-between gap-2 pt-2">
                                            <div className="flex flex-col items-center gap-2 w-full px-1">
                                                {schedule[day].length > 0 ? (
                                                    schedule[day].map((slot, slotIndex) => (
                                                        <div
                                                            key={slotIndex}
                                                            className="flex flex-col gap-2"
                                                        >
                                                            <div
                                                                key={slotIndex}
                                                                className="flex gap-2 items-center"
                                                            >
                                                                <div>
                                                                    <TimePickerComponent
                                                                        day={day}
                                                                        slot={slot}
                                                                        slotIndex={slotIndex}
                                                                        type="start_time"
                                                                        handleTimeChange={handleTimeChange}
                                                                        errors={errors}
                                                                        timePickerClass={timePickerClass}
                                                                    />
                                                                </div>
                                                                <p className="text-sm font-medium">
                                                                    to
                                                                </p>
                                                                <div>
                                                                    <TimePickerComponent
                                                                        day={day}
                                                                        slot={slot}
                                                                        slotIndex={slotIndex}
                                                                        type="end_time"
                                                                        handleTimeChange={handleTimeChange}
                                                                        errors={errors}
                                                                        timePickerClass={timePickerClass}
                                                                    />
                                                                </div>
                                                                <span
                                                                    onClick={() =>
                                                                        removeTimeSlot(
                                                                            day,
                                                                            slotIndex
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                                >
                                                                    <TrashIcon />
                                                                </span>
                                                            </div>
                                                            {errors[day]?.map(
                                                                (error, errorIndex) =>
                                                                    error.includes(
                                                                        `Time slot ${slotIndex + 1}`
                                                                    ) && (
                                                                        <p
                                                                            key={errorIndex}
                                                                            className="text-xs text-red-500"
                                                                        >
                                                                            {error}
                                                                        </p>
                                                                    )
                                                            )}
                                                            <div className="relative pt-2 repeat-dropdown-container">
                                                                {(() => {
                                                                    const slotId = getSlotId(slot);
                                                                    return (
                                                                        <>
                                                                            <div
                                                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-gray-300 transition-colors"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleRepeatDropdown(
                                                                                        day,
                                                                                        slotId
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {slot?.slot_type ===
                                                                                        "custom"
                                                                                        ? "Custom"
                                                                                        : (repeatFrequency[
                                                                                            day
                                                                                        ]?.[
                                                                                            slotId
                                                                                        ]
                                                                                            ? repeatOptions.find(
                                                                                                (
                                                                                                    opt
                                                                                                ) =>
                                                                                                    opt.value ===
                                                                                                    repeatFrequency[
                                                                                                    day
                                                                                                    ]?.[
                                                                                                    slotId
                                                                                                    ]
                                                                                            )
                                                                                                ?.label
                                                                                            : null) ||
                                                                                        "Repeats Weekly"}
                                                                                </span>
                                                                                <svg
                                                                                    width="20"
                                                                                    height="20"
                                                                                    viewBox="0 0 20 20"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className={cn(
                                                                                        "transition-transform duration-200",
                                                                                        openDropdowns[
                                                                                            day
                                                                                        ]?.[slotId]
                                                                                            ? "rotate-90"
                                                                                            : ""
                                                                                    )}
                                                                                >
                                                                                    <path
                                                                                        d="M7.5 5L12.5 10L7.5 15"
                                                                                        stroke="#121212"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                </svg>
                                                                            </div>
                                                                            {openDropdowns[day]?.[
                                                                                slotId
                                                                            ] && (
                                                                                    <div
                                                                                        className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                                                                                        onClick={(e) =>
                                                                                            e.stopPropagation()
                                                                                        }
                                                                                    >
                                                                                        {repeatOptions.map(
                                                                                            (
                                                                                                option
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        option.value
                                                                                                    }
                                                                                                    className={cn(
                                                                                                        "flex items-center justify-between p-3 text-sm cursor-pointer transition-colors",
                                                                                                        repeatFrequency[
                                                                                                            day
                                                                                                        ]?.[
                                                                                                            slotId
                                                                                                        ] ===
                                                                                                            option.value ||
                                                                                                            (!repeatFrequency[
                                                                                                                day
                                                                                                            ]?.[
                                                                                                                slotId
                                                                                                            ] &&
                                                                                                                option.value ===
                                                                                                                "weekly")
                                                                                                            ? "bg-gray-50 text-gray-900 font-medium"
                                                                                                            : "text-gray-700 hover:bg-gray-50"
                                                                                                    )}
                                                                                                    onClick={() =>
                                                                                                        handleRepeatFrequencyChange(
                                                                                                            day,
                                                                                                            slotId,
                                                                                                            option.value
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <span>
                                                                                                        {
                                                                                                            option.label
                                                                                                        }
                                                                                                    </span>
                                                                                                    {(repeatFrequency[
                                                                                                        day
                                                                                                    ]?.[
                                                                                                        slotId
                                                                                                    ] ===
                                                                                                        option.value ||
                                                                                                        (!repeatFrequency[
                                                                                                            day
                                                                                                        ]?.[
                                                                                                            slotId
                                                                                                        ] &&
                                                                                                            option.value ===
                                                                                                            "weekly")) && (
                                                                                                            <CheckIcon />
                                                                                                        )}
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500 font-medium border border-stroke-light text-center rounded-xl px-3 py-1.5 w-[267px]">
                                                        No Schedules
                                                    </div>
                                                )}
                                            </div>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addTimeSlot(day);
                                                }}
                                                className="text-primary mt-1.5 hover:opacity-80 w-fit"
                                            >
                                                <AddSlotIcon />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <CustomRecurrenceModal
                isOpen={customRecurrenceModalOpen}
                initialData={
                    currentDayForCustom && currentSlotIdForCustom
                        ? (() => {
                            const customData =
                                customRecurrenceData[currentDayForCustom]?.[
                                currentSlotIdForCustom
                                ];
                            const slotData = schedule[currentDayForCustom]?.find(
                                (s) => getSlotId(s) === currentSlotIdForCustom
                            );

                            // Prefer customRecurrenceData, fallback to slotData
                            if (customData) {
                                return {
                                    start_date: customData.start_date,
                                    end_date: customData.end_date,
                                    repeatEvery: customData.weekly_repeat_interval || 0,
                                };
                            } else if (slotData?.slot_type === "custom" && slotData.start_date) {
                                return {
                                    start_date: slotData.start_date,
                                    end_date: slotData.end_date,
                                    repeatEvery: 2,
                                };
                            }
                            return undefined;
                        })()
                        : undefined
                }
                onClose={() => {
                    const wasJustSaved = justSavedCustom;
                    const day = currentDayForCustom;
                    const slotId = currentSlotIdForCustom;

                    setCustomRecurrenceModalOpen(false);
                    setCurrentDayForCustom("");
                    setCurrentSlotIdForCustom("");

                    if (!wasJustSaved && day && slotId) {
                        setTimeout(() => {
                            setSchedule((prev) => ({
                                ...prev,
                                [day]: prev[day].map((s) => {
                                    if (getSlotId(s) !== slotId) return s;
                                    const hasCustomData = s.slot_type === "custom" && s.start_date;
                                    if (!hasCustomData) {
                                        return {
                                            ...s,
                                            slot_type: "repeats_weekly",
                                            start_date: undefined,
                                            end_date: undefined,
                                        };
                                    }
                                    return s;
                                }),
                            }));
                            setRepeatFrequency((prev) => {
                                const freq = prev[day]?.[slotId];
                                if (freq !== "custom") {
                                    return { ...prev, [day]: { ...prev[day], [slotId]: "weekly" } };
                                }
                                return prev;
                            });
                        }, 0);
                    }

                    // Reset the flag after a delay to ensure state updates are processed
                    if (wasJustSaved) {
                        setTimeout(() => {
                            setJustSavedCustom(false);
                        }, 100);
                    } else {
                        setJustSavedCustom(false);
                    }
                }}
                onSave={handleCustomRecurrenceSave}
            />
        </SideModal>
    );
};

export default MyScheduleModal;
