/**
 * Learners under 18 are signed up by a parent or guardian, not by themselves. The server enforces the same rule
 * (see the backend's learner.needs_guardian); this just tells the person up front instead of at the last step.
 */
export const SELF_ENROL_MIN_AGE = 18;

export const GUARDIAN_REQUIRED_MESSAGE =
    "A learner under 18 has to be signed up by a parent or guardian. Please ask them to sign up for you.";

/** Whole years from a DD-MM-YYYY date of birth (the format the date-of-birth picker produces), or null if unreadable. */
export const ageFromDob = (dob: string | null | undefined, today: Date = new Date()): number | null => {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec((dob ?? "").trim());
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const birth = new Date(year, month - 1, day);
    // Reject dates like 31-02-2010 that JavaScript would silently roll over.
    if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null;
    let age = today.getFullYear() - year;
    if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age -= 1;
    return age;
};

/** True when someone is signing themselves up ("self") with a date of birth that makes them under 18. */
export const needsGuardian = (enrolledBy: string, dob: string | null | undefined, today: Date = new Date()): boolean => {
    if (enrolledBy === "parent") return false;
    const age = ageFromDob(dob, today);
    return age !== null && age < SELF_ENROL_MIN_AGE;
};
