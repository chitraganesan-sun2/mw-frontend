import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

/**
 * Extracts timezone offset from timezone label
 * @param timezoneLabel - The timezone label (e.g., "Asia/Kolkata (GMT+05:30)")
 * @returns The offset in the format "offset:+05:30" or null if not found
 */

type UserTimeZoneProps = {
    date: string;
    timeZone?: string;
    format?: string;
};

const localTimeZone = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || dayjs.tz.guess();

export const timesAgo = (date: string) => {
    if (!date) return "";
    const createdAt = dayjs.utc(date).local();
    const diffInMinutes = dayjs().diff(createdAt, "minutes");

    if (diffInMinutes < 1) return "Just now";

    let timeString = createdAt
        .fromNow(true)
        .replace(/^an /, "1 ")
        .replace(/^a /, "1 ")
        .replace("minutes", "mins")
        .replace("minute", "min")
        .replace("hours", "hrs")
        .replace("hour", "hr")
        .replace("seconds", "secs")
        .replace("second", "sec");

    return `${timeString} ago`;
};

export const toUserTimeZone = ({
    date,
    timeZone = localTimeZone,
    format = "YYYY-MM-DD HH:mm:ss",
}: UserTimeZoneProps) => {
    if (!date) return "";
    return dayjs.utc(date).tz(timeZone).format(format);
};

export const calculateAge = (dob: string) => {
    if (!dob) return "";
    return dayjs()?.diff(dayjs(dob, "DD-MM-YYYY"), "years")?.toString();
};

export const isAgeUnder18 = (dob: string) => {
    const age = Number(calculateAge(dob)) || 0;
    return age < 18;
};

export const generateTimeSlotId = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "";
    const hash = require("crypto").createHash("sha256");
    return hash.update(`${startTime}-${endTime}`).digest("hex");
};

export const convertToUTC = (utc_offset: string, time: string): string => {
    // Use a fixed anchor date to ensure consistent behavior
    const anchorDate = "2000-01-01"; // arbitrary fixed date
    const local = dayjs(`${anchorDate} ${time}`, "YYYY-MM-DD HH:mm").utcOffset(utc_offset, true);
    const utcTime = local.utc().format("HH:mm");
    return utcTime;
};

export const extractTimezoneOffset = (timezoneLabel: string): string | null => {
    if (!timezoneLabel) return null;

    // Extract the UTC offset part from the label
    const utcMatch = timezoneLabel.match(/\(UTC([+-]\d{2}:\d{2})\)/);

    if (utcMatch && utcMatch[1]) {
        return `${utcMatch[1]}`;
    }

    return null;
};
