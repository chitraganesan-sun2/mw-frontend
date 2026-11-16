import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { consentSummary } from "../../src/utils/recordingConsentView.ts";

const agreed = { recording_consent: { version: "2026-11-13", accepted_at: "2026-11-14T10:59:17Z", withdrawn_at: null } };
const withdrawn = {
    recording_consent: { version: "2026-11-13", accepted_at: "2026-11-14T10:59:17Z", withdrawn_at: "2026-11-16T08:00:00Z" },
    recording_consent_withdrawn: true,
};

test("hidden while nothing is recorded, or when the member has no consent record yet", () => {
    assert.equal(consentSummary(agreed, false).visible, false);
    assert.equal(consentSummary({ recording_consent: null }, true).visible, false);
    assert.equal(consentSummary(null, true).visible, false);
    assert.equal(consentSummary(undefined, true).visible, false);
});

test("shows the date the member agreed", () => {
    const v = consentSummary(agreed, true);
    assert.equal(v.visible, true);
    assert.equal(v.withdrawn, false);
    assert.match(v.status, /^You agreed to how sessions are recorded or transcribed on 14 Nov 2026\.$/);
});

test("shows that, and when, they withdrew", () => {
    const v = consentSummary(withdrawn, true);
    assert.equal(v.withdrawn, true);
    assert.match(v.status, /^You withdrew your consent on 16 Nov 2026\.$/);
});

test("the withdrawn flag alone is enough, and a bad date never breaks the sentence", () => {
    const v = consentSummary({ recording_consent: { version: "x", accepted_at: "nope", withdrawn_at: null }, recording_consent_withdrawn: true }, true);
    assert.equal(v.withdrawn, true);
    assert.equal(v.status, "You withdrew your consent.");
});

// Both Settings pages must actually show the card, and it must call the withdraw / give-again endpoints.
const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("the card is on both Settings pages", () => {
    for (const role of ["learner", "volunteer"]) {
        const page = read(`../../src/app/(private)/${role}/settings/page.tsx`);
        assert.match(page, /import RecordingConsentSection from/);
        assert.match(page, /<RecordingConsentSection \/>/);
    }
});

test("withdrawing and giving consent again use the consent endpoint", () => {
    const section = read("../../src/components/common/RecordingConsentSection/index.tsx");
    assert.match(section, /withdrawRecordingConsent\(\)/);
    assert.match(section, /acceptRecordingConsent\(data\?\.recording_consent_version/);
    assert.match(section, /SUPPORT_EMAIL/);
    const service = read("../../src/services/policies.ts");
    assert.match(service, /DELETE_API\(endpoints\.policies\.recordingConsent\)/);
});
