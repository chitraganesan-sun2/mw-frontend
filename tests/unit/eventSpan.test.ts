import test from "node:test";
import assert from "node:assert/strict";
import { eventSpan } from "../../src/utils/eventSpan.ts";

const naive = (s: string) => s.slice(0, 16); // drop the machine's UTC offset

test("a same-day event keeps its end on the same date", () => {
    const { start, end } = eventSpan("2026-11-24", "09:00", "10:00");
    assert.equal(naive(start), "2026-11-24T09:00");
    assert.equal(naive(end), "2026-11-24T10:00");
});

test("an overnight event ends on the next day", () => {
    const { start, end } = eventSpan("2026-11-24", "22:00", "02:00");
    assert.equal(naive(start), "2026-11-24T22:00");
    assert.equal(naive(end), "2026-11-25T02:00");
});

test("ending exactly at midnight rolls to the next day (23:00-00:00)", () => {
    assert.equal(naive(eventSpan("2026-12-31", "23:00", "00:00").end), "2027-01-01T00:00");
});

test("a month-end overnight event crosses the month", () => {
    assert.equal(naive(eventSpan("2026-11-30", "23:30", "00:30").end), "2026-12-01T00:30");
});
