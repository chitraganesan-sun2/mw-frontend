import assert from "node:assert/strict";
import { test } from "node:test";

// constants/contact.ts reads NEXT_PUBLIC_* at import time, so each case imports a fresh copy.
const load = async (env: Record<string, string | undefined>) => {
    for (const key of ["NEXT_PUBLIC_SUPPORT_EMAIL", "NEXT_PUBLIC_SUPPORT_PHONE"]) {
        if (env[key] === undefined) delete process.env[key];
        else process.env[key] = env[key];
    }
    return await import(`../../src/constants/contact.ts?${Math.random()}`);
};

test("tel: link keeps a leading + and digits only (dials on desktop, Android and iOS)", async () => {
    const { phoneToTelHref } = await load({});
    assert.equal(phoneToTelHref("+1 (916) 555-0100"), "tel:+19165550100");
    assert.equal(phoneToTelHref("916.555.0100"), "tel:9165550100");
    assert.equal(phoneToTelHref("  +91 98765 43210 "), "tel:+919876543210");
});

test("the support email defaults to the address already used across the site", async () => {
    const { SUPPORT_EMAIL } = await load({});
    assert.equal(SUPPORT_EMAIL, "support@melodywings.org");
});

test("the support email and phone come from configuration", async () => {
    const { SUPPORT_EMAIL, SUPPORT_PHONE, hasSupportPhone } = await load({
        NEXT_PUBLIC_SUPPORT_EMAIL: "help@example.org",
        NEXT_PUBLIC_SUPPORT_PHONE: " +1 916 555 0100 ",
    });
    assert.equal(SUPPORT_EMAIL, "help@example.org");
    assert.equal(SUPPORT_PHONE, "+1 916 555 0100");
    assert.equal(hasSupportPhone(SUPPORT_PHONE), true);
});

test("no phone number is invented: unset means not shown", async () => {
    const { SUPPORT_PHONE, hasSupportPhone } = await load({});
    assert.equal(SUPPORT_PHONE, "");
    assert.equal(hasSupportPhone(SUPPORT_PHONE), false);
    assert.equal(hasSupportPhone("call us"), false);
    assert.equal(hasSupportPhone("123"), false);
});
