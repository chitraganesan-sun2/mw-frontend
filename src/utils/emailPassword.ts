// Client-side mirrors of the server rules (controllers/v1/email_validation.py, password_policy.py).
// The server is the source of truth; these give instant feedback only.

const LOCAL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const GMAIL = ["gmail.com", "googlemail.com"];
const COMMON_TYPOS: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.con": "gmail.com",
    "yaho.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlok.com": "outlook.com",
};

/** Returns an error message, or null if the address looks valid. */
export const emailError = (raw: string): string | null => {
    const email = raw.trim().toLowerCase();
    if (!email) return "Enter your email address.";
    const parts = email.split("@");
    if (email.length > 254 || parts.length !== 2) return "Enter a valid email address.";
    const [local, domain] = parts;
    if (!local || local.length > 64 || !LOCAL_RE.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
        return "Enter a valid email address.";
    }
    const labels = domain.split(".");
    if (labels.length < 2 || !labels.every((l) => LABEL_RE.test(l)) || !/^[a-z]{2,63}$/.test(labels[labels.length - 1])) {
        return "Enter a valid email address.";
    }
    if (GMAIL.includes(domain) && !/^[a-z0-9]{6,30}$/.test(local.split("+")[0].replace(/\./g, ""))) {
        return "Gmail usernames are 6-30 letters, numbers or dots.";
    }
    return null;
};

export const emailTypoSuggestion = (raw: string): string | null => {
    const [local, domain] = raw.trim().toLowerCase().split("@");
    return local && domain && COMMON_TYPOS[domain] ? `${local}@${COMMON_TYPOS[domain]}` : null;
};

export const PASSWORD_RULES: { label: string; test: (pw: string, email: string) => boolean }[] = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At most 72 bytes", test: (pw) => new TextEncoder().encode(pw).length <= 72 },
    { label: "Contains a letter", test: (pw) => /\p{L}/u.test(pw) },
    { label: "Contains a number", test: (pw) => /\d/.test(pw) },
    { label: "No spaces at the start or end", test: (pw) => pw === pw.trim() },
    {
        label: "Doesn't contain your email name",
        test: (pw, email) => {
            const local = email.split("@")[0].toLowerCase();
            return local.length < 4 || !pw.toLowerCase().includes(local);
        },
    },
];

export const passwordValid = (pw: string, email: string) => PASSWORD_RULES.every((r) => r.test(pw, email));
