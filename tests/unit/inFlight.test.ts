import assert from "node:assert/strict";
import { test } from "node:test";
import { createInFlightGuard } from "../../src/utils/inFlight.ts";

test("a second call while the first is pending is ignored (double-click)", async () => {
    const guard = createInFlightGuard();
    let calls = 0;
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const first = guard.run(async () => {
        calls++;
        await gate;
        return "saved";
    });
    const second = guard.run(async () => {
        calls++;
        return "dup";
    });
    assert.equal(guard.busy, true);
    assert.equal(await second, undefined);
    release();
    assert.equal(await first, "saved");
    assert.equal(calls, 1);
});

test("the guard re-opens after success and after a failure", async () => {
    const guard = createInFlightGuard();
    await assert.rejects(guard.run(async () => { throw new Error("boom"); }), /boom/);
    assert.equal(guard.busy, false);
    assert.equal(await guard.run(() => 42), 42);
    assert.equal(guard.busy, false);
});
