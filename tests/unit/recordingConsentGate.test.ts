import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const gate = readFileSync(new URL("../../src/components/common/RecordingConsentGate/index.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../../src/layouts/MainLayout.tsx", import.meta.url), "utf8");
const service = readFileSync(new URL("../../src/services/policies.ts", import.meta.url), "utf8");

test("the consent prompt is part of the signed-in layout, after the Terms prompt", () => {
    assert.match(layout, /<PolicyUpdateGate \/>\s*<RecordingConsentGate \/>/);
});

test("it waits for the Terms prompt and for recording to actually be on, so dialogs never stack or over-promise", () => {
    assert.match(gate, /!data\?\.needs_recording_consent \|\| data\.needs_acceptance \|\| !notices\.any/);
});

test("it sends the version the member was shown, and only ever an acceptance", () => {
    assert.match(gate, /acceptRecordingConsent\(version\)/);
    assert.match(service, /accepted: true/);
    assert.match(service, /policies\.recordingConsent/);
});
