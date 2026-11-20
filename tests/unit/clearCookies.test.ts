import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const auth = readFileSync(new URL("../../src/utils/auth.ts", import.meta.url), "utf8");

test("logging out clears the session cookies but keeps the cookie-consent choice", () => {
    const list = auth.match(/export const clearCookies = \(\) => \{\s*const cookies = \[([^\]]*)\]/)?.[1] ?? "";
    assert.ok(list.includes('"token"') && list.includes('"onboarded_status"') && list.includes('"lastActivity"'));
    assert.ok(!list.includes("cookieConsent"), "cookieConsent must survive log out / 401");
});
