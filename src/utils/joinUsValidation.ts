// Client-side checks for the Careers (join-us) form. Pure functions, no React: the server
// enforces the same rules (models/v1/joiner.py, controllers/v1/joiner_resume.py) - these only
// give the applicant an immediate, readable message.

// Hours Per Week: a whole number of hours the applicant can commit each week.
// Keep in step with the backend's JOIN_US_HOURS_PER_WEEK_MIN / _MAX (default 1-40).
export const HOURS_MIN = 1;
export const HOURS_MAX = 40;

export const hoursError = (raw: string): string => {
    const value = raw.trim();
    if (!value) return "Please enter the hours you can commit each week.";
    if (!/^-?\d+$/.test(value)) return "Please enter a whole number of hours.";
    const n = Number(value);
    if (n < HOURS_MIN || n > HOURS_MAX) return `Hours per week must be between ${HOURS_MIN} and ${HOURS_MAX}.`;
    return "";
};

export const MAX_RESUME_MB = 5;
export const MAX_RESUME_BYTES = MAX_RESUME_MB * 1024 * 1024;
export const RESUME_EXTENSIONS = [".pdf", ".docx"];

/** A message if `file` can't be uploaded as a resume, else null. */
export const validateResumeFile = (file: { name: string; size: number }): string | null => {
    const name = file.name.toLowerCase();
    if (!RESUME_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        return "Please upload your resume as a PDF or DOCX file.";
    }
    if (file.size === 0) return "That file is empty.";
    if (file.size > MAX_RESUME_BYTES) return `Your resume is too large. The maximum size is ${MAX_RESUME_MB} MB.`;
    return null;
};
