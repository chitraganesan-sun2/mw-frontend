import assert from "node:assert/strict";
import { test } from "node:test";
import { createPushTokenSync } from "../../src/services/pushTokenSync.ts";

const harness = (opts: { signedIn?: boolean; failFirst?: number } = {}) => {
    const state = { signedIn: opts.signedIn ?? true, failures: opts.failFirst ?? 0, sent: [] as string[] };
    const sync = createPushTokenSync({
        isSignedIn: () => state.signedIn,
        send: async (token) => {
            if (state.failures > 0) {
                state.failures -= 1;
                throw new Error("backend rejected");
            }
            state.sent.push(token);
        },
    });
    return { state, sync };
};

test("a token that arrives while signed in is sent once", async () => {
    const { state, sync } = harness();
    await sync.onToken("t1");
    await sync.sync();
    await sync.sync();
    assert.deepEqual(state.sent, ["t1"]);
});

test("a late token (after the 5 second wait) is still sent", async () => {
    const { state, sync } = harness();
    // enablePush gave up waiting: nothing to send yet...
    await sync.sync();
    assert.deepEqual(state.sent, []);
    // ...then the OS finally produces the token.
    await sync.onToken("late");
    assert.deepEqual(state.sent, ["late"]);
});

test("a token refreshed while the app is open replaces the old one on the backend", async () => {
    const { state, sync } = harness();
    await sync.onToken("old");
    await sync.onToken("new");
    assert.deepEqual(state.sent, ["old", "new"]);
    assert.equal(sync.getToken(), "new");
});

test("a refresh that arrives while a send is in flight is not lost", async () => {
    const sent: string[] = [];
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    const sync = createPushTokenSync({
        isSignedIn: () => true,
        send: async (token) => {
            if (token === "first") await gate;
            sent.push(token);
        },
    });
    const first = sync.onToken("first");
    const second = sync.onToken("second"); // arrives mid-send
    release();
    await Promise.all([first, second]);
    await sync.sync();
    assert.deepEqual(sent, ["first", "second"]);
});

test("nothing is sent while signed out, and the token goes out at the next sync after sign-in", async () => {
    const { state, sync } = harness({ signedIn: false });
    await sync.onToken("t1");
    assert.deepEqual(state.sent, []);
    state.signedIn = true;
    await sync.sync();
    assert.deepEqual(state.sent, ["t1"]);
});

test("a failed send is retried by the next sync", async () => {
    const { state, sync } = harness({ failFirst: 1 });
    await sync.onToken("t1");
    assert.deepEqual(state.sent, []);
    await sync.sync();
    assert.deepEqual(state.sent, ["t1"]);
});

test("after sign-out the same device token is sent again for the next member", async () => {
    const { state, sync } = harness();
    await sync.onToken("t1");
    sync.forget(); // sign-out removed it from the backend
    await sync.sync();
    assert.deepEqual(state.sent, ["t1", "t1"]);
});

test("concurrent syncs make a single request", async () => {
    const { state, sync } = harness();
    await sync.onToken("t1");
    sync.forget();
    await Promise.all([sync.sync(), sync.sync(), sync.sync()]);
    assert.deepEqual(state.sent, ["t1", "t1"]);
});
