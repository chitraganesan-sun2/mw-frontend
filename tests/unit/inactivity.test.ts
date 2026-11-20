import assert from "node:assert/strict";
import { test } from "node:test";
import { INACTIVITY_TIMEOUT_MS, LAST_ACTIVITY_COOKIE_DAYS, isIdleExpired } from "../../src/utils/inactivity.ts";

const NOW = 1_800_000_000_000;

test("recent activity is not expired; older than 30 minutes is", () => {
    assert.equal(isIdleExpired(String(NOW - 5 * 60 * 1000), NOW), false);
    assert.equal(isIdleExpired(String(NOW - INACTIVITY_TIMEOUT_MS - 1), NOW), true);
    assert.equal(isIdleExpired(String(NOW - INACTIVITY_TIMEOUT_MS), NOW), false);
});

test("a missing or garbage value never logs anyone out by itself", () => {
    assert.equal(isIdleExpired(undefined, NOW), false);
    assert.equal(isIdleExpired("", NOW), false);
    assert.equal(isIdleExpired("not-a-number", NOW), false);
});

test("the lastActivity cookie outlives the idle timeout, so the stale-session check can fire", () => {
    assert.ok(LAST_ACTIVITY_COOKIE_DAYS * 24 * 60 * 60 * 1000 > INACTIVITY_TIMEOUT_MS);
});
