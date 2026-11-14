import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_MIN_NOTICE_MINUTES, noticePhrase, sanitizeNoticeMinutes } from "../../src/utils/wingtimeNotice.ts";

test("the default is three hours, as before", () => {
    assert.equal(DEFAULT_MIN_NOTICE_MINUTES, 180);
    assert.equal(noticePhrase(DEFAULT_MIN_NOTICE_MINUTES), "3 hours' notice");
});

test("the notice reads naturally in hours and in minutes", () => {
    assert.equal(noticePhrase(60), "1 hour's notice");
    assert.equal(noticePhrase(120), "2 hours' notice");
    assert.equal(noticePhrase(10), "10 minutes' notice");
    assert.equal(noticePhrase(1), "1 minute's notice");
    assert.equal(noticePhrase(90), "90 minutes' notice");
    assert.equal(noticePhrase(0), "0 minutes' notice");
});

test("only a sane number from the server is believed", () => {
    assert.equal(sanitizeNoticeMinutes(15), 15);
    assert.equal(sanitizeNoticeMinutes("20"), 20);
    assert.equal(sanitizeNoticeMinutes(0), 0);
    for (const bad of [-1, 1.5, "abc", null, undefined, NaN, {}, []]) {
        assert.equal(sanitizeNoticeMinutes(bad), DEFAULT_MIN_NOTICE_MINUTES, String(bad));
    }
});

test("a missing or empty value is never read as zero notice", () => {
    for (const empty of [null, "", "  ", []]) {
        assert.equal(sanitizeNoticeMinutes(empty), DEFAULT_MIN_NOTICE_MINUTES, JSON.stringify(empty));
    }
});
