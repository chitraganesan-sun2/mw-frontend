"use client";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/icons/TrashIcon";
import cn from "classnames";
import dayjs from "dayjs";
import AddSlotIcon from "@/assets/icons/AddSlotIcon";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import CheckIcon from "@/assets/icons/CheckIcon";
import CustomRecurrenceModal from "@/components/schedule/Modals/CustomRecurrenceModal";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { TimeSlot, UseScheduleSlotsResult } from "@/hooks/schedule/useScheduleSlots";
import { getSlotId } from "@/hooks/schedule/useScheduleSlots";

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
            ? slot.start_time ? dayjs(slot.start_time, "HH:mm") : null
            : slot.end_time ? dayjs(slot.end_time, "HH:mm") : null
    );

    const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(selectedTime);

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
                    errors[day]?.some((error) => error.includes(`Time slot ${slotIndex + 1}`)) && "border-red-500"
                )}
            />
        </LocalizationProvider>
    );
};

const repeatOptions = [
    { label: "Repeats Weekly", value: "weekly" },
    { label: "Custom", value: "custom" },
];

interface ScheduleSlotEditorProps extends UseScheduleSlotsResult { }

// Pure presentational rendering of the day-card list, driven entirely by useScheduleSlots'
// return value. No fetching, no modal chrome - MyScheduleModal wraps this in SideModal,
// ScheduleAvailabilitySection renders it inline.
const ScheduleSlotEditor: React.FC<ScheduleSlotEditorProps> = ({
    days,
    schedule,
    errors,
    expandedDays,
    toggleDay,
    repeatFrequency,
    openDropdowns,
    toggleRepeatDropdown,
    handleRepeatFrequencyChange,
    customRecurrenceModalOpen,
    currentDayForCustom,
    currentSlotIdForCustom,
    customRecurrenceData,
    handleCustomRecurrenceSave,
    closeCustomRecurrenceModal,
    handleTimeChange,
    addTimeSlot,
    removeTimeSlot,
}) => {
    const timePickerClass = cn("!text-sm");

    return (
        <div>
            <div className="flex flex-col gap-1 px-5 py-4">
                <p className="font-medium">Date and Time</p>
                <p className="text-xs text-gray-light">
                    Select the dates and times that you are available in a week.
                </p>
            </div>
            <div>
                <div className="flex flex-col gap-4 p-5 pt-0">
                    {days.map((day) => {
                        const isExpanded = expandedDays[day];
                        return (
                            <div key={day} className="flex flex-col gap-2 border bg-white md:bg-transparent border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleDay(day)}>
                                    <p className="font-semibold">{day}</p>
                                    <ChevronRightIcon className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                </div>
                                {isExpanded && (
                                    <div className="flex items-start justify-between gap-2 pt-2">
                                        <div className="flex flex-col items-center gap-2 w-full px-1">
                                            {schedule[day].length > 0 ? (
                                                schedule[day].map((slot, slotIndex) => (
                                                    <div key={slotIndex} className="flex flex-col gap-2">
                                                        <div className="flex gap-2 items-center">
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
                                                            <p className="text-sm font-medium">to</p>
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
                                                                onClick={() => removeTimeSlot(day, slotIndex)}
                                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                            >
                                                                <TrashIcon />
                                                            </span>
                                                        </div>
                                                        {errors[day]?.map(
                                                            (error, errorIndex) =>
                                                                error.includes(`Time slot ${slotIndex + 1}`) && (
                                                                    <p key={errorIndex} className="text-xs text-red-500">
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
                                                                                toggleRepeatDropdown(day, slotId);
                                                                            }}
                                                                        >
                                                                            <span className="text-sm font-medium text-gray-700">
                                                                                {slot?.slot_type === "custom"
                                                                                    ? "Custom"
                                                                                    : (repeatFrequency[day]?.[slotId]
                                                                                        ? repeatOptions.find((opt) => opt.value === repeatFrequency[day]?.[slotId])?.label
                                                                                        : null) || "Repeats Weekly"}
                                                                            </span>
                                                                            <svg
                                                                                width="20"
                                                                                height="20"
                                                                                viewBox="0 0 20 20"
                                                                                fill="none"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className={cn(
                                                                                    "transition-transform duration-200",
                                                                                    openDropdowns[day]?.[slotId] ? "rotate-90" : ""
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
                                                                        {openDropdowns[day]?.[slotId] && (
                                                                            <div
                                                                                className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                {repeatOptions.map((option) => (
                                                                                    <div
                                                                                        key={option.value}
                                                                                        className={cn(
                                                                                            "flex items-center justify-between p-3 text-sm cursor-pointer transition-colors",
                                                                                            repeatFrequency[day]?.[slotId] === option.value ||
                                                                                                (!repeatFrequency[day]?.[slotId] && option.value === "weekly")
                                                                                                ? "bg-gray-50 text-gray-900 font-medium"
                                                                                                : "text-gray-700 hover:bg-gray-50"
                                                                                        )}
                                                                                        onClick={() => handleRepeatFrequencyChange(day, slotId, option.value)}
                                                                                    >
                                                                                        <span>{option.label}</span>
                                                                                        {(repeatFrequency[day]?.[slotId] === option.value ||
                                                                                            (!repeatFrequency[day]?.[slotId] && option.value === "weekly")) && (
                                                                                                <CheckIcon />
                                                                                            )}
                                                                                    </div>
                                                                                ))}
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
            <CustomRecurrenceModal
                isOpen={customRecurrenceModalOpen}
                initialData={
                    currentDayForCustom && currentSlotIdForCustom
                        ? (() => {
                            const customData = customRecurrenceData[currentDayForCustom]?.[currentSlotIdForCustom];
                            const slotData = schedule[currentDayForCustom]?.find((s) => getSlotId(s) === currentSlotIdForCustom);

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
                onClose={closeCustomRecurrenceModal}
                onSave={handleCustomRecurrenceSave}
            />
        </div>
    );
};

export default ScheduleSlotEditor;
