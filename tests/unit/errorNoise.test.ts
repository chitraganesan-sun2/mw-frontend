import assert from "node:assert/strict";
import { test } from "node:test";

import { isBrowserNoise } from "../../src/utils/errorNoise.ts";

test("cancelled requests and observer chatter are noise", () => {
    assert.equal(isBrowserNoise(Object.assign(new Error("x"), { name: "AbortError" })), true);
    assert.equal(isBrowserNoise(new Error("ResizeObserver loop completed with undelivered notifications.")), true);
    assert.equal(isBrowserNoise("Script error."), true);
    assert.equal(isBrowserNoise(new Error("Failed to fetch dynamically imported module: /x.js")), true);
});

test("React hydration mismatches are noise: React recovers by itself", () => {
    assert.equal(isBrowserNoise(new Error("Hydration failed because the server rendered HTML didn't match the client.")), true);
    assert.equal(isBrowserNoise(new Error("There was an error while hydrating. Because the error happened outside of a Suspense boundary...")), true);
    assert.equal(isBrowserNoise(new Error("Text content does not match server-rendered HTML.")), true);
    for (const code of [418, 419, 422, 423, 425]) {
        assert.equal(isBrowserNoise(new Error(`Minified React error #${code}; visit https://react.dev/errors/${code}`)), true, String(code));
    }
});

test("real failures are NOT noise", () => {
    assert.equal(isBrowserNoise(new Error("Cannot read properties of undefined (reading 'map')")), false);
    assert.equal(isBrowserNoise(new TypeError("x is not a function")), false);
    assert.equal(isBrowserNoise(new Error("Minified React error #310; visit https://react.dev/errors/310")), false);
    assert.equal(isBrowserNoise(new Error("Network request failed")), false);
    assert.equal(isBrowserNoise(null), false);
    assert.equal(isBrowserNoise(undefined), false);
    assert.equal(isBrowserNoise({ message: "Something broke" }), false);
});
