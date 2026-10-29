import test from "node:test";
import assert from "node:assert/strict";
import {
    REPORT_DETAILS_MAX_LENGTH,
    buildReportDescription,
    reasonsFor,
    validateReport,
} from "../../src/utils/personReport.ts";

test("the no-show reason is offered for sessions only", () => {
    assert.ok(reasonsFor("session").some((r) => r.value === "no_show"));
    assert.ok(!reasonsFor("user").some((r) => r.value === "no_show"));
    assert.ok(!reasonsFor("message").some((r) => r.value === "no_show"));
});

test("a reason is required, and must be one offered for that report type", () => {
    assert.match(validateReport("user", "", "") ?? "", /reason/);
    assert.match(validateReport("user", "no_show", "") ?? "", /reason/);
    assert.equal(validateReport("session", "no_show", ""), null);
});

test("'Something else' needs details, other reasons do not", () => {
    assert.match(validateReport("message", "other", "   ") ?? "", /what happened/);
    assert.equal(validateReport("message", "other", "They kept asking for my address"), null);
    assert.equal(validateReport("message", "harassment", ""), null);
});

test("the description is the reason label, plus trimmed details when given", () => {
    assert.equal(buildReportDescription("user", "harassment", ""), "Harassment or bullying");
    assert.equal(buildReportDescription("user", "harassment", "  said rude things  "), "Harassment or bullying - said rude things");
});

test("very long details are capped to fit the backend limit", () => {
    const out = buildReportDescription("user", "other", "x".repeat(10000));
    assert.ok(out.length <= 5000);
    assert.ok(out.endsWith("x".repeat(REPORT_DETAILS_MAX_LENGTH)));
});
