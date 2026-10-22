import assert from "node:assert/strict";
import { test } from "node:test";

import { HEARD_ABOUT_US_FIELDS, HEARD_ABOUT_US_OPTIONS, HEARD_ABOUT_US_OTHER } from "../../src/constants/onboarding.ts";

test("Handshake is an option for 'How did you hear about us?'", () => {
    assert.ok(HEARD_ABOUT_US_OPTIONS.includes("Handshake"));
});

test("options are unique and 'Other' is the last choice", () => {
    assert.equal(new Set(HEARD_ABOUT_US_OPTIONS).size, HEARD_ABOUT_US_OPTIONS.length);
    assert.equal(HEARD_ABOUT_US_OPTIONS[HEARD_ABOUT_US_OPTIONS.length - 1], HEARD_ABOUT_US_OTHER);
});

test("the question is required and offers exactly the listed options; the 'Other' box is optional", () => {
    const [question, other] = HEARD_ABOUT_US_FIELDS;
    assert.equal(question.id, "heard_about_us");
    assert.equal(question.required, true);
    assert.deepEqual(
        (question.options as { label: string; value: string }[]).map((o) => o.value),
        HEARD_ABOUT_US_OPTIONS
    );
    assert.equal(other.id, "heard_about_us_other");
    assert.notEqual(other.required, true);
});
