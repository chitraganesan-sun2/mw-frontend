import test from "node:test";
import assert from "node:assert/strict";
import {
    DECLINE_NOTE_MAX_LENGTH,
    DECLINE_REASONS,
    buildDeclinePayload,
    declineReasonText,
} from "../../src/utils/declineReason.ts";

test("declining with nothing picked sends no reason fields at all", () => {
    assert.deepEqual(buildDeclinePayload("", ""), {});
    assert.deepEqual(buildDeclinePayload("", "a note without a reason"), {});
    assert.deepEqual(buildDeclinePayload("not a real code", "x"), {});
});

test("a picked reason is sent, with the note only when there is one", () => {
    assert.deepEqual(buildDeclinePayload("schedule_conflict", ""), { decline_reason: "schedule_conflict" });
    assert.deepEqual(buildDeclinePayload("other", "  Back next week  "), {
        decline_reason: "other",
        decline_note: "Back next week",
    });
});

test("a very long note is cut to the backend limit", () => {
    const out = buildDeclinePayload("other", "x".repeat(1000));
    assert.equal(out.decline_note?.length, DECLINE_NOTE_MAX_LENGTH);
});

test("the other person reads the reason in plain words, with the note after it", () => {
    assert.equal(declineReasonText("schedule_conflict", null), "Scheduling conflict");
    assert.equal(declineReasonText("not_taking_sessions", "  Exams this month "), "Not taking new sessions right now - Exams this month");
});

test("nothing is shown for a missing or unknown reason", () => {
    assert.equal(declineReasonText(undefined, "note"), null);
    assert.equal(declineReasonText(null, null), null);
    assert.equal(declineReasonText("from_a_newer_version", "x"), null);
});

test("every preset has both a picker label and a reader label", () => {
    for (const r of DECLINE_REASONS) {
        assert.ok(r.pickerLabel.length > 0 && r.shownLabel.length > 0);
    }
    assert.equal(new Set(DECLINE_REASONS.map((r) => r.value)).size, DECLINE_REASONS.length);
});
