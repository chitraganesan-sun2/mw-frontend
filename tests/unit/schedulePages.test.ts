import test from "node:test";
import assert from "node:assert/strict";
import { mergeSessionPages, nextSessionsPage } from "../../src/utils/schedulePages.ts";

const page = (ids: string[], total: number) => ({ items: ids.map((session_id) => ({ session_id })), total });

test("merging concatenates pages in order and keeps the server total", () => {
    const merged = mergeSessionPages([page(["a", "b"], 5), page(["c", "d"], 5)]);
    assert.deepEqual(merged.items.map((i) => i.session_id), ["a", "b", "c", "d"]);
    assert.equal(merged.total, 5);
});

test("a session that shifted onto two pages is listed once", () => {
    const merged = mergeSessionPages([page(["a", "b"], 4), page(["b", "c"], 4)]);
    assert.deepEqual(merged.items.map((i) => i.session_id), ["a", "b", "c"]);
});

test("empty / missing pages give an empty list", () => {
    assert.deepEqual(mergeSessionPages(undefined), { items: [], total: 0 });
    assert.deepEqual(mergeSessionPages([]), { items: [], total: 0 });
});

test("next page is requested only while rows are still missing (more than the 100-row cap works)", () => {
    assert.equal(nextSessionsPage([page(Array.from({ length: 100 }, (_, i) => `s${i}`), 230)]), 2);
    assert.equal(nextSessionsPage([page(["a"], 1)]), undefined);
    assert.equal(nextSessionsPage([page(["a", "b"], 4), page(["c", "d"], 4)]), undefined);
    assert.equal(nextSessionsPage([page(["a", "b"], 9), page([], 9)]), undefined); // never loops on an empty page
});
