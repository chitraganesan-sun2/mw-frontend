type ConsentStatus = {
    recording_consent?: { version: string | null; accepted_at: string | null; withdrawn_at?: string | null } | null;
    recording_consent_withdrawn?: boolean;
} | null | undefined;

const niceDate = (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * What the Settings card shows. Visible only while recording / transcription is on AND the member has a consent
 * record (a member who has not been asked yet is handled by the one-time prompt instead).
 */
export const consentSummary = (
    status: ConsentStatus,
    captureOn: boolean
): { visible: boolean; withdrawn: boolean; status: string } => {
    const consent = status?.recording_consent;
    if (!captureOn || !consent) return { visible: false, withdrawn: false, status: "" };
    const withdrawn = status?.recording_consent_withdrawn === true || !!consent.withdrawn_at;
    if (withdrawn) {
        const on = niceDate(consent.withdrawn_at);
        return { visible: true, withdrawn: true, status: `You withdrew your consent${on ? ` on ${on}` : ""}.` };
    }
    const on = niceDate(consent.accepted_at);
    return {
        visible: true,
        withdrawn: false,
        status: `You agreed to how sessions are recorded or transcribed${on ? ` on ${on}` : ""}.`,
    };
};
