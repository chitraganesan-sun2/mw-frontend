import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("the web CSP allows uploaded media (video) from the uploader host", () => {
    const cfg = read("next.config.mjs");
    assert.match(cfg, /"media-src 'self' blob: https:\/\/res\.cloudinary\.com"/);
});

test("upgrade-insecure-requests is production-only so http dev origins are not sent to https", () => {
    const cfg = read("next.config.mjs");
    assert.match(cfg, /NODE_ENV === "production" \? \["upgrade-insecure-requests"\]/);
    assert.doesNotMatch(cfg, /^\s*"upgrade-insecure-requests",?\s*$/m);
});

test("Android auto-backup is off (the session token lives in WebView storage)", () => {
    assert.match(read("android/app/src/main/AndroidManifest.xml"), /android:allowBackup="false"/);
});
