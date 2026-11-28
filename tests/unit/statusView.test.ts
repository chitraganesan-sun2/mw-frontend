import test from "node:test";
import assert from "node:assert/strict";
import { matchesStatusFilter, statusViewOf, statusViewOptions } from "../../src/utils/statusView.ts";

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
