import test from "node:test";
import assert from "node:assert/strict";
import { slotOptionKey, selectedSlotKey } from "../../src/utils/slotOptionKey.ts";

const weekly = [
    { date: "2026-10-31", volunteer_slot_id: "abc" },
    { date: "2026-11-07", volunteer_slot_id: "abc" },
    { date: "2026-11-14", volunteer_slot_id: "abc" },
];

test("two dates of the same weekly slot get different option keys", () => {
    const keys = weekly.map(slotOptionKey);
    assert.equal(new Set(keys).size, weekly.length);
});

test("picking a later date finds that date, not the first occurrence of the slot id", () => {
    const picked = weekly[1];
    const found = weekly.find((s) => slotOptionKey(s) === slotOptionKey(picked));
    assert.equal(found?.date, "2026-11-07");
});

test("the selection key round-trips to the option it came from", () => {
    const picked = weekly[2];
    assert.equal(selectedSlotKey(picked.date, picked.volunteer_slot_id), slotOptionKey(picked));
});

test("no selection gives an empty key", () => {
    assert.equal(selectedSlotKey("", "abc"), "");
    assert.equal(selectedSlotKey("2026-11-07", ""), "");
    assert.equal(selectedSlotKey(undefined, undefined), "");
});
