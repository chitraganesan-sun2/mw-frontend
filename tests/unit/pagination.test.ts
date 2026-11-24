import test from "node:test";
import assert from "node:assert/strict";
import { PAGE_PARAM_KEYS, pageToClamp } from "../../src/utils/pagination.ts";

test("page beyond the last page with matches jumps to the last page (audit repro: page=3 size=2 total=1)", () => {
    assert.equal(pageToClamp({ page: 3, size: 2, total: 1, itemCount: 0 }), 1);
    assert.equal(pageToClamp({ page: 9, size: 10, total: 25, itemCount: 0 }), 3);
});

test("no jump when the page has items, when there are no matches, or when the page exists", () => {
    assert.equal(pageToClamp({ page: 3, size: 2, total: 5, itemCount: 1 }), null);
    assert.equal(pageToClamp({ page: 3, size: 2, total: 0, itemCount: 0 }), null);
    assert.equal(pageToClamp({ page: 1, size: 10, total: 0, itemCount: 0 }), null);
    assert.equal(pageToClamp({ page: 2, size: 10, total: 15, itemCount: 0 }), null);
});

test("bad inputs never throw or loop", () => {
    assert.equal(pageToClamp({ page: NaN, size: 10, total: 3, itemCount: 0 }), null);
    assert.equal(pageToClamp({ page: 4, size: 0, total: 3, itemCount: 0 }), 3);
    assert.equal(pageToClamp({ page: 2, size: 10, total: undefined, itemCount: 0 }), null);
});

test("the reset list covers every page param used by the lists", () => {
    assert.deepEqual([...PAGE_PARAM_KEYS], ["page", "requests_page", "sessions_page"]);
});
