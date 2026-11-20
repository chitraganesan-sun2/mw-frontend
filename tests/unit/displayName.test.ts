import assert from "node:assert/strict";
import { test } from "node:test";
import { displayName, NAME_FALLBACK } from "../../src/utils/displayName.ts";

test("joins the parts that exist", () => {
    assert.equal(displayName("Asha", "Rao"), "Asha Rao");
    assert.equal(displayName("Asha", undefined), "Asha");
    assert.equal(displayName(null, "Rao"), "Rao");
});

test("never renders 'undefined' or 'null' when the profile is missing", () => {
    for (const out of [displayName(undefined, undefined), displayName(null, null), displayName("", "  ")]) {
        assert.equal(out, NAME_FALLBACK);
        assert.doesNotMatch(out, /undefined|null/);
    }
});

test("accepts a custom fallback", () => {
    assert.equal(displayName(undefined, undefined, ""), "");
});
