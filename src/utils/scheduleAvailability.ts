import dayjs from "dayjs";

interface RawSlot {
    start_time: string;
    end_time: string;
    slot_type?: "repeats_weekly" | "custom";
    end_date?: string;
    [key: string]: any;
}

interface RawDaySchedule {
    day: string;
    slots: RawSlot[];
}

function formatTime(time: string): string {
    const parsed = dayjs(time, "HH:mm");
    return parsed.isValid() ? parsed.format("h:mmA") : time;
}

/** One bullet per saved slot, e.g. "Available all Sundays 4:00PM-5:00PM PST" (+" until {date}"
 * for a custom-recurrence slot with an end date). Used by ScheduleAvailabilitySection's closed
 * (collapsed) state for a quick glance without opening the full editor. */
export function summarizeAvailability(slotsData: RawDaySchedule[], timezoneLabel?: string): string[] {
    const bullets: string[] = [];

    slotsData.forEach((dayData) => {
        (dayData.slots || []).forEach((slot) => {
            if (!slot.start_time || !slot.end_time) return;

            let bullet = `Available all ${dayData.day}s ${formatTime(slot.start_time)}-${formatTime(slot.end_time)}`;
            if (timezoneLabel) bullet += ` ${timezoneLabel}`;
            if (slot.slot_type === "custom" && slot.end_date) {
                bullet += ` until ${dayjs(slot.end_date).format("MMM D, YYYY")}`;
            }
            bullets.push(bullet);
        });
    });

    return bullets;
}
