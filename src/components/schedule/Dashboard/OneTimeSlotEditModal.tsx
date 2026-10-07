"use client";
import { useEffect, useState } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import { PUT_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatSessionDate, formatTimeRange, getDurationMinutes, isOvernightRange } from "@/utils/sessionDisplay";

export interface OneTimeSlot {
    date: string;
    start_time: string;
    end_time: string;
    volunteer_slot_id: string;
    is_booked?: boolean;
}

interface Props {
    slot: OneTimeSlot | null;
    onClose: () => void;
    onSaved: () => void;
}

const MAX_SLOT_MINUTES = 60;

/** Client-side mirror of the backend rule (availability_validation.py); the server re-checks
 * overlap with other availability and the volunteer's local "now". */
export function validateSlotTimes(start: string, end: string): string | null {
    if (!start || !end) return "Please choose both a start and an end time.";
    if (end === start) return "Start and end time cannot be the same.";
    // An end before the start crosses midnight (11:30 PM - 12:30 AM); getDurationMinutes wraps.
    const minutes = getDurationMinutes(start, end) ?? 0;
    if (minutes > MAX_SLOT_MINUTES) return "A slot cannot be longer than one hour.";
    return null;
}

const OneTimeSlotEditModal: React.FC<Props> = ({ slot, onClose, onSaved }) => {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setStart(slot?.start_time ?? "");
        setEnd(slot?.end_time ?? "");
        setError(null);
    }, [slot]);

    const save = async () => {
        if (!slot) return;
        const problem = validateSlotTimes(start, end);
        if (problem) {
            setError(problem);
            return;
        }
        setSaving(true);
        try {
            await PUT_API(endpoints.volunteer_slot.oneTimeSlot(slot.date, slot.volunteer_slot_id), {
                start_time: start,
                end_time: end,
            });
            onSaved();
        } catch (err) {
            setError(getApiErrorMessage(err, "Couldn't update this slot. Please try again."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <CenterModal
            isOpen={!!slot}
            onClose={onClose}
            width={400}
            hideCloseIcon
            headerComponent={<h2 className="text-lg font-medium">Edit availability</h2>}
            headerClassName="!px-6 !py-4 !border-0 !justify-start"
            bodyClassName="!px-6 !py-2"
            footerClassName="!px-6 !py-4 !border-0"
            footerComponent={
                <div className="w-full flex gap-3">
                    <Button
                        title="Cancel"
                        customClassName="!bg-white !text-black !border !border-gray-300 flex-1"
                        onClick={onClose}
                        disabled={saving}
                    />
                    <Button title="Save" customClassName="!bg-black !text-white flex-1" onClick={save} loading={saving} />
                </div>
            }
        >
            <p className="text-sm text-gray-700 mb-3">{slot ? formatSessionDate(slot.date) : ""}</p>
            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="one-time-start">
                    Start time
                    <input
                        id="one-time-start"
                        type="time"
                        step={300}
                        value={start}
                        onChange={(e) => {
                            setStart(e.target.value);
                            setError(null);
                        }}
                        className="h-10 rounded-lg border border-gray-300 px-2 font-normal"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="one-time-end">
                    End time
                    <input
                        id="one-time-end"
                        type="time"
                        step={300}
                        value={end}
                        onChange={(e) => {
                            setEnd(e.target.value);
                            setError(null);
                        }}
                        className="h-10 rounded-lg border border-gray-300 px-2 font-normal"
                    />
                </label>
            </div>
            {isOvernightRange(start, end) && (
                <p className="mt-2 text-xs text-gray-600">{formatTimeRange(start, end)}</p>
            )}
            {error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                    {error}
                </p>
            )}
        </CenterModal>
    );
};

export default OneTimeSlotEditModal;
