import test from "node:test";
import assert from "node:assert/strict";
import { STARTUP_QUIET_MS, isStartupQuiet } from "../../src/utils/startupQuiet.ts";

test("the native app is quiet during the first seconds after launch", () => {
    assert.equal(isStartupQuiet(true, 1000, 1000), true);
    assert.equal(isStartupQuiet(true, 1000, 1000 + STARTUP_QUIET_MS - 1), true);
});

test("and speaks up again once the quiet window has passed", () => {
    assert.equal(isStartupQuiet(true, 1000, 1000 + STARTUP_QUIET_MS), false);
    assert.equal(isStartupQuiet(true, 1000, 1000 + 60_000), false);
});

test("the web app is never quiet", () => {
    assert.equal(isStartupQuiet(false, 1000, 1000), false);
    assert.equal(isStartupQuiet(false, 1000, 1500), false);
});

test("a clock that moved backwards never silences errors", () => {
    assert.equal(isStartupQuiet(true, 5000, 4000), false);
});

test("the window length can be overridden", () => {
    assert.equal(isStartupQuiet(true, 0, 99, 100), true);
    assert.equal(isStartupQuiet(true, 0, 100, 100), false);
});
