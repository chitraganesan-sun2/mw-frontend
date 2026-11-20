import assert from "node:assert/strict";
import { test } from "node:test";
import { hasSubmittedApplication } from "../../src/utils/applicationSuccess.ts";

test("success needs an application id and a submitted step 3", () => {
    assert.equal(hasSubmittedApplication({ applicationId: "abc-123", step3Submitted: true }), true);
    assert.equal(hasSubmittedApplication({ applicationId: "abc-123", step3Submitted: false }), false);
    assert.equal(hasSubmittedApplication({ applicationId: null, step3Submitted: true }), false);
    assert.equal(hasSubmittedApplication({ applicationId: "", step3Submitted: true }), false);
    assert.equal(hasSubmittedApplication(undefined), false);
});
