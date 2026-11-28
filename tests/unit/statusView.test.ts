import test from "node:test";
import assert from "node:assert/strict";
import { TIME_BOUND_OPTIONS, isPastStatus, matchesStatusFilter, matchesTimeBound, statusViewOf, statusViewOptions } from "../../src/utils/statusView.ts";

test("waiting, arranged and open items are upcoming", () => {
    for (const s of ["pending", "accepted", "active", "open", "available", "claimed", "booked", ""]) {
        assert.equal(statusViewOf(s), "upcoming", s);
    }
});

test("an arranged session that is over counts as completed", () => {
    assert.equal(statusViewOf("accepted", true), "completed");
    assert.equal(statusViewOf("claimed", true), "completed");
    assert.equal(statusViewOf("completed"), "completed");
    // a request nobody answered is not "completed" just because its time passed
    assert.equal(statusViewOf("pending", true), "upcoming");
});

test("cancelled, declined and expired never happen", () => {
    for (const s of ["cancelled", "rejected", "declined", "expired", "Cancelled"]) {
        assert.equal(statusViewOf(s), "cancelled", s);
        assert.equal(statusViewOf(s, true), "cancelled", s);
    }
});

test("the filter lists All only where asked", () => {
    assert.deepEqual(statusViewOptions(true).map((o) => o.value), ["all", "upcoming", "completed", "cancelled"]);
    assert.deepEqual(statusViewOptions(false).map((o) => o.value), ["upcoming", "completed", "cancelled"]);
    assert.equal(matchesStatusFilter("all", "cancelled"), true);
    assert.equal(matchesStatusFilter("upcoming", "cancelled"), false);
    assert.equal(matchesStatusFilter("completed", "completed"), true);
});

test("the volunteer's time-bound filter splits posted/accepted/in progress from completed/cancelled/expired", () => {
    for (const s of ["open", "pending", "accepted", "active"]) {
        assert.equal(isPastStatus(s), false, s);
        assert.equal(matchesTimeBound("upcoming", s), true, s);
        assert.equal(matchesTimeBound("past", s), false, s);
    }
    for (const s of ["completed", "cancelled", "expired", "Cancelled"]) {
        assert.equal(isPastStatus(s), true, s);
        assert.equal(matchesTimeBound("past", s), true, s);
        assert.equal(matchesTimeBound("upcoming", s), false, s);
    }
    assert.equal(matchesTimeBound("all", "expired"), true);
    assert.deepEqual(TIME_BOUND_OPTIONS.map((o) => o.value), ["all", "upcoming", "past"]);
});
