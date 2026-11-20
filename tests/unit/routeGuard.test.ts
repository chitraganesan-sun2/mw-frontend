import assert from "node:assert/strict";
import { test } from "node:test";
import {
    getRedirectForRoute,
    isPublicLandingRoute,
    reconcileOnboardedStatus,
} from "../../src/utils/routeGuard.ts";

const learner = (onboardedStatus: any) => ({ isAuthenticated: true, role: "learner" as const, onboardedStatus });
const volunteer = (onboardedStatus: any) => ({ isAuthenticated: true, role: "volunteer" as const, onboardedStatus });
const signedOut = { isAuthenticated: false, role: undefined, onboardedStatus: "" as const };

test("signed-out visitors bounce from gated areas but not from public pages or unknown paths", () => {
    assert.equal(getRedirectForRoute("/learner/schedule", signedOut), "/");
    assert.equal(getRedirectForRoute("/onboarding", signedOut), "/");
    assert.equal(getRedirectForRoute("/about-us", signedOut), null);
    assert.equal(getRedirectForRoute("/no-such-page", signedOut), null);
});

test("a token without a role is treated as signed out (no redirect loop)", () => {
    assert.equal(getRedirectForRoute("/volunteer/schedule", { isAuthenticated: true, role: undefined, onboardedStatus: "verification_completed" }), "/");
});

test("an unknown / forged status is normalised to details_pending, never granting access", () => {
    assert.equal(getRedirectForRoute("/learner/volunteer", learner("admin")), "/onboarding");
    assert.equal(getRedirectForRoute("/learner/volunteer", learner("")), "/onboarding");
});

test("pending learners go to verification, pending volunteers may browse", () => {
    assert.equal(getRedirectForRoute("/learner/schedule", learner("verification_pending")), "/onboarding/verification");
    assert.equal(getRedirectForRoute("/onboarding/verification", learner("verification_pending")), null);
    assert.equal(getRedirectForRoute("/volunteer/schedule", volunteer("verification_pending")), null);
});

test("verified members are kept in their own role area and away from landing pages", () => {
    assert.equal(getRedirectForRoute("/", learner("verification_completed")), "/learner/schedule");
    assert.equal(getRedirectForRoute("/learner/schedule", learner("verification_completed")), null);
    assert.equal(getRedirectForRoute("/volunteer/schedule", learner("verification_completed")), "/learner/schedule");
    assert.equal(getRedirectForRoute("/donate", volunteer("verification_completed")), null);
});

test("reconcileOnboardedStatus: the server value wins over the cookie", () => {
    assert.deepEqual(reconcileOnboardedStatus("verification_completed", "details_pending"), {
        status: "details_pending",
        changed: true,
    });
    assert.deepEqual(reconcileOnboardedStatus("verification_completed", "verification_completed"), {
        status: "verification_completed",
        changed: false,
    });
    assert.deepEqual(reconcileOnboardedStatus(undefined, "verification_pending"), {
        status: "verification_pending",
        changed: true,
    });
});

test("reconcileOnboardedStatus: missing or unknown server values are 'unverified', never trusted", () => {
    for (const bad of [null, undefined, "", "superuser", 5]) {
        assert.deepEqual(reconcileOnboardedStatus("verification_completed", bad), { status: null, changed: false });
    }
});

test("public landing routes include the static pages", () => {
    assert.equal(isPublicLandingRoute("/donate"), true);
    assert.equal(isPublicLandingRoute("/learner/schedule"), false);
});

test("/blogs is gone: it is neither public nor gated, so it falls through to the 404 page", () => {
    assert.equal(isPublicLandingRoute("/blogs"), false);
    assert.equal(isPublicLandingRoute("/blogs/1"), false);
    assert.equal(getRedirectForRoute("/blogs", signedOut), null);
    assert.equal(getRedirectForRoute("/blogs/1", signedOut), null);
});

test("signed-out visitors of /donate/history are sent to the landing page, not left to hit a 401", () => {
    assert.equal(getRedirectForRoute("/donate/history", signedOut), "/");
    // signed-in members still reach it
    assert.equal(getRedirectForRoute("/donate/history", learner("verification_completed")), null);
});
