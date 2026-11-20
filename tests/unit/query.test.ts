import assert from "node:assert/strict";
import { test } from "node:test";
import { buildQueryString } from "../../src/utils/query.ts";

test("only one '?' however many params are given (month + status used to produce ?month=..?status=..)", () => {
    const q = buildQueryString({ month: "2026-11", status: "accepted" });
    assert.equal(q, "?month=2026-11&status=accepted");
    assert.equal(q.split("?").length - 1, 1);
});

test("empty / missing params are skipped; no params gives an empty string", () => {
    assert.equal(buildQueryString({ month: undefined, status: "" }), "");
    assert.equal(buildQueryString({ month: "2026-11", status: undefined }), "?month=2026-11");
    assert.equal(buildQueryString({ status: "pending" }), "?status=pending");
});

test("values are URL-encoded", () => {
    assert.equal(buildQueryString({ q: "a b&c" }), "?q=a%20b%26c");
});
