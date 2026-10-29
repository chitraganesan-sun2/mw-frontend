"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CommitActionBar from "@/components/common/Input/Picker/CommitActionBar";
import OpenOnFieldClick from "@/components/common/Input/Picker/OpenOnFieldClick";
import { FieldError, labelClass } from "@/components/schedule/forms/SessionFormFields";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
    id: string;
    /** "Start Time (EDT)" - the caller builds it so the zone abbreviation is the one on the date. */
    label: string;
    /** Selected date, YYYY-MM-DD, in `tzIana`. */
    date: string;
    /** The host's profile time zone - the time is entered and read in it. */
    tzIana: string | null;
    /** "HH:mm" (24h) or "" when nothing is chosen yet. */
    value: string;
    onChange: (time: string) => void;
    error?: string | null;
}

/**
 * Start-time picker for the WingTime form: the same controlled-open MUI picker, draft value and
 * Cancel/OK bar as the Instant Session request form (see CommitActionBar for why), so it opens on
 * a sensible time, OK always commits, and a click anywhere on the field opens it.
 */
export default function WingTimeStartTimeField({ id, label, date, tzIana, value, onChange, error }: Props) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<dayjs.Dayjs | null>(null);

    const at = (isoish: string) => (tzIana ? dayjs.tz(isoish, tzIana) : dayjs(isoish));
    const committed = value && date ? at(`${date}T${value}`) : null;
    // Opens on 9:00 AM that day rather than an empty "-- : --" header with OK doing nothing.
    const defaultDraft = () => at(`${date || dayjs().format("YYYY-MM-DD")}T09:00`);

    const commit = () => {
        setOpen(false);
        if (draft) onChange(draft.format("HH:mm"));
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className={labelClass}>
                {label} <span aria-hidden="true">*</span>
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <OpenOnFieldClick>
                    <MobileTimePicker
                        format="h:mm A"
                        minutesStep={5}
                        timezone={tzIana || undefined}
                        value={open ? draft : committed}
                        open={open}
                        onOpen={() => {
                            setDraft(committed ?? defaultDraft());
                            setOpen(true);
                        }}
                        // Backdrop / Escape: discard the draft, keep the committed time.
                        onClose={() => setOpen(false)}
                        onChange={(next) => setDraft(next)}
                        closeOnSelect={false}
                        slots={{ actionBar: CommitActionBar }}
                        slotProps={{
                            actionBar: { onCancelClick: () => setOpen(false), onAcceptClick: commit } as any,
                            textField: {
                                id,
                                fullWidth: true,
                                error: Boolean(error),
                                // MUI X v9: styling and aria live under the text field's own slotProps.
                                slotProps: {
                                    htmlInput: { "aria-describedby": error ? `${id}-error` : undefined, "aria-required": "true" },
                                    input: {
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
                            } as any,
                        }}
                    />
                </OpenOnFieldClick>
            </LocalizationProvider>
            <FieldError id={`${id}-error`} message={error} />
        </div>
    );
}
