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
import { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { useAppStore } from "@/store/useAppStore";
import TrashIcon from "@/assets/icons/TrashIcon";
import AddSlotIcon from "@/assets/icons/AddSlotIcon";
import { generateTimeSlotId, extractTimezoneOffset } from "@/utils/timeFunctions";
import { showToast } from "@/components/common/Toast";
import { Spin } from "antd";

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

interface Slot {
    start_time: string;
    end_time: string;
    title?: string;
    volunteer_slot_id?: string;
}

// MUI's own OK button only calls `onAccept` when the *committed* value differs
// from what it last considered "published" - but our default-time seeding (below,
// in onOpen) sets the controlled `value` directly, which MUI treats as already
// published+committed in the same pass. So clicking OK without first touching the
// clock face never fires `onAccept` at all. A custom action bar sidesteps MUI's
// internal diffing entirely and always commits whatever is currently displayed.
function TimeSlotActionBar(props: PickersActionBarProps) {
    const { className } = props;
    const { onCancelClick, onAcceptClick } = props as unknown as {
        onCancelClick: () => void;
        onAcceptClick: () => void;
    };
    return (
        <DialogActions className={className}>
            <Button onClick={onCancelClick}>Cancel</Button>
            <Button onClick={onAcceptClick}>OK</Button>
        </DialogActions>
    );
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
                slots={{ actionBar: TimeSlotActionBar }}
                shouldDisableTime={(timeValue: dayjs.Dayjs, clockType: string) => {
                    const nowInTz = getNowInVolunteerTimezone();
                    const isToday = currentDate === nowInTz.format("YYYY-MM-DD");

                    // Keep blocking past times for current day.
                    if (isToday && timeValue.isBefore(nowInTz, "minute")) {
                        return true;
                    }

                    // Only restrict booked values in the minute picker.
                    // This allows selecting the same hour again (e.g. 4:30 after 4:20 is booked).
                    if (clockType === "minutes") {
                        const timeStr = timeValue.format("HH:mm");
                        return existingSlots.some((slot) => {
                            if (!slot.start_time || !slot.end_time) return false;
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

    const ianaTimezone = timezoneMapping[rawAbbreviation] || null;

    // Use IANA timezone name if available, otherwise raw abbreviation
    const volunteerTimezone = ianaTimezone || rawAbbreviation;

    // Get current time in volunteer's timezone
    const getNowInVolunteerTimezone = () => {
        return dayjs.tz(undefined, volunteerTimezone || "UTC");
    };

    // Get the current active abbreviation (handles NST -> NDT transition)
    const activeAbbreviation = ianaTimezone
        ? dayjs().tz(ianaTimezone).format("z")
        : rawAbbreviation;

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

        // Enforce max slot duration of 60 minutes.
        const hasMoreThanOneHourSlot = finalSlots.some((slot) => {
            const start = dayjs(slot.start_time, "HH:mm");
            const end = dayjs(slot.end_time, "HH:mm");
            return end.diff(start, "minute") > 60;
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
            })
            .catch((err) => {
                showToast({
                    message: "Error creating slots",
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
        const startA = dayjs(slotA.start_time, "HH:mm");
        const endA = dayjs(slotA.end_time, "HH:mm");
        const startB = dayjs(slotB.start_time, "HH:mm");
        const endB = dayjs(slotB.end_time, "HH:mm");
        return startA.isBefore(endB) && endA.isAfter(startB);
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
            const hasExistingOverlap = existingSlotsToCheck.some((existingSlot) => {
                if (!existingSlot.start_time || !existingSlot.end_time) return false;
                const eStart = dayjs(existingSlot.start_time, "HH:mm");
                const eEnd = dayjs(existingSlot.end_time, "HH:mm");
                const nStart = dayjs(slotA.start_time, "HH:mm");
                const nEnd = dayjs(slotA.end_time, "HH:mm");
                return nStart.isBefore(eEnd) && nEnd.isAfter(eStart);
            });

            if (hasExistingOverlap) {
                if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
            }
            // 3. Check for same start and end time
            if (slotA.start_time === slotA.end_time) {
                if (!newInvalidSlots.includes(idxA)) newInvalidSlots.push(idxA);
            }

            // 4. Check for durations more than one hour
            const slotStart = dayjs(slotA.start_time, "HH:mm");
            const slotEnd = dayjs(slotA.end_time, "HH:mm");
            if (slotEnd.diff(slotStart, "minute") > 60) {
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

        // Swap logic: if both times are set and start_time > end_time, swap them
        const start = updatedSlots[index].start_time;
        const end = updatedSlots[index].end_time;
        if (start && end && dayjs(start, "HH:mm").isAfter(dayjs(end, "HH:mm"))) {
            // Swap
            updatedSlots[index].start_time = end;
            updatedSlots[index].end_time = start;
        }

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
            title={`${dayjs(currentDate, "YYYY-MM-DD").format("DD MMMM YYYY")}`}
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
                                            {dayjs(slot.end_time, "HH:mm").format("h:mm A")}
                                        </span>
                                    </div>
                                    {/* Desktop: title + time range */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                        <span className="text-sm font-medium text-[#121212]">
                                            {slot.title || "No Event"}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline text-sm text-gray-500 font-medium">
                                        {dayjs(slot.start_time, "HH:mm").format("h:mm A")} -{" "}
                                        {dayjs(slot.end_time, "HH:mm").format("h:mm A")}
                                    </span>
                                </div>
                            ))}
                    </div>

                    <div>
                        <p className="font-medium mt-4">Create New Slots</p>
                        {slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2 mt-2">
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
                        ))}
                    </div>
                </div>
            )}
        </SideModal>
    );
};

export default OnetImeScheduleModal;
