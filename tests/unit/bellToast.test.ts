import test from "node:test";
import assert from "node:assert/strict";
import { nextBellState } from "../../src/utils/bellToast.ts";

test("no toast while the first response is loading, and none when it arrives with N > 0", () => {
    let s = nextBellState(null, undefined);
    assert.deepEqual(s, { prev: null, toast: false });
    s = nextBellState(s.prev, 3); // first real response
    assert.deepEqual(s, { prev: 3, toast: false });
});

test("a later increase toasts; staying the same or dropping does not", () => {
    assert.equal(nextBellState(3, 4).toast, true);
    assert.equal(nextBellState(3, 3).toast, false);
    assert.equal(nextBellState(3, 0).toast, false);
});

test("the first increase after the badge was cleared to 0 toasts", () => {
    assert.equal(nextBellState(0, 1).toast, true);
});
