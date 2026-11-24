import test from "node:test";
import assert from "node:assert/strict";
import { parseOffsetMinutes, toUtcTime } from "../../src/utils/utcTime.ts";

test("offsets parse in the shapes the profile label produces", () => {
    assert.equal(parseOffsetMinutes("+05:30"), 330);
    assert.equal(parseOffsetMinutes("-09:00"), -540);
    assert.equal(parseOffsetMinutes("+0530"), 330);
    assert.equal(parseOffsetMinutes("Z"), 0);
    for (const bad of [undefined, null, "", "  ", "abc", "+25:00", "+05:75"]) assert.equal(parseOffsetMinutes(bad as any), null);
});

test("converts to UTC and reports the day shift (audit: IST 19:00 -> 13:30)", () => {
    assert.deepEqual(toUtcTime("+05:30", "19:00"), { time: "13:30", dayShift: 0 });
    assert.deepEqual(toUtcTime("+05:30", "02:00"), { time: "20:30", dayShift: -1 }); // previous day in UTC
    assert.deepEqual(toUtcTime("-08:00", "20:00"), { time: "04:00", dayShift: 1 }); // next day in UTC
    assert.deepEqual(toUtcTime("-08:00", "16:00"), { time: "00:00", dayShift: 1 });
});

test("a missing offset no longer throws: it uses the profile fallback, else the browser offset", () => {
    assert.deepEqual(toUtcTime(undefined, "19:00", 330), { time: "13:30", dayShift: 0 });
    assert.deepEqual(toUtcTime("", "19:00", 330), { time: "13:30", dayShift: 0 });
    const browser = -new Date().getTimezoneOffset();
    assert.deepEqual(toUtcTime(undefined, "19:00"), toUtcTime(`${browser < 0 ? "-" : "+"}${String(Math.floor(Math.abs(browser) / 60)).padStart(2, "0")}:${String(Math.abs(browser) % 60).padStart(2, "0")}`, "19:00"));
});

test("an unreadable time is null, not a crash", () => {
    assert.equal(toUtcTime("+05:30", ""), null);
    assert.equal(toUtcTime("+05:30", "25:00"), null);
});
