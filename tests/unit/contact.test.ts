import assert from "node:assert/strict";
import { test } from "node:test";

// constants/contact.ts reads NEXT_PUBLIC_* at import time, so each case imports a fresh copy.
const load = async (env: Record<string, string | undefined>) => {
    for (const key of ["NEXT_PUBLIC_SUPPORT_EMAIL"]) {
        if (env[key] === undefined) delete process.env[key];
        else process.env[key] = env[key];
    }
    return await import(`../../src/constants/contact.ts?${Math.random()}`);
};

test("the support email defaults to the address already used across the site", async () => {
    const { SUPPORT_EMAIL } = await load({});
    assert.equal(SUPPORT_EMAIL, "support@melodywings.org");
});

test("the support email can be overridden by configuration", async () => {
    const { SUPPORT_EMAIL } = await load({ NEXT_PUBLIC_SUPPORT_EMAIL: " help@example.org " });
    assert.equal(SUPPORT_EMAIL, "help@example.org");
});
