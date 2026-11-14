import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Regression: the learner schema did not declare recording_consent_accepted, so the form's final submit (which sends
// zod's PARSED output, and zod strips undeclared keys) dropped it. With recording / transcripts switched on, the
// server then rejected every new learner's last onboarding step ("recording_consent_accepted is required").
//
// config.ts pulls in the app's path aliases and JSON, which plain node can't load, so this reads the source and checks
// each schema block instead of importing it.

const config = readFileSync(new URL("../../src/components/onboarding/FormSection/config.ts", import.meta.url), "utf8");

const block = (startMarker: string, endMarker: string) => {
    const start = config.indexOf(startMarker);
    const end = config.indexOf(endMarker, start);
    assert.ok(start >= 0 && end > start, `could not find ${startMarker}`);
    return config.slice(start, end);
};

const learnerSchema = block("export const learnerFormSchema", "export type LearnerFormData");
const volunteerSchema = block("export const volunteerFormSchema", "export type VolunteerFormData");

test("the learner schema declares recording_consent_accepted, so the final submit keeps it", () => {
    assert.match(learnerSchema, /recording_consent_accepted:\s*z\.boolean\(\)\.optional\(\)/);
});

test("the volunteer schema still declares it too (one contract for both roles)", () => {
    assert.match(volunteerSchema, /recording_consent_accepted:\s*z\.boolean\(\)\.optional\(\)/);
});

test("it is optional, so onboarding is unchanged while recording is switched off", () => {
    assert.doesNotMatch(learnerSchema, /recording_consent_accepted:\s*z\.boolean\(\)\s*,/);
});
