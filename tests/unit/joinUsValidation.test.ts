// Run with: npm run test:unit   (Node's built-in test runner; no extra dependencies)
import assert from "node:assert/strict";
import { test } from "node:test";

import {
    HOURS_MAX,
    HOURS_MIN,
    MAX_RESUME_BYTES,
    hoursError,
    validateResumeFile,
} from "../../src/utils/joinUsValidation.ts";

test("hours per week: whole numbers inside the range are accepted", () => {
    for (const ok of [String(HOURS_MIN), "8", " 12 ", String(HOURS_MAX)]) {
        assert.equal(hoursError(ok), "", `expected ${JSON.stringify(ok)} to be valid`);
    }
});

test("hours per week: empty, negative, zero, decimal, text and out-of-range values are rejected", () => {
    const bad = ["", "   ", "0", "-1", "-10", "7.5", "abc", "12h", "1e2", String(HOURS_MAX + 1), "999"];
    for (const value of bad) {
        assert.notEqual(hoursError(value), "", `expected ${JSON.stringify(value)} to be rejected`);
    }
});

test("hours per week: the range message names the limits (also for negatives)", () => {
    for (const value of ["41", "0", "-5"]) {
        assert.match(hoursError(value), new RegExp(`${HOURS_MIN}.*${HOURS_MAX}`), value);
    }
    assert.match(hoursError("7.5"), /whole number/);
});

test("resume: PDF and DOCX within the size limit are accepted (any letter case)", () => {
    assert.equal(validateResumeFile({ name: "cv.pdf", size: 1024 }), null);
    assert.equal(validateResumeFile({ name: "My CV.DOCX", size: MAX_RESUME_BYTES }), null);
});

test("resume: other file types are rejected", () => {
    for (const name of ["cv.doc", "cv.txt", "cv.png", "cv.exe", "cv", "cv.pdf.exe", "cvpdf"]) {
        assert.match(validateResumeFile({ name, size: 1024 }) ?? "", /PDF or DOCX/, name);
    }
});

test("resume: empty and oversize files are rejected", () => {
    assert.match(validateResumeFile({ name: "cv.pdf", size: 0 }) ?? "", /empty/);
    assert.match(validateResumeFile({ name: "cv.pdf", size: MAX_RESUME_BYTES + 1 }) ?? "", /too large/);
});
