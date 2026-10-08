"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { GET_API, PUT_API } from "@/api/request";
import { showToast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSendData } from "@/hooks/useReactQuery";
import { convertToUTC, generateTimeSlotId } from "@/utils/timeFunctions";
import { getApiErrorMessage } from "@/utils/apiError";
import { minuteRangesOverlap, slotMinuteRange } from "@/utils/sessionDisplay";

export type ScheduleRole = "volunteer" | "learner";

// Ported from MyScheduleModal.tsx's local state/handlers, generalized on one axis: the
// slot-id field name on the wire (volunteer_slot_id vs learner_slot_id), derived from `role`.
// Everything else - time validation, overlap checking, recurrence state - is role-agnostic.

export interface TimeSlot {
    start_time: string;
    end_time: string;
    /** Wire id (volunteer_slot_id/learner_slot_id from the API). */
    slot_id?: string;
    /** Stable id for UI state (repeat/custom). From API: slot_id; new slots: generated client_id. */
    client_id?: string;
    slot_type?: "repeats_weekly" | "custom";
    start_date?: string;
    end_date?: string;
    weekly_repeat_interval?: number;
}

export function getSlotId(slot: TimeSlot): string {
    return slot.slot_id ?? slot.client_id ?? "";
}

export interface DaySchedule {
    [key: string]: TimeSlot[];
}

interface APITimeSlot {
    start_time: string;
    end_time: string;
    slot_type?: "repeats_weekly" | "custom";
    start_date?: string;
    end_date?: string;
    weekly_repeat_interval?: number;
    utc_start_time?: string;
    utc_end_time?: string;
    [key: string]: any; // carries volunteer_slot_id/learner_slot_id depending on role
}

interface APIScheduleFormat {
    day: string;
    slots: APITimeSlot[];
}

interface DeletedSlot {
    day: string;
    [key: string]: any; // carries volunteer_slot_id/learner_slot_id depending on role
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function emptySchedule(): DaySchedule {
    return {
        Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
    };
}

interface UseScheduleSlotsOptions {
    role: ScheduleRole;
    /** Gates the fetch and resets edit state, same semantics as MyScheduleModal's isOpen. */
    isActive: boolean;
    getEndpoint: string;
    updateEndpoint: string;
    utcOffset: string;
    invalidateKey: string[];
    onSaveSuccess?: () => void;
}

export function useScheduleSlots({
    role,
    isActive,
    getEndpoint,
    updateEndpoint,
    utcOffset,
    invalidateKey,
    onSaveSuccess,
}: UseScheduleSlotsOptions) {
    const slotIdField = role === "volunteer" ? "volunteer_slot_id" : "learner_slot_id";

    const [schedule, setSchedule] = useState<DaySchedule>(emptySchedule());
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [deletedSlots, setDeletedSlots] = useState<DeletedSlot[]>([]);
    const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
    const [repeatFrequency, setRepeatFrequency] = useState<{ [day: string]: { [slotId: string]: string } }>({});
    const [openDropdowns, setOpenDropdowns] = useState<{ [day: string]: { [slotId: string]: boolean } }>({});
    const [customRecurrenceModalOpen, setCustomRecurrenceModalOpen] = useState(false);
    const [currentDayForCustom, setCurrentDayForCustom] = useState<string>("");
    const [currentSlotIdForCustom, setCurrentSlotIdForCustom] = useState<string>("");
    const [justSavedCustom, setJustSavedCustom] = useState(false);
    const [customRecurrenceData, setCustomRecurrenceData] = useState<{
        [day: string]: { [slotId: string]: { start_date: string; end_date: string | null; weekly_repeat_interval?: number } };
    }>({});
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isActive) return;

        setDeletedSlots([]);
        setCustomRecurrenceData({});
        setRepeatFrequency({});

