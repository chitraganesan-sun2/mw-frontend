import dayjs from "dayjs";

/**
 * Start/end ISO strings for a calendar event whose times are given as a date plus two
 * wall-clock times. An overnight event (e.g. 23:00-00:30, or 22:00-02:00) has an end that is not
 * after its start on the same date - that end belongs to the NEXT day, otherwise FullCalendar
 * sees end < start and falls back to its default duration.
 */
export function eventSpan(
    date: string | undefined | null,
    startTime: string | undefined | null,
    endTime: string | undefined | null
): { start: string; end: string } {
    const start = dayjs(`${date} ${startTime}`);
    let end = dayjs(`${date} ${endTime}`);
    if (start.isValid() && end.isValid() && !end.isAfter(start)) end = end.add(1, "day");
    return { start: start.format(), end: end.format() };
}
