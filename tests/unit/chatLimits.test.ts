import assert from "node:assert/strict";
import { test } from "node:test";
import { MESSAGE_MAX_LENGTH, messageCounterText } from "../../src/utils/chatLimits.ts";
import { friendlyValidationMessage, getApiErrorMessage } from "../../src/utils/apiError.ts";

test("the counter appears only near the limit", () => {
    assert.equal(MESSAGE_MAX_LENGTH, 5000);
    assert.equal(messageCounterText(10), null);
    assert.equal(messageCounterText(4499), null);
    assert.equal(messageCounterText(4500), "4500 / 5000");
    assert.equal(messageCounterText(5000), "5000 / 5000");
});

test("raw pydantic length messages become plain language", () => {
    assert.equal(
        friendlyValidationMessage("String should have at most 5000 characters"),
        "That's too long. Please keep it to 5000 characters or fewer."
    );
    assert.match(friendlyValidationMessage("String should have at least 8 characters"), /too short.*8/);
    assert.equal(friendlyValidationMessage("Slot already claimed"), "Slot already claimed");
});

test("getApiErrorMessage applies it to string and list details", () => {
    assert.match(getApiErrorMessage({ data: { detail: "String should have at most 5000 characters" } }), /too long/);
    assert.match(
        getApiErrorMessage({ data: { detail: [{ loc: ["body", "message"], msg: "String should have at most 5000 characters" }] } }),
        /too long/
    );
    assert.equal(getApiErrorMessage({}, "fallback"), "fallback");
});
