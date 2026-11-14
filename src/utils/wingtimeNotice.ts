/**
 * How much notice a WingTime needs, in plain words. The server decides the number (default 3 hours); the form follows it.
 */
export const DEFAULT_MIN_NOTICE_MINUTES = 180;

/** "3 hours' notice", "1 hour's notice", "10 minutes' notice", "1 minute's notice". */
export const noticePhrase = (minutes: number): string => {
    const wholeHours = minutes > 0 && minutes % 60 === 0;
    const n = wholeHours ? minutes / 60 : minutes;
    const unit = wholeHours ? "hour" : "minute";
    return n === 1 ? `${n} ${unit}'s notice` : `${n} ${unit}s' notice`;
};

/** A number from the server that can be trusted: a whole number of minutes, zero or more. Anything else -> the default. */
export const sanitizeNoticeMinutes = (value: unknown): number => {
    // Only a real number or a numeric string counts: Number(null), Number("") and Number([]) are all 0, which would
    // silently turn a missing value into "no notice at all".
    const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
    return Number.isInteger(n) && n >= 0 ? n : DEFAULT_MIN_NOTICE_MINUTES;
};
