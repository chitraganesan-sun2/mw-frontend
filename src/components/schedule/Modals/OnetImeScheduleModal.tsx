import SideModal from "@/components/common/Modals/SideModal";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// Commits the displayed time on OK - see CommitActionBar for the MUI onAccept quirk.
import CommitActionBar from "@/components/common/Input/Picker/CommitActionBar";
import { useAppStore } from "@/store/useAppStore";
import TrashIcon from "@/assets/icons/TrashIcon";
import AddSlotIcon from "@/assets/icons/AddSlotIcon";
import { generateTimeSlotId, extractTimezoneOffset } from "@/utils/timeFunctions";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { Spin } from "antd";
import {
    formatSessionDate,
    formatSessionTime,
    formatTimeRange,
    isOvernightRange,
    minuteRangesOverlap,
    shortTimeZone,
    slotMinuteRange,
    profileTimeZoneIana,
} from "@/utils/sessionDisplay";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface OnetImeScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    isMobileScreen: boolean;
    currentDate: string;
}

interface TimePickerComponentProps {
    value: string;
    onChange: (value: string) => void;
    disabledTimes?: string[];
    error?: boolean;
    volunteerTimezone: string;
    currentDate: string;
    existingSlots: Slot[];
    /** End picker: an end earlier than "now" on today is an overnight end (next day), not past. */
    isEndPicker?: boolean;
}


interface Slot {
    start_time: string;
    end_time: string;
    title?: string;
    volunteer_slot_id?: string;
}

