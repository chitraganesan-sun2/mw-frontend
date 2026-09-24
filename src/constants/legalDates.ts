import { format } from "date-fns";

/**
 * Single source of truth for legal-document revision dates. There's no CMS
 * timestamp to read this from - legal content is edited by hand - so update
 * the value here (not in the page components) whenever Privacy Policy /
 * Terms content actually changes. Both pages render from this file so their
 * "Last Updated" text can't drift out of sync with each other.
 */
export const LEGAL_LAST_UPDATED = {
    privacyPolicy: new Date("2025-03-01"),
    termsAndConditions: new Date("2025-03-01"),
};

export const formatLastUpdated = (date: Date) => format(date, "MMMM yyyy");
