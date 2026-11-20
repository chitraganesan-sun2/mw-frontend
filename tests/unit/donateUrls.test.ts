import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SITE_URL, getDonationReturnOrigin, isSafeCheckoutRedirect } from "../../src/utils/donateUrls.ts";

test("native (Android WebView) returns to the public site, never https://localhost", () => {
    assert.equal(getDonationReturnOrigin({ isNative: true, windowOrigin: "https://localhost" }), DEFAULT_SITE_URL);
    assert.equal(
        getDonationReturnOrigin({ isNative: true, windowOrigin: "https://localhost", siteUrl: "https://www.melodywings.org/" }),
        "https://www.melodywings.org"
    );
});

test("web keeps the origin the donor is on", () => {
    assert.equal(getDonationReturnOrigin({ isNative: false, windowOrigin: "https://staging.example.org" }), "https://staging.example.org");
    assert.equal(getDonationReturnOrigin({ isNative: false }), DEFAULT_SITE_URL);
});

test("only plain https checkout URLs are followed", () => {
    assert.equal(isSafeCheckoutRedirect("https://checkout.stripe.com/c/pay/cs_test_123"), true);
    for (const bad of ["http://checkout.stripe.com/x", "javascript:alert(1)", "//evil.com", "https://user:pw@evil.com/", "", null, undefined, 5, "data:text/html,hi"]) {
        assert.equal(isSafeCheckoutRedirect(bad as any), false, String(bad));
    }
});

import { isStripeCheckoutSessionId } from "../../src/utils/donateUrls.ts";

test("the donation success page needs a real-looking Stripe session id", () => {
    assert.equal(isStripeCheckoutSessionId("cs_test_a1B2c3D4e5F6g7H8"), true);
    assert.equal(isStripeCheckoutSessionId("cs_live_a1B2c3D4e5F6g7H8"), true);
    for (const bad of [undefined, null, "", "cs_test_", "abc", "{CHECKOUT_SESSION_ID}", "cs_test_a b c d e f g h", "../x"]) {
        assert.equal(isStripeCheckoutSessionId(bad as any), false, String(bad));
    }
});
