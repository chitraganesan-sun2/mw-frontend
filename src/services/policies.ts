import { endpoints } from "@/api/constants";
import { DELETE_API, GET_API, POST_API } from "@/api/request";

export interface PolicyVersions {
    terms: string;
    privacy: string;
}

export interface PolicyStatus {
    needs_acceptance: boolean;
    current: PolicyVersions;
    accepted: { terms: string | null; privacy: string | null; accepted_at: string | null; legacy?: boolean } | null;
    role: "learner" | "volunteer" | null;
    /** Recording is on and this member has not confirmed it (or the wording changed since they did). */
    needs_recording_consent?: boolean;
    recording_consent_version?: string;
    recording_consent?: { version: string | null; accepted_at: string | null; withdrawn_at?: string | null } | null;
    /** The member withdrew their consent: the server refuses bookings / joins of recorded sessions until it is given again. */
    recording_consent_withdrawn?: boolean;
}

/** Withdraws the signed-in member's recording consent (it is kept, dated; they can give it again). */
export async function withdrawRecordingConsent() {
    return DELETE_API(endpoints.policies.recordingConsent);
}

/** Records that the signed-in member understands sessions are recorded / transcribed (the version they were shown). */
export async function acceptRecordingConsent(version: string) {
    return POST_API(endpoints.policies.recordingConsent, { version, accepted: true });
}

/** Records that the signed-in member accepted the Terms and Privacy Policy versions given. */
export async function acceptPolicies(versions: PolicyVersions) {
    return POST_API(endpoints.policies.accept, {
        terms_version: versions.terms,
        privacy_version: versions.privacy,
        accepted: true,
    });
}

/** Accepts whatever versions are published right now (used when the member ticks the boxes during onboarding). */
export async function acceptCurrentPolicies() {
    const res: any = await GET_API(endpoints.policies.versions);
    return acceptPolicies(res.data as PolicyVersions);
}
