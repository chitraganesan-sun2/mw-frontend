import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRequestOrigin } from "../../src/utils/requestOrigin.ts";

test("a plain http dev origin stays http (never forced to https)", () => {
    assert.equal(resolveRequestOrigin({ host: "localhost:3000", nextUrlOrigin: "http://localhost:3000" }), "http://localhost:3000");
});

test("behind a TLS-terminating proxy the forwarded scheme is used", () => {
    assert.equal(
        resolveRequestOrigin({ forwardedProto: "https", host: "melodywings.org", nextUrlOrigin: "http://localhost:3000" }),
        "https://melodywings.org"
    );
    assert.equal(
        resolveRequestOrigin({ forwardedProto: "https, http", host: "melodywings.org", nextUrlOrigin: "http://x" }),
        "https://melodywings.org"
    );
});

test("junk forwarded values fall back to the request URL; the host is never taken from untrusted forms", () => {
    assert.equal(resolveRequestOrigin({ forwardedProto: "javascript", nextUrlOrigin: "http://localhost:3000" }), "http://localhost:3000");
    assert.equal(
        resolveRequestOrigin({ host: "evil.com/<script>", nextUrlOrigin: "https://melodywings.org" }),
        "https://melodywings.org"
    );
});