        GET_API(getEndpoint)
            .then((res: any) => {
                const slotsData: APIScheduleFormat[] = Array.isArray(res?.data) ? res.data : [];
                const newSchedule = emptySchedule();

                if (slotsData.length === 0) {
                    setSchedule(newSchedule);
                    return;
                }

                const newCustomRecurrenceData: typeof customRecurrenceData = {};
                const newRepeatFrequency: typeof repeatFrequency = {};

                slotsData.forEach((dayData: APIScheduleFormat) => {
                    const dayName = dayData.day;
                    if (dayName && dayData.slots && Array.isArray(dayData.slots)) {
                        newSchedule[dayName] = dayData.slots.map((slot: APITimeSlot, slotIndex: number) => {
                            const wireSlotId = slot[slotIdField];
                            const slotId = wireSlotId ?? `load_${dayName}_${slotIndex}`;
                            return {
                                slot_id: wireSlotId,
                                client_id: slotId,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                slot_type: slot.slot_type || "repeats_weekly",
                                start_date: slot.start_date,
                                end_date: slot.end_date,
                                weekly_repeat_interval: slot.weekly_repeat_interval,
                            };
                        });

                        newSchedule[dayName].forEach((slot) => {
                            const slotId = getSlotId(slot);
                            if (!slotId) return;
                            if (!newRepeatFrequency[dayName]) newRepeatFrequency[dayName] = {};
                            if (slot.slot_type === "custom" && slot.start_date) {
                                if (!newCustomRecurrenceData[dayName]) newCustomRecurrenceData[dayName] = {};
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

                setSchedule(newSchedule);
                setCustomRecurrenceData(newCustomRecurrenceData);
                setRepeatFrequency(newRepeatFrequency);
            })
            .catch(() => {
                showToast({ message: "Couldn't load your schedule. Please try again.", type: "error" });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    useEffect(() => {
        const newErrors: { [key: string]: string[] } = {};

        DAYS.forEach((day) => {
            const dayErrors: string[] = [];
            schedule[day].forEach((slot, index) => {
                const slotLabel = `Time slot ${index + 1}`;
                if (slot.start_time && !slot.end_time) {
                    dayErrors.push(`${slotLabel}: Please select end time`);
                }
                if (!slot.start_time && slot.end_time) {
                    dayErrors.push(`${slotLabel}: Please select start time`);
                }
                if (slot.start_time && slot.end_time) {
                    // An end before the start crosses midnight (23:30-00:30 = 60 min); the
                    // backend allows overnight slots up to the same one-hour cap.
                    const [startMin, endMin] = slotMinuteRange(slot.start_time, slot.end_time);
                    if (slot.start_time === slot.end_time) {
                        dayErrors.push(`${slotLabel}: Start and end time cannot be the same`);
                    } else if (endMin - startMin > 60) {
                        dayErrors.push(`${slotLabel}: Slot duration cannot exceed one hour`);
                    } else if (isTimeOverlapping(day, slot.start_time, slot.end_time, index)) {
                        dayErrors.push(`${slotLabel} overlaps with another slot`);
                    }
                }
            });
            if (dayErrors.length > 0) newErrors[day] = dayErrors;
        });

        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schedule]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".repeat-dropdown-container")) {
                setOpenDropdowns({});
            }
        };

        const hasOpenDropdown = Object.values(openDropdowns).some(
            (dayDropdowns) =>
                dayDropdowns && typeof dayDropdowns === "object" && Object.values(dayDropdowns).some(Boolean)
        );

        if (hasOpenDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [openDropdowns]);

    const isTimeOverlapping = (day: string, newFrom: string, newTo: string, currentIndex: number): boolean => {
        if (!newFrom || !newTo) return false;

        // Wrap-aware: an overnight slot is [start, end + 24h) on its day, so it can also collide
        // with the next day's early slots (and the previous day's overnight slot with ours).
        const range = slotMinuteRange(newFrom, newTo);
        const dayIndex = DAYS.indexOf(day);
        const neighbours: [string, number][] = [
            [DAYS[(dayIndex + 6) % 7], -24 * 60],
            [DAYS[(dayIndex + 1) % 7], 24 * 60],
        ];

        const sameDay = schedule[day].some((slot, index) => {
            if (index === currentIndex || !slot.start_time || !slot.end_time) return false;
            return minuteRangesOverlap(range, slotMinuteRange(slot.start_time, slot.end_time));
        });
        return (
            sameDay ||
            neighbours.some(([otherDay, shift]) =>
                (schedule[otherDay] || []).some(
                    (slot) =>
                        Boolean(slot.start_time && slot.end_time) &&
                        minuteRangesOverlap(range, slotMinuteRange(slot.start_time, slot.end_time), shift)
                )
            )
        );
    };

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

        // No start/end swap: an end before the start is an overnight slot (11:30 PM - 12:30 AM),
        // which the swap used to turn into a 23-hour 00:30-23:30 slot that failed validation.

        setSchedule((prev) => ({
            ...prev,
            [day]: prev[day]
                .map((slot, index) => (index === slotIndex ? updatedSlot : slot))
                .sort((a, b) =>
                    type === "start_time" ? 0 : dayjs(a.start_time, "HH:mm").isBefore(dayjs(b.start_time, "HH:mm")) ? -1 : 1
                ),
        }));
    };

    const addTimeSlot = (day: string) => {
        const newClientId = `new_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setSchedule((prev) => ({
            ...prev,
            [day]: [...prev[day], { start_time: "", end_time: "", slot_type: "repeats_weekly", client_id: newClientId }],
        }));
        setRepeatFrequency((prev) => ({ ...prev, [day]: { ...prev[day], [newClientId]: "weekly" } }));
    };

    const removeTimeSlot = (day: string, slotIndex: number) => {
        setSchedule((prev) => {
            const slotToRemove = prev[day][slotIndex];
            const slotId = getSlotId(slotToRemove);
            if (slotToRemove.slot_id) {
                setDeletedSlots((prevDeleted) => {
                    if (!prevDeleted.some((slot) => slot[slotIdField] === slotToRemove.slot_id)) {
                        return [...prevDeleted, { [slotIdField]: slotToRemove.slot_id, day } as DeletedSlot];
                    }
                    return prevDeleted;
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
            return { ...prev, [day]: prev[day].filter((_, index) => index !== slotIndex) };
        });
    };

    const formatScheduleForAPI = (): APIScheduleFormat[] => {
        return DAYS.map((day) => ({
            day,
            slots: schedule[day]
                .filter((slot) => slot.start_time && slot.end_time)
                .map((slot) => {
                    const slotId = getSlotId(slot);
                    const frequencyValue = slotId ? repeatFrequency[day]?.[slotId] : undefined;
                    const slotType: "repeats_weekly" | "custom" =
                        slot.slot_type || (frequencyValue === "custom" ? "custom" : "repeats_weekly") || "repeats_weekly";
                    const isCustom = slotType === "custom";
                    const customData = slotId ? customRecurrenceData[day]?.[slotId] : undefined;

                    const apiSlot: APITimeSlot = {
                        [slotIdField]: slot.slot_id || generateTimeSlotId(slot.start_time, slot.end_time),
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        slot_type: slotType,
                        utc_start_time: convertToUTC(utcOffset, slot.start_time),
                        utc_end_time: convertToUTC(utcOffset, slot.end_time),
                    };

                    if (isCustom && customData) {
                        apiSlot.start_date = customData.start_date;
                        if (customData.end_date) apiSlot.end_date = customData.end_date;
                        if (customData.weekly_repeat_interval) apiSlot.weekly_repeat_interval = customData.weekly_repeat_interval;
                    }

                    if (slotType === "repeats_weekly") {
                        apiSlot.weekly_repeat_interval = slot.weekly_repeat_interval || 1;
                    }

                    return apiSlot;
                }),
        }));
    };

    const handleSave = async () => {
        const formattedData = formatScheduleForAPI();
        const payload = { deleted_slots: deletedSlots, slots: formattedData };
        const res = await PUT_API(updateEndpoint, payload);
        if (res?.status === 201) {
            showToast({ message: "Schedule updated successfully", type: "success" });
        } else {
            showToast({ message: "Couldn't update your schedule. Please try again.", type: "error" });
        }
        return res;
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        invalidateKey,
        success: () => {
            setDeletedSlots([]);
            onSaveSuccess?.();
        },
        // A rejected save (e.g. the backend's overlap / one-hour validation) used to fail
        // silently - the request rejects before handleSave's own status check runs.
        error: (err) => {
            showToast({ message: getApiErrorMessage(err, "Couldn't update your schedule. Please try again."), type: "error" });
        },
    });

    const hasErrors = () => Object.values(errors).some((dayErrors) => dayErrors.length > 0);

    const toggleDay = (day: string) => {
        setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
    };

    const toggleRepeatDropdown = (day: string, slotId: string) => {
        setOpenDropdowns((prev) => ({ ...prev, [day]: { ...prev[day], [slotId]: !prev[day]?.[slotId] } }));
    };

    const handleRepeatFrequencyChange = (day: string, slotId: string, value: string) => {
        if (value === "custom") {
            setRepeatFrequency((prev) => ({ ...prev, [day]: { ...prev[day], [slotId]: "custom" } }));
            setCurrentDayForCustom(day);
            setCurrentSlotIdForCustom(slotId);
            setCustomRecurrenceModalOpen(true);
        } else {
            setRepeatFrequency((prev) => ({ ...prev, [day]: { ...prev[day], [slotId]: value } }));
            setSchedule((prev) => ({
                ...prev,
                [day]: prev[day].map((slot) =>
                    getSlotId(slot) === slotId
                        ? { ...slot, slot_type: "repeats_weekly", start_date: undefined, end_date: undefined }
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
        setOpenDropdowns((prev) => ({ ...prev, [day]: { ...prev[day], [slotId]: false } }));
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
        const endDateStr = data.endType === "date" && data.endDate ? data.endDate.format("YYYY-MM-DD") : null;

        setSchedule((prev) => ({
            ...prev,
            [currentDayForCustom]: prev[currentDayForCustom].map((slot) =>
                getSlotId(slot) === currentSlotIdForCustom
                    ? {
                        ...slot,
                        slot_type: "custom" as const,
                        start_date: startDateStr,
                        end_date: data.endType === "date" && data.endDate ? endDateStr || undefined : undefined,
                    }
                    : slot
            ),
        }));

        setRepeatFrequency((prev) => ({
            ...prev,
            [currentDayForCustom]: { ...prev[currentDayForCustom], [currentSlotIdForCustom]: "custom" },
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

        setTimeout(() => setJustSavedCustom(false), 100);
    };

    const closeCustomRecurrenceModal = () => {
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
                            return { ...s, slot_type: "repeats_weekly", start_date: undefined, end_date: undefined };
                        }
                        return s;
                    }),
                }));
                setRepeatFrequency((prev) => {
                    const freq = prev[day]?.[slotId];
                    if (freq !== "custom") return { ...prev, [day]: { ...prev[day], [slotId]: "weekly" } };
                    return prev;
                });
            }, 0);
        }

        if (wasJustSaved) {
            setTimeout(() => setJustSavedCustom(false), 100);
        } else {
            setJustSavedCustom(false);
        }
    };

    return {
        days: DAYS,
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
        hasErrors,
        onSave,
        isPending,
    };
}

export type UseScheduleSlotsResult = ReturnType<typeof useScheduleSlots>;
