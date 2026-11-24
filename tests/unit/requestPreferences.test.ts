import test from "node:test";
import assert from "node:assert/strict";
import {
    MAX_PAUSE_DAYS,
    MAX_PENDING_CAP,
    buildRequestPreferencesPayload,
    validateRequestPreferences,
} from "../../src/utils/requestPreferences.ts";

const TODAY = "2026-11-01";
const form = (over = {}) => ({ paused: false, pausedUntil: "", capText: "", ...over });

test("nothing set is valid and means no pause and no limit", () => {
    assert.equal(validateRequestPreferences(form(), TODAY), null);
    assert.deepEqual(buildRequestPreferencesPayload(form()), {
        requests_paused: false, requests_paused_until: null, max_pending_requests: null,
    });
});

test("the limit must be a whole number in range, or empty", () => {
    for (const bad of ["0", "-3", "1.5", "abc", String(MAX_PENDING_CAP + 1)]) {
        assert.match(validateRequestPreferences(form({ capText: bad }), TODAY) ?? "", /whole number/);
    }
    for (const ok of ["1", "7", String(MAX_PENDING_CAP), "  4  "]) {
        assert.equal(validateRequestPreferences(form({ capText: ok }), TODAY), null);
    }
});

test("a resume date is checked only while paused: not past, not beyond the maximum", () => {
    assert.match(validateRequestPreferences(form({ paused: true, pausedUntil: "2026-10-31" }), TODAY) ?? "", /past/);
    assert.equal(validateRequestPreferences(form({ paused: true, pausedUntil: TODAY }), TODAY), null);
    assert.equal(validateRequestPreferences(form({ paused: true, pausedUntil: "2027-01-30" }), TODAY), null); // day 90
    assert.match(validateRequestPreferences(form({ paused: true, pausedUntil: "2027-01-31" }), TODAY) ?? "", new RegExp(String(MAX_PAUSE_DAYS)));
    // not paused: a leftover date is ignored, not an error
    assert.equal(validateRequestPreferences(form({ paused: false, pausedUntil: "2020-01-01" }), TODAY), null);
});

test("the payload drops the date unless paused and turns an empty limit into null", () => {
    assert.deepEqual(buildRequestPreferencesPayload(form({ paused: true, pausedUntil: "2026-11-20", capText: "5" })), {
        requests_paused: true, requests_paused_until: "2026-11-20", max_pending_requests: 5,
    });
    assert.equal(buildRequestPreferencesPayload(form({ paused: false, pausedUntil: "2026-11-20" })).requests_paused_until, null);
    assert.equal(buildRequestPreferencesPayload(form({ paused: true })).requests_paused_until, null);
});

test("the resume-date bounds run from the profile-zone date, not the browser's", async () => {
    const { pauseDateBounds } = await import("../../src/utils/requestPreferences.ts");
    assert.deepEqual(pauseDateBounds("2026-11-01"), { min: "2026-11-01", max: "2027-01-30" }); // day 90
    assert.deepEqual(pauseDateBounds("2026-12-31"), { min: "2026-12-31", max: "2027-03-31" }); // crosses the year
    // the max the form offers is the last date the validator accepts
    assert.equal(validateRequestPreferences(form({ paused: true, pausedUntil: pauseDateBounds(TODAY).max }), TODAY), null);
});
