import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ageFromDob, needsGuardian, SELF_ENROL_MIN_AGE } from "../../src/utils/guardianRule.ts";

const today = new Date(2026, 10, 14); // 14 Nov 2026

test("the self-enrol age is 18", () => {
    assert.equal(SELF_ENROL_MIN_AGE, 18);
});

test("age is counted in whole years, up to the birthday", () => {
    assert.equal(ageFromDob("14-11-2008", today), 18); // 18th birthday today
    assert.equal(ageFromDob("15-11-2008", today), 17); // tomorrow
    assert.equal(ageFromDob("01-01-2000", today), 26);
    assert.equal(ageFromDob("31-12-2013", today), 12);
});

test("an unreadable or impossible date is null, never a guess", () => {
    for (const bad of ["", "  ", null, undefined, "2008-11-14", "31-02-2010", "ab-cd-efgh", "14/11/2008", "1-1-2000"]) {
        assert.equal(ageFromDob(bad as string, today), null, String(bad));
    }
});

test("someone signing up for themselves under 18 needs a guardian; adults and parents do not", () => {
    assert.equal(needsGuardian("self", "15-11-2008", today), true);
    assert.equal(needsGuardian("self", "01-01-2012", today), true);
    assert.equal(needsGuardian("self", "14-11-2008", today), false); // exactly 18
    assert.equal(needsGuardian("self", "01-01-1990", today), false);
    assert.equal(needsGuardian("parent", "01-01-2018", today), false); // a guardian signs a child up
});

test("with no readable date of birth nobody is blocked here (the server checks the rest)", () => {
    assert.equal(needsGuardian("self", "", today), false);
    assert.equal(needsGuardian("self", "nonsense", today), false);
});

// The sign-up form must actually use the rule, and must not let the buttons through while it applies.
const modal = readFileSync(new URL("../../src/components/landingpage/Modals/SignUpAsModal.tsx", import.meta.url), "utf8");

test("the sign-up form uses the guardian rule and disables sign-up while it applies", () => {
    assert.match(modal, /needsGuardian\(enrolledBy, dob\)/);
    assert.match(modal, /GUARDIAN_REQUIRED_MESSAGE/);
    const disabledCount = (modal.match(/disabled=\{signUpBlocked\}/g) ?? []).length;
    assert.equal(disabledCount, 2, "both the Google and the email sign-up buttons must be blocked");
});