// Hoisted out of OnetImeScheduleModal: defining this inline in the parent's render
// body would give it a new function identity on every parent re-render (e.g. the
// header's unread-count poll), forcing React to unmount/remount it - which silently
// closes an open MobileTimePicker dialog and resets its internal state.
const TimePickerComponent: React.FC<TimePickerComponentProps> = ({
    value,
    onChange,
    error,
    volunteerTimezone,
    currentDate,
    existingSlots,
    isEndPicker,
}) => {
    const getNowInVolunteerTimezone = () => dayjs.tz(undefined, volunteerTimezone || "UTC");

    const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(
        value ? dayjs.tz(value, "HH:mm", volunteerTimezone || "UTC") : null
    );
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        setTempTime(value ? dayjs.tz(value, "HH:mm", volunteerTimezone || "UTC") : null);
    }, [value, volunteerTimezone]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileTimePicker
                format="h:mm A"
                minutesStep={1}
                timezone={volunteerTimezone || "UTC"}
                value={tempTime}
                open={pickerOpen}
                onChange={(time) => setTempTime(time)}
                onOpen={() => {
                    setPickerOpen(true);
                    if (!tempTime) {
                        // Default to current minute in volunteer's timezone
                        const nowInTz = getNowInVolunteerTimezone();
                        setTempTime(nowInTz.second(0));
                    }
                }}
                onClose={() => {
                    // A genuine cancel/dismiss (backdrop click, Escape) - discard the
                    // in-progress draft and fall back to the last committed value.
                    setPickerOpen(false);
                    setTempTime(value ? dayjs.tz(value, "HH:mm", volunteerTimezone || "UTC") : null);
                }}
                closeOnSelect={false}
                slots={{ actionBar: CommitActionBar }}
                shouldDisableTime={(timeValue: dayjs.Dayjs, clockType: string) => {
                    const nowInTz = getNowInVolunteerTimezone();
                    const isToday = currentDate === nowInTz.format("YYYY-MM-DD");

                    // Keep blocking past times for current day.
                    if (!isEndPicker && isToday && timeValue.isBefore(nowInTz, "minute")) {
                        return true;
                    }

                    // Only restrict booked values in the minute picker.
                    // This allows selecting the same hour again (e.g. 4:30 after 4:20 is booked).
                    if (clockType === "minutes") {
                        const timeStr = timeValue.format("HH:mm");
                        return existingSlots.some((slot) => {
                            if (!slot.start_time || !slot.end_time) return false;
                            // An overnight slot occupies [start, midnight) on this date.
                            if (isOvernightRange(slot.start_time, slot.end_time)) return timeStr >= slot.start_time;
                            return timeStr >= slot.start_time && timeStr < slot.end_time;
                        });
                    }

                    return false;
                }}
                slotProps={{
                    actionBar: {
                        onCancelClick: () => setPickerOpen(false),
                        onAcceptClick: () => {
                            if (tempTime) {
                                onChange(tempTime.format("HH:mm"));
                            }
                            setPickerOpen(false);
                        },
                    } as any,
                    textField: {
                        sx: {
                            ...(error
                                ? { border: "2px solid #ef4444", borderRadius: "12px" }
                                : {}),
                            "@media (max-width: 767px)": {
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#F4F7FB",
                                },
                            },
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

const OnetImeScheduleModal = ({
    isOpen,
    onClose,
    isMobileScreen,
    currentDate,
}: OnetImeScheduleModalProps) => {
    const [isPending, setIsPending] = useState(false);
    const [slots, setSlots] = useState<Slot[]>([{ start_time: "", end_time: "" }]);
    const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
    const [invalidSlots, setInvalidSlots] = useState<number[]>([]);
    const queryClient = useQueryClient();
    const [isAvailableDaysLoading, setIsAvailableDaysLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    // Full-label aware (Arizona / Saskatchewan / Puerto Rico have no daylight saving).
    const ianaTimezone = profileTimeZoneIana(timezoneRaw);

    // Use IANA timezone name if available, otherwise raw abbreviation
    const volunteerTimezone = ianaTimezone || rawAbbreviation;

    // Get current time in volunteer's timezone
    const getNowInVolunteerTimezone = () => {
        return dayjs.tz(undefined, volunteerTimezone || "UTC");
    };

    // Abbreviation in effect on this date (EST/EDT, NST/NDT) - and "IST" rather than
    // Intl's "GMT+5:30".
    const activeAbbreviation = shortTimeZone(timezoneRaw || rawAbbreviation, currentDate || undefined);

    const getAvailableDaysForDate = async () => {
        if (currentDate !== "") {
            setIsAvailableDaysLoading(true);
            const response = await GET_API(
                endpoints.volunteer_slot.getAvailableDaysForDate(currentDate)
            );
            setExistingSlots(response.data.slots || []);
            setIsAvailableDaysLoading(false);
            if (slots.length === 0 && isOpen) {
                addSlot();
            }
            return response.data;
        }
    };
    const { data: availableDays, isLoading } = useQuery({
        queryKey: ["availableDays", currentDate],
        queryFn: () => getAvailableDaysForDate(),
        // No date picked yet: the queryFn returned undefined, which React Query rejects
        // ("Query data cannot be undefined") on every schedule page load.
        enabled: currentDate !== "",
    });

    useEffect(() => {
        if (availableDays && availableDays.slots) {
            setExistingSlots(availableDays.slots);
        }
    }, [availableDays]);

    useEffect(() => {
        if (slots.length === 0 && isOpen) {
            addSlot();
        }
    }, [isOpen]);


    const handleSubmit = () => {
        // Check if any slot is partially filled
        const hasPartiallyFilled = slots.some(slot => (slot.start_time && !slot.end_time) || (!slot.start_time && slot.end_time));
        if (hasPartiallyFilled) {
            showToast({
                message: "Please fill both start and end times for all slots.",
                type: "error",
            });
            return;
        }

        // Filter out completely empty slots for the final submission
        const finalSlots = slots.filter((slot) => slot.start_time && slot.end_time);

        if (finalSlots.length === 0) {
            showToast({
                message: "Please select at least one valid slot before saving.",
                type: "error",
            });
            return;
        }

        // Check for slots with same start and end time
        const hasSameTimeSlots = finalSlots.some(slot => slot.start_time === slot.end_time);
        if (hasSameTimeSlots) {
            showToast({
                message: "Start and end times cannot be the same.",
                type: "error",
            });
            return;
        }

        // Enforce max slot duration of 60 minutes (an end before the start crosses midnight).
        const hasMoreThanOneHourSlot = finalSlots.some((slot) => {
            const [start, end] = slotMinuteRange(slot.start_time, slot.end_time);
            return end - start > 60;
        });
        if (hasMoreThanOneHourSlot) {
            showToast({
                message: "Each slot must be within one hour.",
                type: "error",
            });
            return;
        }

        // Re-derive fresh rather than trusting `invalidSlots` state, in case existingSlots
        // resolved after the user last touched a time field and the effect hasn't caught
        // up yet - submitting must never rely on a possibly-stale validity flag.
        const freshInvalidSlots = computeInvalidSlots(slots, existingSlots);
        if (freshInvalidSlots.length > 0) {
            setInvalidSlots(freshInvalidSlots);
            showToast({
                message: "Please fix invalid or overlapping slots before submitting.",
                type: "error",
            });
            return;
        }
        setIsSaving(true);
        const formattedData = finalSlots.map((slot) => ({
            date: dayjs(currentDate, "YYYY-MM-DD").format("DD-MM-YYYY"),
            volunteer_slot_id: generateTimeSlotId(slot.start_time, slot.end_time),
            start_time: slot.start_time,
            end_time: slot.end_time,
        }));
        POST_API(endpoints.volunteer_slot.createSlotForParticularDate, formattedData)
            .then((res) => {
                onClose();
                showToast({
                    message: "Slots created successfully",
                    type: "success",
                });
                setSlots([]);
                setExistingSlots([]);
                queryClient.invalidateQueries({
                    queryKey: ["volunteer-events"],
                });
                queryClient.invalidateQueries({
                    queryKey: ["availableDays", currentDate],
                });
                // Schedule dashboard's availability list (shares the editors' key prefix).
                queryClient.invalidateQueries({ queryKey: ["volunteer_slot"] });
            })
            .catch((err) => {
                // The backend re-validates (past time, overlap, > 1 hour) - say which.
                showToast({
                    message: getApiErrorMessage(err, "Couldn't create the slots. Please try again."),
                    type: "error",
                });
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    const addSlot = () => setSlots([...slots, { start_time: "", end_time: "" }]);
    const removeSlot = (index: number) => {
        setSlots((prevSlots) => prevSlots.filter((_, i) => i !== index));
        setInvalidSlots((prevInvalid) =>
            prevInvalid.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
        );
    };

    function areSlotsOverlapping(
        slotA: { start_time: string; end_time: string },
        slotB: { start_time: string; end_time: string }
    ) {
        if (!slotA.start_time || !slotA.end_time || !slotB.start_time || !slotB.end_time)
            return false;
        // Wrap-aware: an overnight slot runs to end + 24h on this date.
        return minuteRangesOverlap(
            slotMinuteRange(slotA.start_time, slotA.end_time),
            slotMinuteRange(slotB.start_time, slotB.end_time)
        );
    }

    // Pulled out so it can be re-run whenever `existingSlots` itself changes (e.g. its
    // fetch resolves after the user already picked times), not only from handleTimeChange -
    // otherwise a slot picked while existingSlots was still [] never gets re-checked once
    // the real data arrives, and an overlapping slot could be submitted with no warning.
    const computeInvalidSlots = (slotsToCheck: Slot[], existingSlotsToCheck: Slot[]) => {
        const newInvalidSlots: number[] = [];

        slotsToCheck.forEach((slotA, idxA) => {
            if (!slotA.start_time || !slotA.end_time) return;

            // 1. Check for overlaps/duplicates with OTHER NEW slots
            slotsToCheck.forEach((slotB, idxB) => {
                if (idxA === idxB) return;
                if (!slotB.start_time || !slotB.end_time) return;

                if (areSlotsOverlapping(slotA, slotB)) {
                    if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
                    if (!newInvalidSlots.includes(idxB)) newInvalidSlots.push(idxB);
                }
            });

            // 2. Check for overlaps with EXISTING slots
            const hasExistingOverlap = existingSlotsToCheck.some((existingSlot) => areSlotsOverlapping(slotA, existingSlot));

            if (hasExistingOverlap) {
                if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
            }
            // 3. Check for same start and end time
            if (slotA.start_time === slotA.end_time) {
                if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
            }

            // 4. Check for durations more than one hour (overnight-aware)
            const [slotStart, slotEnd] = slotMinuteRange(slotA.start_time, slotA.end_time);
            if (slotEnd - slotStart > 60) {
                if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
            }
        });

        return newInvalidSlots;
    };

    // Re-validate against the latest existingSlots whenever it changes (see comment above).
    useEffect(() => {
        setInvalidSlots(computeInvalidSlots(slots, existingSlots));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingSlots]);

    const handleTimeChange = (
        index: number,
        type: "start_time" | "end_time",
        value: string | null
    ) => {
        const updatedSlots = slots.map((slot) => ({ ...slot }));
        updatedSlots[index][type] = value || "";

        // No start/end swap: an end before the start is an overnight slot (11:30 PM - 12:30 AM),
        // which the swap used to turn into 00:30-23:30 and then reject as > 1 hour.

        setInvalidSlots(computeInvalidSlots(updatedSlots, existingSlots));
        setSlots(updatedSlots);
    };

    // Collect all start and end times from existingSlots
    const disabledTimes = [
        ...existingSlots.map((slot) => slot.start_time),
        ...existingSlots.map((slot) => slot.end_time),
    ];

    const handleClose = () => {
        setSlots([]);
        setInvalidSlots([]);
        onClose();
    };

    return (
        <SideModal
            title={formatSessionDate(currentDate)}
            onClose={handleClose}
            isOpen={isOpen}
            onSave={handleSubmit}
            isLoading={isPending || isSaving}
            onCancel={handleClose}
            modalWidth={isMobileScreen ? 600 : 400}
        >
            {isAvailableDaysLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Spin />
                </div>
            ) : (
                <div className="flex flex-col max-lg:gap-3 px-5 mt-7">
                    <Input
                        name="selected_date"
                        onChange={() => { }}
                        key={"selected_date"}
                        label={`Select Date ${activeAbbreviation ? ` (${activeAbbreviation})` : ""}`}
                        labelClassName="!text-[1rem] !font-medium"
                        inputType="datepicker"
                        placeholder="Select a date"
                        value={currentDate ? dayjs(currentDate, "YYYY-MM-DD").toDate() : new Date()}
                        required={true}
                        disabled={true}
                        error={""}
                        inputClassName="md:!bg-white !bg-[#E0E0E0] hover:!bg-[#E0E0E0] focus:!bg-[#E0E0E0] max-md:!text-[#4F4F4F] max-md:placeholder:!text-[#4F4F4F]"
                    />

                    <div className="border-b border-gray-200 pb-6">
                        <p className="font-medium mt-4">Existing Slots</p>
                        {existingSlots.length === 0 && (
                            <p className="text-gray-500 mt-1">No slots for this date.</p>
                        )}
                        {existingSlots
                            .filter((slot) => {
                                const nowInTz = getNowInVolunteerTimezone();
                                if (currentDate === nowInTz.format("YYYY-MM-DD")) {
                                    const slotStart = dayjs.tz(
                                        `${currentDate} ${slot.start_time}`,
                                        "YYYY-MM-DD HH:mm",
                                        volunteerTimezone || "UTC"
                                    );
                                    return slotStart.isAfter(nowInTz);
                                }
                                return true;
                            })
                            .map((slot, idx) => (
                                <div
                                    key={idx}
                                    className="md:border border-gray-200 rounded-lg  flex flex-col lg:p-[5px] md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mt-2 w-full"
                                >
                                    {/* Mobile: start/time pills + "to" */}
                                    <div className="flex items-center gap-2 w-full md:hidden">
                                        <span className="rounded-lg bg-[#E0E0E0] w-full px-3 py-2 text-sm font-medium text-[#121212]">
                                            {dayjs(slot.start_time, "HH:mm").format("h:mm A")}
                                        </span>
                                        <span className="text-sm text-gray-500">to</span>
                                        <span className="rounded-lg bg-[#E0E0E0] px-3 w-full py-2 text-sm font-medium text-[#121212]">
                                            {formatSessionTime(slot.end_time)}
                                            {isOvernightRange(slot.start_time, slot.end_time) ? " (next day)" : ""}
                                        </span>
                                    </div>
                                    {/* Desktop: title + time range */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                        <span className="text-sm font-medium text-[#121212]">
                                            {slot.title || "Available"}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline text-sm text-gray-500 font-medium">
                                        {formatTimeRange(slot.start_time, slot.end_time)}
                                    </span>
                                </div>
                            ))}
                    </div>

                    <div>
                        <p className="font-medium mt-4">Create New Slots</p>
                        {slots.map((slot, idx) => (
                            <React.Fragment key={idx}>
                            <div className="flex items-center gap-2 mt-2">
                                <TimePickerComponent
                                    value={slot.start_time}
                                    onChange={(val) => handleTimeChange(idx, "start_time", val)}
                                    error={invalidSlots.includes(idx)}
                                    disabledTimes={disabledTimes}
                                    volunteerTimezone={volunteerTimezone}
                                    currentDate={currentDate}
                                    existingSlots={existingSlots}
                                />
                                <span>to</span>
                                <TimePickerComponent
                                    value={slot.end_time}
                                    onChange={(val) => handleTimeChange(idx, "end_time", val)}
                                    error={invalidSlots.includes(idx)}
                                    disabledTimes={disabledTimes}
                                    volunteerTimezone={volunteerTimezone}
                                    currentDate={currentDate}
                                    existingSlots={existingSlots}
                                    isEndPicker
                                />
                                <button
                                    type="button"
                                    onClick={addSlot}
                                    className="mt- text-primary flex items-center"
                                >
                                    {idx === slots.length - 1 && <AddSlotIcon />}
                                </button>
                                {slots.length > 1 && (
                                    <button
                                        type="button"
                                        aria-label="Remove slot"
                                        onClick={() => removeSlot(idx)}
                                        className="cursor-pointer text-red-500 appearance-none border-0 bg-transparent p-0 leading-none"
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>
                            {isOvernightRange(slot.start_time, slot.end_time) && (
                                <p className="text-xs text-gray-600 mt-1">{formatTimeRange(slot.start_time, slot.end_time)}</p>
                            )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </SideModal>
    );
};

export default OnetImeScheduleModal;
